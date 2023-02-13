import axios from "axios";
import {
    NEWS_LIMIT_PER_QUERY,
    NEWS_TOPICS_CACHE_EXPIRY_MS,
    MODERATED_NEWS_CACHE_EXPIRY_MS,
    OPENAI_API_URL,
    NEWS_SLICE_PER_QUERY,
} from './constants';
import {
    getRssUrl,
    getModeratedNewsByTopicCacheKey,
    getTopicsCacheKey,
    curateModeratedNewsItem,
    sortModeratedNewsList,
} from './utils';
import type { NewsListItem, Moderation } from './types';
import { getCache, setCache, delCache } from './cache';

const Parser = require("rss-parser");
const parser = new Parser();

export async function getNewsByTopic(topic: string) {
    return await getFeedForQuery(topic, NEWS_LIMIT_PER_QUERY);
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

export async function setTopicsFromCache(topics: Array<string>, browserId: string) {
    return setCache(
        getTopicsCacheKey(browserId),
        JSON.stringify(topics),
        NEWS_TOPICS_CACHE_EXPIRY_MS
    );
}

export async function getTopicsFromCache(browserId: string) {
    const topicsString: any = await getCache(getTopicsCacheKey(browserId));
    if (!topicsString) {
        return ["world"];
    }
    return JSON.parse(topicsString);
}

export async function getModeratedNews(browserId: string) {
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

async function getModeratedNewsListByTopic(topic: string) {
    let moderatedNewsByTopic: any = {};
    const cacheKeyByTopic = getModeratedNewsByTopicCacheKey(topic);
    const moderatedNewsByTopicCached: any = await getCache(cacheKeyByTopic);
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
    return moderatedNewsByTopic.slice(0, NEWS_SLICE_PER_QUERY);
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

async function moderate(input: String): Promise<Moderation> {
    try {
        const data = { input };
        const response = await axios.post(OPENAI_API_URL, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.log('moderate method failed: ', error);
        return { rating: -1 };
    }
}