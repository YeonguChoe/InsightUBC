import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import Spinners from "react-bootstrap/Spinner";

import ResultTable from "./ResultTable";

interface QueryResultDisplayProps {
	isLoading: boolean,
	error: string | undefined,
	result: Array<{[key: string]: any}>
};

export default function QueryResultDisplay(props: QueryResultDisplayProps): JSX.Element {
	let content;

	if (props.isLoading === true) {
		content = (
			<Alert variant="info" className="align-items-center d-flex gap-3">
				<Spinners animation="border" as="span" role="status" />
				<span>Retrieving data...</span>
			</Alert>
		)
	} else if (typeof props.error === "string") {
		content = (
			<Alert variant="danger">
				ERROR: {props.error}
			</Alert>
		)
	} else if (props.result?.length === 0) {
		content = (
			<Alert variant="secondary">No data...</Alert>
		)
	} else {
		content = <ResultTable result={props.result} />;
	}

	return (
		<Container>
			<h5>Result &#10549;</h5>
			{content}
		</Container>
	)
}
