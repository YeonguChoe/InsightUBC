import { Col, Table, Container, Row } from "react-bootstrap"
import { useEffect, useState } from "react"
import { fetchDatasetList, fetchDeleteData } from "./commons"
import Button from 'react-bootstrap/Button';

export default function ListDataSets() {
	const [datasets, setDatasets] = useState([])

	const theDataSets = async () => {
		const response = await fetchDatasetList();
		const theJson = await response.json();
		setDatasets(theJson.result);
	};

	useEffect(() => {
		theDataSets();
	}, [])

	if (datasets.length === 0) {
		return <div><h3>No datasets available...</h3></div>
	}

	return (
		<Container>
			<Row>
				<Col>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>ID</th>
								<th>Kind</th>
								<th>Num rows</th>
								<th>Remove</th>
							</tr>
						</thead>
						<tbody>

							{datasets.map((selectedDataset: any) => (
								<tr key={selectedDataset.id}>
									<td>{selectedDataset.id}</td>
									<td>{selectedDataset.kind}</td>
									<td>{selectedDataset.numRows}</td>
									<td><Button onClick={
										(e) => {
											fetchDeleteData(selectedDataset.id).then((response) => {
												return response.json();
											}).then((json) => {
												theDataSets();
											});
										}}
										variant="outline-danger" > remove</Button>{' '}</td>
								</tr>
							))}
						</tbody>
					</Table>
				</Col>
			</Row>
		</Container >
	)
}

