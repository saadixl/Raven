const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5009;
app.use(bodyParser.json());

app.get('/', async (req: any, res: any) => {
    res.send('Hello, world from test');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});