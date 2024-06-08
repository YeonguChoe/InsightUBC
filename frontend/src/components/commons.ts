const PORT = 4321
const SERVER_URL = `http://localhost:${PORT}`

export function fetchQueryData(query: string): Promise<Response> {
	const requestOptions: RequestInit = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		mode: "cors",
		body: query
	};

	return fetch(`${SERVER_URL}/query`, requestOptions);
}

export function fetchDeleteData(id: string): Promise<Response> {
	const requestOptions: RequestInit = {
		method: "DELETE"
	};
	return fetch(`${SERVER_URL}/dataset/${id}`, requestOptions);
}

export function fetchDatasetList(): Promise<Response> {
	const requestOptions: RequestInit = {
		method: "GET"
	};

	return fetch(`${SERVER_URL}/datasets`, requestOptions);
}

export async function fetchAddDatasetData(content: any, id: string, kind: string): Promise<Response> {
	const requestOptions: RequestInit = {
		method: "PUT",
		headers: {
			"Content-Type": "application/x-zip-compressed"
		},
		body: content
	};

	return fetch(`${SERVER_URL}/dataset/${id.trim()}/${kind.trim()}`, requestOptions);
}
