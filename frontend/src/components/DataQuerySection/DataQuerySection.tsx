import {FormEventHandler, useMemo, useState} from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import QueryForm from "./QueryForm";
import QueryResultDisplay from "./QueryResultDisplay";
import {fetchQueryData} from "../commons";

export default function DataQuerySection(): JSX.Element {
	const [query, setQuery] = useState("");
	const [result, setResult] = useState([]);
	const [error, setError] = useState(undefined);
	const [isLoading, setIsLoading] = useState(false);

	const handleInput: FormEventHandler = (e) => {
		e.preventDefault();
		setQuery((e.target as HTMLFormElement).value);
	}

	const handleSubmit: FormEventHandler = (e) => {
		e.preventDefault();
		setIsLoading(true);

		fetchQueryData(query)
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				if (data?.error) {
					setError(data.error);
					setResult([]);
				} else {
					setResult(data.result);
					setError(undefined);
				}
				setIsLoading(false);
			})
			.catch((err) => {
				setResult([]);
				setError(err.message);
				setIsLoading(false);
			})
	}

	return (
		<Container fluid className="mb-3 mt-3">
			<Row>
				<h3>Dataset Query Section</h3>
			</Row>
			<Row>
				<Col>
					<QueryForm
						onChange={handleInput}
						onSubmit={handleSubmit}
						value={query}
					/>
				</Col>
				<Col>
					<QueryResultDisplay
						isLoading={isLoading}
						error={error}
						result={result}
					/>
				</Col>
			</Row>
		</Container>
	);
}
