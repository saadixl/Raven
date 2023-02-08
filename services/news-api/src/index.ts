import axios from "axios";
const { getCache, setCache, delCache } = require("./cache");
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

function getModeratedNewsByTopicCacheKey(topic: string) {
  return `moderated-news-${topic}`;
}

function getTopicsCacheKey(browserId: string) {
  return `news-topic-${browserId}`;
}

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

async function moderateNews(newsList: any) {
  let moderatedNewsList: Array<NewsListItem> = [];
  const promises = newsList.map(async (newsListItem: any) => {
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

async function getNewsByTopic(topic: string) {
  return await getFeedForQuery(topic, NEWS_LIMIT_PER_QUERY);
}

async function getModeratedNewsListByTopic(topic: string) {
  let moderatedNewsByTopic: any = {};
  const cacheKeyByTopic = getModeratedNewsByTopicCacheKey(topic);
  const moderatedNewsByTopicCached = await getCache(cacheKeyByTopic);
  if (moderatedNewsByTopicCached) {
    moderatedNewsByTopic = JSON.parse(moderatedNewsByTopicCached);
  } else {
    // Get raw news by topic
    const newsByTopic = await getNewsByTopic(topic);
    // Moderate raw news news
    moderatedNewsByTopic = await moderateNews(newsByTopic);
    // Cache the moderated news
    await setCache(
      cacheKeyByTopic,
      JSON.stringify(moderatedNewsByTopic),
      MODERATED_NEWS_CACHE_EXPIRY_MS
    );
  }
  return moderatedNewsByTopic;
}

async function getModeratedNews(browserId: string) {
  const cachedTopics = await getTopicsFromCache(browserId);
  let moderatedNews: any = {};
  const promises = cachedTopics.map(async (topic: any) => {
    moderatedNews[topic as keyof Object] = await getModeratedNewsListByTopic(
      topic
    );
  });
  await Promise.all(promises);
  return moderatedNews;
}

async function getTopicsFromCache(browserId: string) {
  const topicsString = await getCache(getTopicsCacheKey(browserId));
  if (!topicsString) {
    return ["world"];
  }
  return JSON.parse(topicsString);
}

async function setTopicsFromCache(topics: Array<string>, browserId: string) {
  return setCache(
    getTopicsCacheKey(browserId),
    JSON.stringify(topics),
    NEWS_TOPICS_CACHE_EXPIRY_MS
  );
}

app.get("/", async (req: any, res: any) => {
  res.send("Hello, world from news-api");
});

app.post("/get-news", async (req: any, res: any) => {
  const { browserId } = req.body;
  const moderatedNews: any = await getModeratedNews(browserId);
  res.send(JSON.stringify(moderatedNews, null, 4));
});

app.post("/get-topics", async (req: any, res: any) => {
  const { browserId } = req.body;
  const topics = await getTopicsFromCache(browserId);
  res.send(topics);
});

app.post("/set-topics", async (req: any, res: any) => {
  const { topics, browserId } = req.body;
  await setTopicsFromCache(topics, browserId);
  await delCache(MODERATED_NEWS_CACHE_KEY);
  res.send("OK");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
