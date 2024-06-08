import fs from "fs-extra";
import path from "path";
import {Query, ComparatorFunction, WhereType} from "./types";
import {InsightResult, ResultTooLargeError} from "../../IInsightFacade";

const compFactoryMap: {[key: string]: any} = {
	GT: mCompFactory,
	LT: mCompFactory,
	EQ: mCompFactory,
	IS: sCompFactory,
	OR: logicFactory,
	AND: logicFactory,
	NOT: negationFactory,
};

export function collectResult(dataset: any, where: WhereType): InsightResult[] | undefined {
	const key = Object.keys(where);

	if (key.length === 0) {
		// MDN Deep copy documentation:
		// https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
		return structuredClone(dataset);
	}

	const comparator = compFactoryMap[key[0]](where);
	const result = [];

	let resultCount = 0;
	for (const section of dataset) {
		if (comparator(section)) {
			result.push(structuredClone(section));
			resultCount++;
		}
	}

	return result;
}

function mCompFactory(comparatorObject: any) {
	const key = Object.keys(comparatorObject)[0];

	const compValue = comparatorObject[key];
	const queryKey = Object.keys(compValue)[0];
	const queryValue = compValue[queryKey];

	switch (key) {
		case "GT":
			return function (section: any) {
				return queryValue < section[queryKey];
			};
		case "LT":
			return function (section: any) {
				return queryValue > section[queryKey];
			};
		case "EQ":
			return function (section: any) {
				return queryValue === section[queryKey];
			};
		default:
			break;
	}
}

export function readContentFile(folder: string, id: string) {
	let stringContent = fs.readFileSync(path.join(folder, id)).toString();
	return JSON.parse(stringContent);
}

export function findId(query: Query) {
	let id, key;
	for (const col of query.OPTIONS.COLUMNS) {
		[id, key] = [...col.split("_")];
		if (key !== undefined) {
			return id as string;
		}
	}
	return id as string;
}

export function sCompFactory(comparatorObject: object) {
	const valuePair = Object.values(comparatorObject)[0];
	const queryKey = Object.keys(valuePair)[0];
	const queryValue = Object.values(valuePair)[0] as string;

	if (!queryValue.includes("*")) {
		return function (section: any) {
			return queryValue === section[queryKey];
		};
	}

	if (queryValue[0] === "*" && queryValue[queryValue.length - 1] === "*") {
		const keyword = queryValue.slice(1, queryValue.length - 1);
		return function (section: any) {
			return section[queryKey].includes(keyword);
		};
	}

	if (queryValue.startsWith("*")) {
		const keyword = queryValue.slice(1);
		return function (section: any) {
			return section[queryKey].endsWith(keyword);
		};
	}

	if (queryValue.endsWith("*")) {
		const keyword = queryValue.slice(0, queryValue.length - 1);
		return function (section: any) {
			return section[queryKey].startsWith(keyword);
		};
	}
}

export function negationFactory(comparatorObject: object) {
	const comp = Object.values(comparatorObject)[0];
	const key = Object.keys(comp)[0];
	const comparatorFunction = compFactoryMap[key](comp);

	return function (section: any) {
		return !comparatorFunction(section);
	};
}

export function logicFactory(comparatorObject: object) {
	const filters = Object.values(comparatorObject)[0] as any[];
	const key = Object.keys(comparatorObject)[0];

	if (key === "AND") {
		const comparators: ComparatorFunction[] = [];

		for (const filter of filters) {
			const compKey = Object.keys(filter)[0];
			comparators.push(compFactoryMap[compKey](filter));
		}

		return function (section: any): boolean {
			for (const func of comparators) {
				if (!func(section)) {
					return false;
				}
			}

			return true;
		};
	}

	if (key === "OR") {
		const comparators: ComparatorFunction[] = [];
		for (const filter of filters) {
			const compKey = Object.keys(filter)[0];
			comparators.push(compFactoryMap[compKey](filter));
		}
		return function (section: any): boolean {
			for (const func of comparators) {
				if (func(section)) {
					return true;
				}
			}
			return false;
		};
	}

	return;
}
