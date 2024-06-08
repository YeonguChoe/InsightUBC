import {InsightDatasetKind} from "../../../src/controller/IInsightFacade";
import InsightFacade from "../../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../../TestUtil";
import {validateSection} from "../../../src/controller/helpers/addDataset/sectionsProcessor/processor";
import {processRoomZipToBuildingsInfo} from "../../../src/controller/helpers/addDataset/roomProcessor/processor";
import {getLongLat} from "../../../src/controller/helpers/addDataset/roomProcessor/fromHTMLtoRooms";
import JSZip from "jszip";

use(chaiAsPromised);

describe("addDatasetHelper", function () {
	let sections: string;
	let valid1: string;
	let campus: string;
	let validCampus1: string;
	let invalidFileType: string;
	let facade: InsightFacade;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		valid1 = getContentFromArchives("valid_1.zip");
		invalidFileType = getContentFromArchives("valid_1.rar");
		campus = getContentFromArchives("campus.zip");
		validCampus1 = getContentFromArchives("valid_campus_1.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("stage 1 tests", function () {
		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			facade = new InsightFacade();
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			clearDisk();
		});

		it("should accept valid section", function () {
			let testObj = {
				id: "10",
				Course: "CPSC",
				Title: "Database",
				Professor: "John",
				Subject: "Computer Science",
				Year: "2100",
				Avg: "90",
				Pass: "40",
				Fail: "30",
				Audit: "10",
			};
			const result = validateSection(testObj);
			expect(result).to.equal(true);
		});

		it("should reject invalid section", function () {
			let testObj = {
				Course: "CPSC",
				Title: "Database",
				Professor: "John",
				Subject: "Computer Science",
				Year: "1900",
				Avg: "90",
				Pass: "40",
				Fail: "30",
				Audit: "10",
			};

			const result = validateSection(testObj);
			expect(result).to.equal(false);
		});

		it("should return a valid lonLat object", async function() {
			const obj = await getLongLat("6245 Agronomy Road V6T 1Z4");
			expect(obj).to.deep.equal({
				lat: 49.26125,
				lon: -123.24807
			});
		});

		it("should return a valid lonLat object", async function() {
			const obj = await getLongLat("123 Fake Address Rd");
			expect(obj).to.deep.equal({
				error: "Address not found (123 Fake Address Rd)"
			});
		});

		it("should", async function() {
			const zip = new JSZip();
			const newZip = await zip.loadAsync(campus, {base64: true});
			const data = await processRoomZipToBuildingsInfo(newZip, "id");
		});

		it("should", async function() {
			const zip = new JSZip();
			const newZip = await zip.loadAsync(validCampus1, {base64: true});
			const data = await processRoomZipToBuildingsInfo(newZip, "id");
		});
	});
});
