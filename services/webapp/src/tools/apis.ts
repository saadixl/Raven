import axios from "axios";
import { getBrowserId } from './utils';

const {
    GET_NEWS_API_URL,
    GET_TOPICS_API_URL,
    SET_TOPICS_API_URL
} = require('../constants');

export async function getNews() {
    console.log("Calling news api");
    try {
        const response = await axios.post(
            GET_NEWS_API_URL,
            {
                browserId: getBrowserId(),
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("news response", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

export async function getTopics() {
    console.log("Calling get topics api");
    try {
        const response = await axios.post(
            GET_TOPICS_API_URL,
            {
                browserId: getBrowserId(),
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("topics response", response.data);
        return response.data;
    } catch (error) {
        console.log(error);
        return;
    }
}

export async function setTopics(topics: Array<string>) {
    console.log("Calling set topics api");
    try {
        await axios.post(
            SET_TOPICS_API_URL,
            {
                topics,
                browserId: getBrowserId(),
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.log(error);
    }
}

export function stipSelectOptions(selectOptions: any) {
    return selectOptions.map((option: any) => {
        return option.value;
    });
}