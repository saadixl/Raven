import type { NewsListItem } from './types';

export function getModeratedNewsByTopicCacheKey(topic: string) {
    return `moderated-news-${topic}`;
}

export function getTopicsCacheKey(browserId: string) {
    return `news-topic-${browserId}`;
}

export function getRssUrl(query: String) {
    return `https://news.google.com/rss/search?q=${query}&hl=en-SG&gl=SG&ceid=SG:en`;
}

export function curateModeratedNewsItem(newsListItem: any): NewsListItem {
    const { title, link } = newsListItem;
    return { title, url: link };
}

export function sortModeratedNewsList(moderatedNewsList: any) {
    return moderatedNewsList.sort((a: any, b: any) => {
        return b.rating - a.rating;
    });
}