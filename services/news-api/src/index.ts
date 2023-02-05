import axios from "axios";
const { getCache, setCache } = require("./cache");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const Parser = require("rss-parser");
const parser = new Parser();
const app = express();
app.use(cors());
const port = 5001;
const OPENAI_API_URL = "http://openai-api:5002/test/moderation/";
app.use(bodyParser.json());

const MODERATED_NEWS_CACHE_KEY = "moderated-news-cache-key";
const NEWS_TOPICS_CACHE_KEY = "news-topics-cache-key";
const NEWS_LIMIT_PER_QUERY = 10;
const MODERATED_NEWS_CACHE_EXPIRY_MS = 60 * 60 * 1;
const NEWS_TOPICS_CACHE_EXPIRY_MS = 60 * 60 * 24 * 30;

type NewsListItem = {
  title: String;
  url: String;
  rating?: Number;
};

type Moderation = {
  rating?: Number;
};

function getRssUrl(query: String) {
  return `https://news.google.com/rss/search?q=${query}&hl=en-SG&gl=SG&ceid=SG:en`;
}

async function getFeedForQuery(query: String, n: Number) {
  const url = getRssUrl(query);
  let result = [];
  try {
    const feed = await parser.parseURL(url);
    result = feed.items || [];
  } catch (e) {
    console.log(
      `Failed to fetch news for ${query} for ${JSON.stringify(e, null, 4)}`
    );
  }
  return result.slice(0, n);
}

async function fetchNews(topics: Array<string>) {
  const news = {},
    promises: any = [];
  topics.forEach((query) => {
    promises.push(
      getFeedForQuery(query, NEWS_LIMIT_PER_QUERY).then((feed) => {
        news[query as keyof Object] = feed;
      })
    );
  });
  await Promise.all(promises);
  return news;
}

async function moderate(input: String): Promise<Moderation> {
  const data = { input };
  const response = await axios.post(OPENAI_API_URL, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
}

function curateModeratedNewsItem(newsListItem: any): NewsListItem {
  const { title, link } = newsListItem;
  return { title, url: link };
}

function sortModeratedNewsList(moderatedNewsList: any) {
  return moderatedNewsList.sort((a: any, b: any) => {
    return b.rating - a.rating;
  });
}

async function moderateNews(
  newsList: Array<NewsListItem>
): Promise<Array<NewsListItem>> {
  let moderatedNewsList: Array<NewsListItem> = [];
  const promises = newsList.map(async (newsListItem) => {
    const { title } = newsListItem;
    const { rating } = await moderate(title);
    return moderatedNewsList.push({
      ...curateModeratedNewsItem(newsListItem),
      rating,
    });
  });
  await Promise.all(promises);
  return sortModeratedNewsList(moderatedNewsList);
}

async function getModeratedNews() {
  let moderatedNews: any = {};
  const moderatedNewsCached = await getCache(MODERATED_NEWS_CACHE_KEY);
  if (moderatedNewsCached) {
    console.log("Serving from cache");
    moderatedNews = JSON.parse(moderatedNewsCached);
  } else {
    console.log("Serving directly");
    const savedTopics = await getTopicsFromCache();
    const news = await fetchNews(savedTopics);
    const topics = Object.keys(news);
    const promises = topics.map(async (topic: String) => {
      const newsListByTopic: any = news[topic as keyof Object];
      const moderatedNewsListByTopic = await moderateNews(newsListByTopic);
      moderatedNews[topic as keyof Object] = moderatedNewsListByTopic;
    });
    await Promise.all(promises);
    await setCache(
      MODERATED_NEWS_CACHE_KEY,
      JSON.stringify(moderatedNews),
      MODERATED_NEWS_CACHE_EXPIRY_MS
    );
  }
  return moderatedNews;
}

async function getTopicsFromCache() {
  const topicsString = await getCache(NEWS_TOPICS_CACHE_KEY);
  if(!topicsString) {
    return ['world'];
  }
  return JSON.parse(topicsString);
}

async function setTopicsFromCache(topics: Array<string>) {
  return setCache(
    NEWS_TOPICS_CACHE_KEY,
    JSON.stringify(topics),
    NEWS_TOPICS_CACHE_EXPIRY_MS
  );
}

app.get("/", async (req: any, res: any) => {
  res.send("Hello, world from news-api");
});

app.get("/get-news", async (req: any, res: any) => {
  const moderatedNews: any = await getModeratedNews();
  res.send(JSON.stringify(moderatedNews, null, 4));
});

app.get("/get-topics", async (req: any, res: any) => {
  const topics = await getTopicsFromCache();
  res.send(topics);
});

app.post("/set-topics", async (req: any, res: any) => {
  const { topics } = req.body;
  await setTopicsFromCache(topics);
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
