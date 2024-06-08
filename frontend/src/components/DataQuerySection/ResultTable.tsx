import Table from "react-bootstrap/Table";

interface ResultTableProps {
	result: Array<{[key: string]: any}>
}

function generateHeaders(result: Array<{[key: string]: any}>) {
	return (
		<tr>
			{Object.keys(result[0]).map((value) => (
				<th key={value}>{value}</th>
			))}
		</tr>
	)
}

function generateBody(result: Array<{[key: string]: any}>) {
	return result.map((rowData: {[key: string]: any}) => (
		<tr>
			{Object.values(rowData).map((value) => (
				<td key={value}>{value}</td>
			))}
		</tr>
	))
}

export default function ResultTable(props: ResultTableProps) {
	return (
		<Table striped hover bordered>
			<thead>
				{generateHeaders(props.result)}
			</thead>
			<tbody>
				{generateBody(props.result)}
			</tbody>
		</Table>
	)
}
