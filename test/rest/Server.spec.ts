import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect} from "chai";
import request, {Response} from "supertest";
import {clearDisk, getContentFromArchivesRaw} from "../TestUtil";
import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import {folderTest} from "@ubccpsc310/folder-test";

describe("Server", () => {
	let facade: InsightFacade;
	let server: Server;
	let port: number;
	let SERVER_URL: string;

	let sections: string;
	let rooms: string;

	const ZIP_TYPE = "application/x-zip-compressed";
	const JSON_TYPE = "application/json";

	before(async () => {
		port = 4321;
		facade = new InsightFacade();
		server = new Server(port);
		SERVER_URL = `http://localhost:${port}`;

		sections = getContentFromArchivesRaw("pair.zip");
		rooms = getContentFromArchivesRaw("campus.zip");

		// TODO: start server here once and handle errors properly
		server.start()
			.then(() => {
				// console.log("Server::start() - Server started");
				// console.log(`Server::start() - Server listening at http://localhost:${port}`);
			})
			.catch((error) => {
				// console.error(`Server::start() - ERROR: ${error.message}`);
			});
	});

	after(async () => {
		// TODO: stop server here once!
		server.stop()
			.then(() => {
				// console.log("Server::stop() - Server stopped");
				clearDisk();
			})
			.catch((error) => {
				// console.error(`Server::stop() - ERROR: ${error.message}`);
				clearDisk();
			});
	});

	// beforeEach(() => {
	// 	// might want to add some process logging here to keep track of what's going on
	// });
	//
	// afterEach(() => {
	// 	// might want to add some process logging here to keep track of what's going on
	// 	clearDisk();
	// });

	function makePutRequest(id: string, content: string, kind: string, contentType: string) {
		return request(SERVER_URL)
			.put(`/dataset/${id}/${kind}`)
			.send(content)
			.set("Content-Type", contentType);
	}

	function makeDeleteRequest(id: string) {
		return request(SERVER_URL)
			.delete(`/dataset/${id}`);
	}

	function makeGetRequest() {
		return request(SERVER_URL)
			.get("/datasets");
	}

	function makePostRequest(query: unknown) {
		return request(SERVER_URL)
			.post("/query")
			.send(query as string | object)
			.set("Content-Type", JSON_TYPE);
	}

	// Sample on how to format PUT requests
	describe("PUT tests", () => {
		beforeEach(() => {
			clearDisk();
		});

		afterEach(() => {
			clearDisk();
		});

		it("should PUT a valid sections dataset", async () => {
			try {
				return makePutRequest(
					"sec1",
					sections,
					InsightDatasetKind.Sections,
					ZIP_TYPE
				)
					.then((res: Response) => {
						expect(res.status).to.be.equal(200);
						expect(res.body.result).to.have.deep.equal(["sec1"]);
					})
					.catch((err: Error) => {
						// some logging here please!
						// console.error(err);
						expect.fail("This test shouldn't have thrown an error");
					});
			} catch (err) {
				// and some more logging here!
				// console.error(err);
			}
		});

		it("should fail with an invalid content", async () => {
			try {
				return makePutRequest(
					"sections",
					"THIS IS NOT A ZIP FILE",
					InsightDatasetKind.Sections,
					ZIP_TYPE
				)
					.then((res: Response) => {
						expect(res.body).to.be.instanceOf(Object);
						expect(res.body?.error).to.be.a("string");
						expect(res.status).to.be.equal(400);
					})
					.catch((err: Error) => {
						// console.error(err);
						expect.fail();
					});
			} catch(err) {
				// console.error(err);
			}
		});
	});

	describe("DELETE Tests", async () => {
		it("should DELETE the PUT-ed dataset", async () => {
			try {
				return makePutRequest(
					"sect",
					sections,
					InsightDatasetKind.Sections,
					ZIP_TYPE
				)
					.then((res: Response) => {
						return makeDeleteRequest("sections");
					})
					.then((res: Response) => {
						expect(res.status).to.be.equal(200);
						expect(res.body).to.be.instanceof(Object);
						expect(res.body?.result).to.be.equal("sect");
					})
					.catch((err: Error) => {
						// console.error(err);
						expect.fail();
					});
			} catch (err) {
				// console.error(err);
			}
		});

		it("should fail when DELETE-ing with an invalid id", async () => {
			try {
				return makeDeleteRequest("_")
					.then((res: Response) => {
						expect(res.status).to.be.equal(400);
						expect(res.body).to.be.instanceOf(Object);
						expect(res.body?.error).to.be.a("string");
					})
					.catch((err: Error) => {
						// console.error(err);
						expect.fail();
					});
			} catch (err) {
				// console.error(err);
			}
		});

		it("should fail when DELETE-ing a dataset with an non-existent id", async () => {
			try {
				return makeDeleteRequest("sections")
					.then((res: Response) => {
						expect(res.status).to.be.equal(404);
						expect(res.body).to.be.instanceof(Object);
						expect(res.body?.error).to.be.a("string");
					})
					.catch((err: Error) => {
						// console.error(err);
						expect.fail();
					});
			} catch (err) {
				// console.error(err);
			}
		});
	});

	describe("GET Tests", async () => {
		before(async () => {
			clearDisk();
		});

		after(() => {
			clearDisk();
		});

		it("should GET an empty list", async () => {
			try {
				return makeGetRequest()
					.then((res: Response) => {
						expect(res.status).to.be.equal(200);
						expect(res.body).to.be.instanceOf(Object);
						expect(res.body?.result).to.have.members([]);
					})
					.catch((err: Error) => {
						// console.error(err);
						expect.fail();
					});
			} catch (err) {
				// console.error(err);
			}
		});

		it("should GET the list of all available datasets to be queried", async () => {
			await makePutRequest("section3", sections, InsightDatasetKind.Sections, ZIP_TYPE);
			const m = await makePutRequest("room1", rooms, InsightDatasetKind.Rooms, ZIP_TYPE);
			console.log(m);

			try {
				return makeGetRequest()
					.then((res: Response) => {
						expect(res.status).to.be.equal(200);
						expect(res.body).to.be.instanceOf(Object);
						expect(res.body?.result).to.have.deep.members([
							{id: "room1", kind: InsightDatasetKind.Rooms, numRows: 364},
							{id: "section3", kind: InsightDatasetKind.Sections, numRows: 64612}
						]);
					})
					.catch((err: Error) => {
						console.error(err);
						expect.fail();
					});
			} catch (err) {
				console.error(err);
			}
		});
	});

	describe.skip("POST Tests", () => {
		before(async function () {
			await makePutRequest(
				"sections",
				sections,
				InsightDatasetKind.Sections,
				ZIP_TYPE
			);

			await makePutRequest(
				"rooms",
				rooms,
				InsightDatasetKind.Rooms,
				ZIP_TYPE
			);
		});

		after(() => {
			// console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		function targetFunction(input: any) {
			return makePostRequest(input)
				.then((res: Response) => {
					if (res.status === 200) {
						return res;
					}
					throw res;
				});
		}

		function assertResult(actual: unknown, expected: Promise<InsightResult[]>) {
			try {
				return Promise.all([actual, expected])
					.then((value) => {
						const [res, exp]: [Response, InsightResult[]] = value as [Response, InsightResult[]];
						// console.log(res);

						expect(res.status).to.be.equal(200);
						expect(res.body).to.be.an.instanceOf(Object);
						expect(res.body?.result).to.be.an.instanceOf(Array);
						expect(res.body?.result).to.have.deep.members(exp);
					})
					.catch((err: Error) => {
						// console.error(err);
						expect.fail();
					});
			} catch (err) {
				// console.error(err);
			}
		}

		function assertError(actual: unknown, expected: PQErrorKind) {
			try {
				return (actual as request.Test)
					.then((res: Response) => {
						expect(res.status).to.be.equal(400);
						expect(res.body).to.be.an.instanceOf(Object);
						expect(res.body?.error).to.be.a("string");
					})
					.catch((err: Error) => {
						// console.error(err);
						expect.fail();
					});
			} catch (err) {
				// console.error(err);
			}
		}

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			targetFunction,
			"./test/resources/queries",
			{
				assertOnResult: assertResult,
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: assertError
			}
		);
	});
});
