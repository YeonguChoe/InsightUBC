import path from "path";
import fs from "fs-extra";
import JSZip from "jszip";

import {InsightDatasetKind, InsightError} from "../../IInsightFacade";
import {extractSection, validateContent} from "./sectionsProcessor/processor";
import {extractRooms} from "./roomProcessor/processor";

/**
 * Validates the given dataset id
 *
 * @param id the dataset's id
 * @param folder the directory to which the dataset will be saved to
 * @param kind the dataset kind
 *
 * @returns A void promise
 *
 * If the id is invalid, the promise throws an Insight Error,
 * else it doesn't return anything.
 */
export function validateDatasetID(id: string, folder: string, kind: InsightDatasetKind): Promise<void> {
	return new Promise((resolve, reject) => {
		const idChecker = new RegExp(/^[^_]+$/);
		if (!idChecker.test(id)) {
			reject(new InsightError("invalid id - id contains invalid characters"));
		}
		if (id.trim() === "") {
			reject(new InsightError("invalid id - id is an empty string"));
		}
		if (fs.pathExistsSync(path.join(folder, id))) {
			reject(new InsightError("invalid id - dataset with given id existed"));
		}
		resolve();
	});
}

export async function sectionsOrRooms(
	id: string,
	content: string,
	kind: InsightDatasetKind,
	promise: Promise<void>
): Promise<Array<{[p: string]: any}>> {
	await promise;
	const zip = await parseZip(content);
	if (kind === InsightDatasetKind.Sections) {
		return extractSection(zip, id);
	}
	return extractRooms(zip, id);
}

/**
 * Read and parse the dataset
 *
 * @param content the content in a base64 string format
 * @param promise a void promise corresponding to the id validation stage of addDataset
 * @returns A string array promise
 *
 * If the content is invalid, the promise will throw an InsightError.
 * Otherwise, the function returns a string array promise with each string element
 * corresponds to the content of each file in the courses directory of the zip file.
 *
 * Note:
 *
 * This function is dependent on the output of the addDatasetStage1.
 *
 */
export function parseZip(content: string) {
	const zip = new JSZip();
	return zip.loadAsync(content, {base64: true}).catch((error) => {
		throw new InsightError("invalid file - given file is not a zip file");
	});
}

export function saveDataset(
	id: string,
	folder: string,
	cache: {[key: string]: any},
	kind: InsightDatasetKind,
	promise: Promise<Array<{[key: string]: any}>>
): Promise<string[]> {
	return promise
		.then((sections) => {
			const target = path.join(folder, id);
			fs.createFileSync(target);
			cache[id] = sections;
			return fs.writeJSON(target, {result: sections, kind: kind});
		})
		.then(() => {
			return fs.readdir(folder);
		})
		.then((ids) => {
			return [...ids];
		});
}
