const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5001;
app.use(bodyParser.json());

app.get('/', async (req: any, res: any) => {
    res.send('Hello, world from news-api');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});