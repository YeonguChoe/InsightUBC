import {FormEventHandler, useMemo, useState, useRef} from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Alert from "react-bootstrap/Alert";
import Form from 'react-bootstrap/Form';
import {fetchAddDatasetData, fetchQueryData} from "../commons";
import Button from "react-bootstrap/Button";

export default function AddDatasetSection(props: any): JSX.Element {
	const [id, setID] = useState("");
	const [content, setContent] = useState<File>();
	const [kind, setKind] = useState("sections");
	const [show, setShow] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);


	const handleInput: FormEventHandler = (e) => {
		e.preventDefault();
	}

	const handleSubmit: FormEventHandler = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setShow(true);

		if (id.trim() === "") {
			setShow(true);
			setIsLoading(false);
			setError("no id given");
			return;
		}

		let payload: any = "";
		if (content !== undefined) {
			payload = await content.arrayBuffer();
		}

		// fetchAddDatasetData(await (content as File).arrayBuffer(), id, kind)
		fetchAddDatasetData(payload, id, kind)
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				if (data?.error) {
					setError(data.error);
					// setShow(true);
				} else {
					window.location.reload();
					return;
				}
				setIsLoading(false);
				props.onadd();
			})
			.catch((err) => {
				setError(err.message);
				setIsLoading(false);
			})
	}

	// Source:
	// https://react-bootstrap.github.io/forms/checks-radios/ and
	// https://react-bootstrap.github.io/forms/form-control/
	return (
		<Container fluid>
			<Row>
				<Form onSubmit={handleSubmit}>
				<Form.Group className = "mb-3">
					<h1>UBC Courses Query Engine</h1>
				</Form.Group>
				<Alert
					show={show}
					variant={isLoading ? "secondary" : "danger"}
					dismissible={isLoading ? false : true}
					onClose={(a,b) => {setError(""); setShow(false)}}
				>
					{isLoading ?
						<>Loading...</>
						: <>ERROR: {error}</>
					}
				</Alert>
				<Form.Group className="mb-3">
					<h4>Please Add Dataset Here &#10549; </h4>
					<Form.Control
						type ="text"
						placeholder="Enter Dataset ID Here"
						onChange={e => setID(e.target.value)}
						value={id}
					/>
				</Form.Group>
					<Form.Group className="mb-3">
							<Form.Check
								type = 'radio'
								name = "radioGroup"
								label="Sections"
								value="sections"
								onChange={(e) => {setKind(e.target.value)}}
								defaultChecked
							/>
							<Form.Check
								type = 'radio'
								name = "radioGroup"
								label={`Rooms`}
								value="rooms"
								onChange={(e) => {setKind(e.target.value)}}
							/>
					</Form.Group>
				<Form.Group controlId="formFile" className="mb-3">
					<Form.Control
						type="file"
						onChange={e => setContent((e.target as any).files[0] as any)}
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Button
						variant="primary"
						type="submit">
						Submit
					</Button>
				</Form.Group>
				</Form>
			</Row>
		</Container>
	);
}
