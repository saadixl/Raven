import ProgressBar from 'react-bootstrap/ProgressBar';

export default function Loader(props: any) {
    const { show } = props;
    if (!show) {
        return <></>;
    } else {
        return (
            <div className="loader">
                <ProgressBar striped animated variant="warning" now={100} />
            </div>
        );
    }
}