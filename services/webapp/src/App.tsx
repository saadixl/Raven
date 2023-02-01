import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Container } from "react-bootstrap";
import Masonry from "react-masonry-css";
const NEWS_API_URL = `http://mh7.pw:5001/get-news/`;

function App() {
  const [news, setNews] = useState();
  const [topStories, setTopStories] = useState([]);

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

  function Rating(props: any) {
    const { rating } = props;
    const ratingClassName = rating >= 7 ? "top-rated" : "not-top-rated";
    return <code className={"rating-value " + ratingClassName}>{rating}</code>;
  }

  function renderNewsByTopic(
    topic: String,
    newsItems: any,
    additionalClass: string
  ) {
    const newsItemsComps = newsItems.map((newsItem: any) => {
      const { title, url, rating } = newsItem;
      return (
        <li className={"news-item " + additionalClass}>
          <Rating rating={rating} />{" "}
          <a className="news-url" href={url} target="__blank">
            {title}
          </a>
        </li>
      );
    });
    return (
      <div className="news-container">
        <h5 className="topic-title">{topic.toUpperCase()}</h5>
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
      const newsByTopicComp = renderNewsByTopic(
        topic,
        newsByTopic,
        "rest-of-the-stories"
      );
      comps.push(newsByTopicComp);
    });
    const breakpointColumnsObj = {
      default: 4,
      1600: 3,
      1200: 2,
      500: 1,
    };
    return (
      <Container fluid>
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {renderNewsByTopic("top stories", topStories, "top-stories")}
            {comps}
          </Masonry>
      </Container>
    );
  }

  function extractTopStories(news: any) {
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

  async function fetchNews() {
    const news = await getNews();
    const { restOfTheNews, topStories } = extractTopStories(news);
    setNews(restOfTheNews);
    setTopStories(topStories);
  }

  useEffect(() => {
    fetchNews();
  }, []);

  return <div className="App">{renderNews(news)}</div>;
}

export default App;
