import uuid from "react-uuid";

export function getBrowserId() {
    let browserId = localStorage.getItem("browserId");
    if (!browserId) {
        browserId = uuid();
        localStorage.setItem("browserId", browserId);
    }
    return browserId;
}

export function formSelectOptions(topics: Array<string>) {
    return topics.map((topic: string) => {
        return { value: topic, label: topic };
    });
}

export function stipSelectOptions(selectOptions: any) {
    return selectOptions.map((option: any) => {
        return option.value;
    });
}

export function extractTopStories(news: any) {
    let restOfTheNews: any = {};
    const topStories: any = [];
    Object.keys(news).forEach((topic) => {
        const newsByTopic = news[topic];
        restOfTheNews[topic] = [];
        newsByTopic.forEach((newsItem: any) => {
            if (newsItem.rating >= 7) {
                topStories.push(newsItem);
            } else {
                restOfTheNews[topic].push(newsItem);
            }
        });
    });
    return {
        restOfTheNews,
        topStories: topStories.sort((a: any, b: any) => {
            return b.rating - a.rating;
        }),
    };
}