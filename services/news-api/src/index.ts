const express = require('express');
const bodyParser = require('body-parser');
const Parser = require('rss-parser');
const parser = new Parser();
const app = express();
const port = 5001;
app.use(bodyParser.json());

const TOPICS = [
    'world',
    'singapore',
    'dhaka',
    'bangladesh'
];

const NEWS_LIMIT_PER_QUERY = 5;

const getRssUrl = (query: String) => {
    return `https://news.google.com/rss/search?q=${query}&hl=en-SG&gl=SG&ceid=SG:en`;
};

const getFeedForQuery = async (query: String, n: Number) => {
    const url = getRssUrl(query);
    let result = [];
    try {
        const feed = await parser.parseURL(url);
        result = feed.items || [];
    } catch(e) {
        console.log(`Failed to fetch news for ${query} for ${JSON.stringify(e, null, 4)}`);
    }
    return result.slice(0, n);
};

const fetchNews = async (topics: Array<string>) => {
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
};

app.get('/', async (req: any, res: any) => {
    res.send('Hello, world from news-api');
});

app.get('/get-news', async (req: any, res: any) => {
    const news = await fetchNews(TOPICS);
    res.send(JSON.stringify(news, null, 4));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});