import axios from 'axios';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5002;
app.use(bodyParser.json());

const API_URL = 'https://api.openai.com/v1';
const API_KEY = process.env.OPEN_AI_API_KEY;
const MODELS = {
    MODERATIONS: 'moderations' 
};

async function openAiPostRequest(model: string, data: any): Promise<any> {
    const response = await axios.post(
        `${API_URL}/${model}`,
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        }
    );
    return response.data;
}

async function openAiModeration(input: string): Promise<any> {
    const response = await openAiPostRequest(MODELS.MODERATIONS, {
        input
    });
    return response;
}

app.get('/', async (req: any, res: any) => {
    res.send('Hello, world from openai-api');
});

app.post('/test/moderation', async (req: any, res: any) => {
    const { input } = req.body;
    const result = await openAiModeration(input);
    res.send(result);
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});