import { delCache } from './cache';
import {
    MODERATED_NEWS_CACHE_KEY,
    PORT
} from './constants';
import {
    getModeratedNews,
    getTopicsFromCache,
    setTopicsFromCache
} from './services';

const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
