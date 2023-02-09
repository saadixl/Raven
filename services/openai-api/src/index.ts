import { openAiModeration } from './services';
import { getRatingsFromModerationResponse } from './utils';
import { PORT } from './constants';

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

app.get("/", async (req: any, res: any) => {
  res.send("Hello, world from openai-api");
});

app.post("/test/moderation", async (req: any, res: any) => {
  const { input } = req.body;
  const result = await openAiModeration(input);
  const rating = getRatingsFromModerationResponse(result);
  res.send({
    rating,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
