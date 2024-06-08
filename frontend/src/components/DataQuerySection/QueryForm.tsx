import {
	FormEventHandler,
	MouseEventHandler,
	SetStateAction,
	useState
} from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

interface QueryFormProps {
	onSubmit: FormEventHandler,
	onChange: FormEventHandler,
	value: string,
}

export default function QueryForm(props: QueryFormProps) {
	const [show, setShow] = useState(false);

	/**
	 * Disable TAB switching focus and instead insert a TAB character inside the <textarea> element
	 * Source: https://benborgers.com/posts/textarea-tab
	 */
	const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
		if (e.key === "Tab") {

			e.preventDefault();
			e.currentTarget.setRangeText(
				"	",
				e.currentTarget.selectionStart,
				e.currentTarget.selectionEnd,
				"end"
			)
		}
	}

	return (
		<Form onSubmit={props.onSubmit}>
			<h5>Query &#10549;</h5>
			<Form.Group className="mb-3" controlId="form.queryForm">
				<Form.Control
					as="textarea"
					rows={10}
					spellCheck={false}
					onChange={props.onChange}
					onKeyDown={handleKeyDown}
					style={{
						tabSize: 4,
						fontFamily: "monospace",
						fontSize: "1rem"
					}}
				/>
			</Form.Group>
			<Button variant="primary" type="submit">Submit</Button>
		</Form>
	)
}
