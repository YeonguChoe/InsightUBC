import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "../../../src/controller/IInsightFacade";
import InsightFacade from "../../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import fs from "fs-extra";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../../TestUtil";
import {
	validateQuery
} from "../../../src/controller/helpers/performQuery/performQueryValidator/performQueryValidatorHelper";
import {Query} from "../../../src/controller/helpers/performQuery/types";
import {applyOptions} from "../../../src/controller/helpers/performQuery/performQueryOptionsHelper";

use(chaiAsPromised);

describe("performQueryHelper", function () {
	let sections: string;
	let valid1: string;
	let invalidFileType: string;
	let facade: InsightFacade;

	describe("validator tests", function () {
		before(async function () {
			// This block runs once and loads the datasets.
			sections = getContentFromArchives("pair.zip");
			valid1 = getContentFromArchives("valid_1.zip");
			invalidFileType = getContentFromArchives("valid_1.rar");

			// Just in case there is anything hanging around from a previous run of the test suite
			clearDisk();
			await fs.createFile("./data/sections");
		});

		function assertError(actual: unknown, expected: unknown, input: object) {
			expect(actual).to.be.undefined;
		}

		function assertResult(actual: unknown, expected: unknown, input: object) {
			expect(actual).to.be.equal(expected);
		}

		folderTest<object, object, string>(
			"Query validation tests",
			(query) => validateQuery(query as Query),
			"./test/resources/valid_query_tests",
			{
				assertOnError: assertError,
				assertOnResult: assertResult,
			}
		);
	});

	describe("performQueryCollector", function () {
		before(async function () {
			clearDisk();
			facade = new InsightFacade();
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
		});
	});
});
