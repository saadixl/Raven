import { Row, Col } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";

export default function Header(props: any) {
    const { selectedOptions, handleSelectCreate, handleSelectChange } = props;

    return (
        <Row>
            <Col className="logo-container" md={12}>
                <p>Raven</p>
            </Col>
            <Col md={{ span: 8, offset: 2 }}>
                <CreatableSelect
                    value={selectedOptions}
                    onCreateOption={handleSelectCreate}
                    onChange={handleSelectChange}
                    theme={(theme: any) => ({
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
    );
}