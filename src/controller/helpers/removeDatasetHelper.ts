import {InsightDatasetKind, InsightError, NotFoundError} from "../IInsightFacade";
import fs from "fs-extra";
import path from "path";

export function removeValidateId(id: string, folder: string, kind: InsightDatasetKind): Promise<void> {
	return new Promise((resolve, reject) => {
		const idChecker = new RegExp(/^[^_]+$/);
		if (!idChecker.test(id)) {
			reject(new InsightError("invalid id - id contains invalid characters"));
		}
		if (id.trim() === "") {
			reject(new InsightError("invalid id - id is an empty string"));
		}
		if (!fs.pathExistsSync(path.join(folder, id))) {
			reject(new NotFoundError("invalid id - no dataset found with that id"));
		}
		resolve();
	});
}

export function removeData(id: string, folder: string, promise: Promise<void>) {
	return promise
		.then(() => {
			return fs.remove(path.join(folder, id));
		})
		.then(() => {
			return id;
		});
}
