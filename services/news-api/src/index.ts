import axios from 'axios';
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const Parser = require('rss-parser');
const parser = new Parser();
const app = express();
app.use(cors());
const port = 5001;
const OPENAI_API_URL = 'http://openai-api:5002/test/moderation/';
app.use(bodyParser.json());

const TOPICS = [
    'world',
    'singapore',
    'dhaka',
    'bangladesh'
];

const NEWS_LIMIT_PER_QUERY = 5;

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
    } catch(e) {
        console.log(`Failed to fetch news for ${query} for ${JSON.stringify(e, null, 4)}`);
    }
    return result.slice(0, n);
}

async function fetchNews(topics: Array<string>) {
    const news = {}, promises: any = [];
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
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

function curateModeratedNewsItem(newsListItem: any): NewsListItem {
    const { title, link } = newsListItem;
    return { title, url: link };
}

async function moderateNews(newsList: Array<NewsListItem>): Promise<Array<NewsListItem>> {
    let moderatedNewsList: Array<NewsListItem> = [];
    const promises = newsList.map(async (newsListItem) => {
        const { title } = newsListItem;
        const { rating } = await moderate(title);
        return moderatedNewsList.push({
            ...curateModeratedNewsItem(newsListItem),
            rating
        });
    });
    await Promise.all(promises);
    return moderatedNewsList;
}

app.get('/', async (req: any, res: any) => {
    res.send('Hello, world from news-api');
});

app.get('/get-news', async (req: any, res: any) => {
    const news = await fetchNews(TOPICS);
    let moderatedNews: any = {};
    const topics = Object.keys(news);
    const promises = topics.map(async (topic: String) => {
        const newsListByTopic: any = news[topic as keyof Object];
        const moderatedNewsListByTopic = await moderateNews(newsListByTopic);
        moderatedNews[topic as keyof Object] = moderatedNewsListByTopic;
    });
    await Promise.all(promises);
    res.send(JSON.stringify(moderatedNews, null, 4));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});