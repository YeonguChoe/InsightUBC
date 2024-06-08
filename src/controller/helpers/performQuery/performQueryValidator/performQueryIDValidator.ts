import {isTypeOf} from "../commonHelpers";
import {JSONObject} from "../../types";
import {ApplyRule, OptionType, TransformationType} from "../types";

export function collectDatasetIdFromOPTIONS(options: OptionType, idList: string[]): void {
	if (!isTypeOf(options, Object)) {
		return;
	}

	collectDatasetIdFromCOLUMNS(options, idList);
	collectDatasetIdFromORDER(options, idList);
}

function collectDatasetIdFromCOLUMNS(options: OptionType, idList: string[]) {
	if (!isTypeOf(options.COLUMNS, Array)) {
		return;
	}

	for (let column of options.COLUMNS) {
		if (typeof column !== "string") {
			continue;
		}

		const splittedStr = column.split("_");
		if (splittedStr.length < 2) {
			continue;
		}
		if (!idList.includes(splittedStr[0])) {
			idList.push(splittedStr[0]);
		}
	}
}

function collectDatasetIdFromORDER(options: OptionType, idList: string[]): void {
	if (options.ORDER === undefined) {
		return;
	}

	if (typeof options.ORDER === "string") {
		const splittedStr = options.ORDER.split("_");
		if (splittedStr.length < 2) {
			return;
		}
		if (!idList.includes(splittedStr[0])) {
			idList.push(splittedStr[0]);
		}
	} else if (options?.ORDER?.constructor === Object) {
		if (options.ORDER.keys.constructor !== Array) {
			return;
		}
		for (let key of options.ORDER.keys) {
			const splittedStr = key.split("_");
			if (splittedStr.length < 2) {
				continue;
			}
			if (!idList.includes(splittedStr[0])) {
				idList.push(splittedStr[0]);
			}
		}
	}
}

export function collectDatasetIdFromTRANSFORMATIONS(transformations: TransformationType, idList: string[]) {
	if (isTypeOf(transformations, undefined)) {
		return;
	}

	const GROUP = transformations.GROUP;
	const APPLY = transformations.APPLY;

	collectDatasetIdFromGROUP(GROUP, idList);
	collectDatasetIdFromAPPLY(APPLY, idList);
}

export function collectDatasetIdFromGROUP(group: string[], idList: string[]) {
	if (!isTypeOf(group, Array)) {
		idList.push("no group");
		return;
	}

	for (const groupId of group) {
		const [id, key] = groupId.split("_");
		if (key === undefined) {
			continue;
		}
		if (!idList.includes(id)) {
			idList.push(id);
		}
	}
}

export function collectDatasetIdFromAPPLY(apply: ApplyRule[], idList: string[]) {
	if (!isTypeOf(apply, Array)) {
		// idList.push("no group");
		return;
	}

	for (const aRule of apply) {
		const rule = Object.values(aRule);
		if (rule.length === 0) {
			// idList.push("no rule");
			return;
		}

		const value = Object.values(rule[0]);
		if (value.length === 0) {
			// idList.push("no apply");
			return;
		}

		const [id, key] = (value[0] as unknown as string).split("_");
		if (key === undefined) {
			continue;
		}
		if (!idList.includes(id)) {
			idList.push(id);
		}
	}
}
