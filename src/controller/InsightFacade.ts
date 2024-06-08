import JSZip from "jszip";
import fs from "fs-extra";

import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";

import {validateDatasetID, parseZip, saveDataset, sectionsOrRooms} from "./helpers/addDataset/addDatasetHelper";
import {removeValidateId, removeData} from "./helpers/removeDatasetHelper";
import {readFolder, listData} from "./helpers/listDatasetHelper";
import {
	validateQuery,
	validateQueryDatasetID
} from "./helpers/performQuery/performQueryValidator/performQueryValidatorHelper";
import {Query} from "./helpers/performQuery/types";
import {collectResult, findId, readContentFile} from "./helpers/performQuery/performQueryCollectorHelpers";
import {applyOptions} from "./helpers/performQuery/performQueryOptionsHelper";
import {validateContent} from "./helpers/addDataset/sectionsProcessor/processor";
import {applyTransformations} from "./helpers/performQuery/performQueryTransformationsHelper";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private diskFolder: string;
	private cache: {[key: string]: any[]};

	constructor() {
		this.diskFolder = "./data";
		this.cache = {};
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// Stage 1: Validate the id
		const stage1 = validateDatasetID(id, this.diskFolder, kind);
		// Stage 2: Parse the zip file
		const stage2 = sectionsOrRooms(id, content, kind, stage1);
		// Stage 3: Store the data
		return saveDataset(id, this.diskFolder, this.cache, kind, stage2);
	}

	public removeDataset(id: string): Promise<string> {
		// Stage 1: Validate the id
		const stage1 = removeValidateId(id, this.diskFolder, InsightDatasetKind.Sections);
		// Stage 2: Delete disk file
		const stage2 = removeData(id, this.diskFolder, stage1);
		return stage2;
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// Stage 1: Validate the Query
		const isQueryValid = validateQuery(query as Query);

		if (typeof isQueryValid === "string") {
			return Promise.reject(new InsightError(isQueryValid));
		}

		// Stage 2: Retrieve the dataset
		const id = findId(query as Query);

		if (!Object.keys(this.cache).includes(id)) {
			if (Object.keys(this.cache).length > 3) {
				delete this.cache[Object.keys(this.cache)[0]];
			}

			const dataset = readContentFile(this.diskFolder, id);
			this.cache[id] = dataset.result;
		}

		// Stage 3: Collect the Result
		const result = collectResult(this.cache[id], (query as Query).WHERE);
		const resultAfterTransform = applyTransformations(result as InsightResult[], (query as Query).TRANSFORMATIONS);

		if (resultAfterTransform.length > 5000) {
			return Promise.reject(new ResultTooLargeError("The result is larger than 5000 entries"));
		}

		// Stage 4: Apply options
		applyOptions((query as Query).OPTIONS, resultAfterTransform as InsightResult[]);

		return Promise.resolve(resultAfterTransform as InsightResult[]);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		// Stage 1: Read the folder
		const stage1 = readFolder(this.diskFolder);

		// Stage 2: Push the read content into a JSON file
		const stage2 = listData(this.diskFolder, stage1);
		return stage2;
	}
}
