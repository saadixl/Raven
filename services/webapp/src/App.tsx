import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
const NEWS_API_URL = 'http://localhost:5001/get-news/';

function App() {
  const [news, setNews] = useState();

  async function getNews() {
    console.log('Calling news api');
    try {
    const response = await axios(NEWS_API_URL);
    console.log("response", response);
    return response.data;
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  function renderNewsByTopic(topic: String, newsItems: any) {
    const newsItemsComps = newsItems.map((newsItem: any) => {
      const { title, url, rating } = newsItem;
      return (<li>
        <code>{rating}</code> <a href={url} target="__blank">{title}</a>
      </li>);
    });
    return (<div>
      <h3>{topic}</h3>
      <ul>
        {newsItemsComps}
      </ul>
    </div>);
  }

  function renderNews(news: any) {
    if(!news) {
      return <p>news loading..</p>;
    }
    const comps: any = [];
    Object.keys(news).forEach((topic) => {
      const newsByTopic = news[topic];
      const newsByTopicComp = renderNewsByTopic(topic, newsByTopic);
      comps.push(newsByTopicComp);
    });
    return (<div>
      {comps}
    </div>);
  }

  async function fetchNews() {
    const news = await getNews();
    setNews(news);
  }

  useEffect(() => {
    fetchNews();
  }, []);

  console.log("news", news);

  return (
    <div className="App">
      {renderNews(news)}
    </div>
  );
}

export default App;
