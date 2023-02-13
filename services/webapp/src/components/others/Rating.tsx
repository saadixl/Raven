export default function Rating(props: any) {
    const { rating } = props;
    if(rating < 0) {
        return <></>;
    }
    const ratingClassName = rating >= 7 ? "top-rated" : "not-top-rated";
    return <code className={"rating-value " + ratingClassName}>{rating}</code>;
}