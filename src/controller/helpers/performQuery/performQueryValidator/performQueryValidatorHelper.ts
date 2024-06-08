import {endStringKeyIndex, invalidQueryKeys, startStringKeyIndex, validKeys} from "../constants";
import {Query} from "../types";

import fs from "fs-extra";
import path from "path";
import {isTypeOf} from "../commonHelpers";
import {validateTransformationQuery} from "./performQueryTransformationValidator";
import {collectDatasetIdFromOPTIONS, collectDatasetIdFromTRANSFORMATIONS} from "./performQueryIDValidator";
import {JSONObject} from "../../types";

const compValidatorMap: {[key: string]: any} = {
	GT: validateMComparator,
	LT: validateMComparator,
	EQ: validateMComparator,
	IS: validateSComparator,
	OR: validateLogicComparator,
	AND: validateLogicComparator,
	NOT: validateFilter,
};

export function validateQuery(query: Query): boolean | string {
	if (!validateQueryType(query)) {
		return "The query should be of type object.";
	}

	const validateQueryDatasetIDResult = validateQueryDatasetID(query);
	if (typeof validateQueryDatasetIDResult === "string") {
		return validateQueryDatasetIDResult;
	}

	if (query.WHERE === undefined || query.WHERE?.constructor !== Object) {
		return "WHERE should be of type object.";
	}

	if (!validateWHERE(query.WHERE)) {
		return "WHERE contains invalid syntax(es).";
	}

	if (query.OPTIONS === undefined || query.OPTIONS?.constructor !== Object) {
		return "OPTIONS should be of type object.";
	}

	const validateOPTIONSResult = validateOPTIONS(query);
	if (typeof validateOPTIONSResult === "string") {
		return validateOPTIONSResult;
	}

	if (!validateTransformationQuery(query)) {
		return "Invalid TRANSFORMATIONS.";
	}

	return true;
}

export function validateOPTIONS(query: Query): boolean | string {
	if (query.OPTIONS.COLUMNS?.constructor !== Array) {
		return "The COLUMNS should be an array of string.";
	}

	if (query.OPTIONS.COLUMNS.length < 1) {
		return "The COLUMNS array is empty.";
	}

	for (let column of query.OPTIONS.COLUMNS) {
		if (typeof column !== "string") {
			return "The COLUMNS array contains a non-string value.";
		}

		const splittedString = column.split("_");
		if (splittedString.length < 2) {
			continue;
		}

		if (!validKeys.includes(splittedString[1])) {
			return "The COLUMNS array contains an invalid query key.";
		}
	}

	if (query.OPTIONS?.ORDER === undefined) {
		return true;
	}

	if (typeof query.OPTIONS?.ORDER === "string"){
		return query.OPTIONS?.COLUMNS.includes(query.OPTIONS.ORDER) ?
			true :
			"The ORDER key is not contained inside the COLUMNS.";
	} else if (query.OPTIONS?.ORDER.constructor === Object) {
		if (query.OPTIONS?.ORDER.dir === "UP" || query.OPTIONS?.ORDER.dir === "DOWN") {
			for (let column of query.OPTIONS.ORDER.keys) {
				if (!query.OPTIONS.COLUMNS.includes(column)) {
					return "The ORDER key is not contained inside the COLUMNS.";
				}
			}
			return true;
		}
	}

	return "The ORDER should be either a string or an object.";
}

export function validateQueryType(query: Query): boolean {
	return isTypeOf(query, Object);
}

export function validateQueryDatasetID(query: Query): boolean | string {
	const idList: string[] = [];

	if (isTypeOf(query.WHERE, Object)) {
		collectDatasetIdFromWHERE(query.WHERE, idList);
	}

	collectDatasetIdFromOPTIONS(query.OPTIONS as any, idList);
	collectDatasetIdFromTRANSFORMATIONS(query.TRANSFORMATIONS as any, idList);

	if (idList.length === 0) {
		return "No dataset referenced.";
	}

	if (idList.length > 1) {
		return "More than one dataset referenced.";
	}

	if (!fs.pathExistsSync(path.join("./data", idList[0]))) {
		return "No dataset with the referenced ID found.";
	}

	return true;
}

export function collectDatasetIdFromWHERE(filter: any, idList: string[]): void {
	const keys: string[] = Object.keys(filter);

	if (keys.length < 1) {
		return;
	}

	// If the value is an array
	if (filter[keys[0]]?.constructor === Array) {
		for (let i of filter[keys[0]]) {
			collectDatasetIdFromWHERE(i, idList);
		}
		return;
	}

	// If the value is an object
	if (filter[keys[0]]?.constructor === Object) {
		collectDatasetIdFromWHERE(filter[keys[0]], idList);
		return;
	}

	// Hardcoded stuff REMOVE LATER
	if (invalidQueryKeys.includes(keys[0])) {
		idList.push(keys[0]);
	}

	const fieldKey = keys[0].split("_")[0];
	if (!idList.includes(fieldKey)) {
		idList.push(fieldKey);
	}
}

function validateWHERE(where: {[key: string]: any}) {
	const keys = Object.keys(where);

	if (keys.length === 0) {
		return true;
	}

	if (keys.length > 1) {
		return false;
	}

	const firstComp = keys[0];
	return compValidatorMap[firstComp](where[firstComp]);
}

function validateKeyLength(comp: {[key: string]: any}) {
	const keys = Object.keys(comp);
	return keys.length === 1;
}

function validateQueryKey(key: string, checkComp?: "scomp" | "mcomp") {
	if (checkComp === "scomp") {
		// Check if key is a valid SComparator key
		return validKeys.slice(startStringKeyIndex, endStringKeyIndex).includes(key);
	}

	if (checkComp === "mcomp") {
		// Check if key is a valid MComparator key
		return validKeys.slice(endStringKeyIndex).includes(key);
	}

	return validKeys.includes(key);
}

function validateFilter(comp: {[key: string]: any}) {
	if (!validateKeyLength(comp)) {
		return false;
	}

	const compKey = Object.keys(comp)[0];

	return compValidatorMap[compKey](comp[compKey]);
}

function validateLogicComparator(comps: Array<{[key: string]: any}>) {
	if (comps?.constructor !== Array) {
		return false;
	}

	if (comps.length < 1) {
		return false;
	}

	let isValidLogic = true;
	for (let filter of comps) {
		if (filter?.constructor !== Object) {
			return false;
		}

		if (!validateKeyLength(filter)) {
			return false;
		}

		isValidLogic &&= validateFilter(filter);
	}

	return isValidLogic;
}

function validateMComparator(comp: {[key: string]: any}) {
	if (!validateKeyLength(comp)) {
		return false;
	}

	const [id, key] = Object.keys(comp)[0].split("_");
	if (!validateQueryKey(key, "mcomp")) {
		return false;
	}

	if (typeof Object.values(comp)[0] !== "number") {
		return false;
	}

	return true;
}

function validateSComparator(comp: {[key: string]: any}) {
	if (!validateKeyLength(comp)) {
		return false;
	}

	const [id, key] = Object.keys(comp)[0].split("_");
	if (!validateQueryKey(key, "scomp")) {
		return false;
	}

	const val = Object.values(comp)[0];
	if (typeof val !== "string") {
		return false;
	}
	const keyChecker = new RegExp(/^[*]?[^*]*[*]?$/);
	if (keyChecker.test(val)) {
		return true;
	}
	return false;
}
