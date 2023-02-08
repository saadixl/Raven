import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Masonry from "react-masonry-css";
import { formSelectOptions, stipSelectOptions, extractTopStories } from '../../tools/utils';
import type { SelectOption } from '../../types';
import { getNews, getTopics, setTopics } from '../../tools/apis';
import Header from '../others/Header';
import Rating from '../others/Rating';

export default function HomeScreen() {
    const [news, setNews] = useState();
    const [topStories, setTopStories] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState<Array<SelectOption>>([]);

    async function fetchTopics() {
        const topics: Array<string> = await getTopics();
        const newSelectedOptions = formSelectOptions(topics);
        setSelectedOptions(newSelectedOptions);
    }

    async function fetchNews() {
        const news = await getNews();
        const { restOfTheNews, topStories } = extractTopStories(news);
        setNews(restOfTheNews);
        setTopStories(topStories);
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

    async function handleSelectCreate(inputValue: string) {
        const newSelectedOptions = [
            ...selectedOptions,
            { value: inputValue, label: inputValue },
        ];
        setSelectedOptions(newSelectedOptions);
        await setTopics(stipSelectOptions(newSelectedOptions));
        window.location.reload();
    }

    async function handleSelectChange(newSelectedOptions: any) {
        setSelectedOptions(newSelectedOptions);
        await setTopics(stipSelectOptions(newSelectedOptions));
        window.location.reload();
    }

    useEffect(() => {
        fetchTopics();
        fetchNews();
    }, []);

    return (
        <div className="App">
            <Header
                selectedOptions={selectedOptions}
                handleSelectCreate={handleSelectCreate}
                handleSelectChange={handleSelectChange}
            />
            {renderNews(news)}
        </div>
    );
}