import fs from "fs-extra";
import path from "path";
import {InsightDataset, InsightDatasetKind, InsightResult} from "../IInsightFacade";

export function readFolder(folder: string) {
	return fs.ensureDir(folder).then(() => {
		return fs.readdir(path.join(folder));
	});
}

export function listData(folder: string, promise: Promise<string[]>) {
	return promise.then((ids) => {
		let id;
		let fileContents: Array<Promise<InsightDataset>> = [];
		for (id of ids) {
			fileContents.push(extractResult(id, folder));
		}
		return Promise.all(fileContents);
	});
}

export function extractResult(id: string, folder: string) {
	return fs.readJSON(path.join(folder, id)).then((obj) => {
		return {id: id, kind: obj.kind, numRows: obj.result.length};
	});
}
