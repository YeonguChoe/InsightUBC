import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect, use} from "chai";
import {pathExists} from "fs-extra";
import chaiAsPromised from "chai-as-promised";
import {folderTest} from "@ubccpsc310/folder-test";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let rooms: string;
	let valid1: string;
	let invalidFileType: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		valid1 = getContentFromArchives("valid_1.zip");
		invalidFileType = getContentFromArchives("valid_1.rar");
		rooms = getContentFromArchives("campus.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			// console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			// console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			// console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			// console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// This is a unit test. You should create more like this!
		it("should add a section dataset to the disk", function () {
			const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.deep.equal(["ubc"]);
		});

		it("should add a room file", async function() {
			const result = await facade.addDataset("buildings", rooms, InsightDatasetKind.Rooms);
			expect(result).to.deep.equal(["buildings"]);
		});

		it("should reject with an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an id with an underscore", function () {
			const result = facade.addDataset("_", valid1, InsightDatasetKind.Sections);
			return expect(result).to.be.eventually.rejectedWith(InsightError);
		});

		it("should reject with an id with only whitespaces", function () {
			const result = facade.addDataset("    ", valid1, InsightDatasetKind.Sections);
			return expect(result).to.be.eventually.rejectedWith(InsightError);
		});

		it("should reject with an existing id", async function () {
			await facade.addDataset("ubc", valid1, InsightDatasetKind.Sections);
			const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections);

			return expect(result).to.be.eventually.rejectedWith(InsightError);
		});

		it("should reject with an invalid filetype", function () {
			const result = facade.addDataset("ubccs", invalidFileType, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an empty content", function () {
			const result = facade.addDataset("ubccs", "", InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should list no dataset", function () {
			const result = facade.listDatasets();

			return result.then((Datasets) => {
				expect(Datasets).to.have.length(0);
				expect(Datasets).to.be.instanceof(Array);
			});
		});

		it("should list 1 dataset", async function () {
			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			const result = await facade.listDatasets();

			expect(result).to.deep.equal([{id: "ubc", kind: "sections", numRows: 64612}]);
		});

		it("should list the correct datasets", async function () {
			await facade.addDataset("1", sections, InsightDatasetKind.Sections);
			await facade.addDataset("2", rooms, InsightDatasetKind.Rooms);

			const result = await facade.listDatasets();
			expect(result).to.have.deep.members([
				{
					id: "1",
					kind: InsightDatasetKind.Sections,
					numRows: 64612,
				},
				{
					id: "2",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
			]);
		});

		it("should list the correct datasets (2)", async function() {
			await facade.addDataset("1", sections, InsightDatasetKind.Sections);
			await facade.addDataset("ubc-3", valid1, InsightDatasetKind.Sections);
			await facade.addDataset("all-rooms", rooms, InsightDatasetKind.Rooms);

			const result = await facade.listDatasets();
			expect(result).to.have.deep.members([
				{
					id: "1",
					kind: InsightDatasetKind.Sections,
					numRows: 64612,
				},
				{
					id: "ubc-3",
					kind: InsightDatasetKind.Sections,
					numRows: 5
				},
				{
					id: "all-rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 364
				}
			]);
		});

		it("should remove dataset", async function () {
			await facade.addDataset("1", sections, InsightDatasetKind.Sections);
			await facade.addDataset("2", sections, InsightDatasetKind.Sections);

			const result = await facade.removeDataset("1");

			expect(result).to.equal("1");

			const existence = await pathExists("./data/1");
			expect(existence).to.be.false;
		});

		it("should not remove dataset which has not been added", function () {
			const result = facade.removeDataset("1");

			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("should not remove dataset with an empty id", function () {
			const result = facade.removeDataset("");

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should not remove dataset where id has underscore", function () {
			const result = facade.removeDataset("1_");

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(async function () {
			// console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
		});

		after(function () {
			// console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.have.deep.members(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					switch (expected) {
						case "InsightError":
							expect(actual).to.be.an.instanceOf(InsightError);
							break;
						case "ResultTooLargeError":
							expect(actual).to.be.an.instanceOf(ResultTooLargeError);
							break;
					}
				},
			}
		);
	});
});
