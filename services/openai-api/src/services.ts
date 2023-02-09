import axios from "axios";
import { API_URL, API_KEY, MODELS } from './constants';

async function openAiPostRequest(model: string, data: any): Promise<any> {
    const response = await axios.post(`${API_URL}/${model}`, data, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
    });
    return response.data;
}

export async function openAiModeration(input: string): Promise<any> {
    const response = await openAiPostRequest(MODELS.MODERATIONS, {
        input,
    });
    return response;
}