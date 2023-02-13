export default function TsTopic(props: any) {
    const { topic, rating } = props;
    const ratingClassName = rating >= 7 ? "top-rated" : "not-top-rated";
    return <code className={"rating-value " + ratingClassName}>{topic}</code>;
}