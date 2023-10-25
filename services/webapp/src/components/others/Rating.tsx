export default function Rating(props: any) {
    const { rating } = props;
    if(rating < 0) {
        return <></>;
    }
    const ratingClassName = rating >= 8 ? "top-rated" : ( rating === 7 ? "mid-rated" : "not-top-rated");
    return <code className={"rating-value " + ratingClassName}>{rating}</code>;
}