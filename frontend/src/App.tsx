import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import DataQuerySection from "./components/DataQuerySection/DataQuerySection";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

// import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import ListDataSets from './components/ListDataSets';
import AddDatasetSection from './components/AddDatasetSection/addDatasetSection';

function App() {
	const [rerender,setReRender] = useState(true)
	return (
		<Container fluid>
			{/* TODO: Add more sections here... */}
			<Row>
				<AddDatasetSection onadd = {() => setReRender(current => !current)}/>
			</Row>
			<Row>
				<Col>
					<ListDataSets />
				</Col>
			</Row>
			<Row>
				<Col>
					<DataQuerySection />
				</Col>
			</Row>
		</Container>

	)
}

export default App
