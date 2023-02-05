import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";
import Masonry from "react-masonry-css";
import CreatableSelect from "react-select/creatable";
const newsApiDomain = "http://localhost:5001";
const GET_NEWS_API_URL = `${newsApiDomain}/get-news/`;
const GET_TOPICS_API_URL = `${newsApiDomain}/get-topics/`;
const SET_TOPICS_API_URL = `${newsApiDomain}/set-topics/`;

type SelectOption = {
  value: String;
  label: String;
};

function App() {
  const [news, setNews] = useState();
  const [topStories, setTopStories] = useState([]);
  const [selectOptions, setSelectOptions] = useState<Array<SelectOption>>([]);
  const [selectedOptions, setSelectedOptions] = useState<Array<SelectOption>>(
    []
  );

  async function getNews() {
    console.log("Calling news api");
    try {
      const response = await axios(GET_NEWS_API_URL);
      console.log("news response", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  async function getTopics() {
    console.log("Calling get topics api");
    try {
      const response = await axios(GET_TOPICS_API_URL);
      console.log("topics response", response.data);
      const topics: Array<string> = response.data;
      const newSelectedOptions = formSelectOptions(topics);
      setSelectedOptions(newSelectedOptions);
    } catch (error) {
      console.log(error);
    }
  }

  async function setTopics(topics: Array<string>) {
    console.log("Calling set topics api");
    try {
      await axios.post(
        SET_TOPICS_API_URL,
        {
          topics,
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

  function formSelectOptions(topics: Array<string>) {
    return topics.map((topic: string) => {
      return { value: topic, label: topic };
    });
  }

  function stipSelectOptions(selectOptions: any) {
    return selectOptions.map((option: any) => {
      return option.value;
    });
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
      return <p className="loading-text">news loading..</p>;
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
      1000: 2,
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

  function handleSelectCreate(inputValue: string) {
    const newSelectedOptions = [
      ...selectedOptions,
      { value: inputValue, label: inputValue },
    ];
    setSelectedOptions(newSelectedOptions);
    setTopics(stipSelectOptions(newSelectedOptions));
  }

  async function fetchNews() {
    const news = await getNews();
    const { restOfTheNews, topStories } = extractTopStories(news);
    setNews(restOfTheNews);
    setTopStories(topStories);
  }

  useEffect(() => {
    getTopics();
    fetchNews();
  }, []);

  return (
    <div className="App">
      <Row>
        <Col className="logo-container" md={12}>
          <p>Raven</p>
        </Col>
        <Col md={{ span: 8, offset: 2 }}>
          <CreatableSelect
            value={selectedOptions}
            onCreateOption={handleSelectCreate}
            theme={(theme) => ({
              ...theme,
              background: "#023950",
              borderRadius: 5,
              colors: {
                ...theme.colors,
                text: "white",
                primary25: "orange",
                primary: "orange",
              },
            })}
            placeholder="Type topics"
            isMulti
          />
        </Col>
      </Row>
      {renderNews(news)}
    </div>
  );
}

export default App;
