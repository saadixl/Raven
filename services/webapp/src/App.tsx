import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Container, Row, Col } from 'react-bootstrap';
const NEWS_API_URL = `http://mh7.pw:5001/get-news/`;

function App() {
  const [news, setNews] = useState();

  async function getNews() {
    console.log("Calling news api");
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
      return (
        <li className="news-item">
          <code className="rating-value">{rating}</code>{" "}
          <a className="news-url" href={url} target="__blank">
            {title}
          </a>
        </li>
      );
    });
    return (
      <div className="news-container">
        <h5>{topic.toUpperCase()}</h5>
        <ul className="news-item-container">{newsItemsComps}</ul>
      </div>
    );
  }

  function renderNews(news: any) {
    if (!news) {
      return <p>news loading..</p>;
    }
    const comps: any = [];
    Object.keys(news).forEach((topic) => {
      const newsByTopic = news[topic];
      const newsByTopicComp = renderNewsByTopic(topic, newsByTopic);
      comps.push(newsByTopicComp);
    });
    return (<Container fluid>
      <Row>
        <Col md={8}>
          <div className="news-container">
            <h5>TOP STORIES</h5>
          </div>
        </Col>
        <Col md={4}>
          {comps}
        </Col>
      </Row>
    </Container>);
  }

  async function fetchNews() {
    const news = await getNews();
    setNews(news);
  }

  useEffect(() => {
    fetchNews();
  }, []);

  console.log("news", news);

  return <div className="App">{renderNews(news)}</div>;
}

export default App;
