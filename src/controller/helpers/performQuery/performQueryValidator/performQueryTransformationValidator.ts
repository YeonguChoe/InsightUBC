// Input: JSON.parsed json
// Output: boolean (True meaning valid transformation, False meaning invalid transformation)
import {isTypeOf} from "../commonHelpers";
import {ApplyRule} from "../types";
import {endStringKeyIndex, startStringKeyIndex, validKeys} from "../constants";

export function validateTransformationQuery(inputQuery: any) {
	if (isTypeOf(inputQuery?.TRANSFORMATIONS, undefined)) {
		return true;
	}

	let columnOption = inputQuery["OPTIONS"]["COLUMNS"];
	let validTypes = ["AVG", "COUNT", "MAX", "MIN", "SUM"];
	let datasetSpecific = [];
	let nonDatasetSpecific = [];
	// Creating two arrays, one for ID specific and one for non-ID specific
	for (let column of columnOption) {
		if (column.includes("_")) {
			datasetSpecific.push(column);
		} else {
			nonDatasetSpecific.push(column);
		}
	}
	// Make Arrays of Elements in GROUP and APPLY each
	let transformation = inputQuery["TRANSFORMATIONS"];
	let groupTransformation = transformation["GROUP"];
	let applyTransformation = transformation["APPLY"];
	// Check if GROUP is an array
	if (!Array.isArray(groupTransformation)) {
		return false;
	}
	// Check if elements in Options.columns is in Group
	const specificSet = new Set(datasetSpecific);
	for (let groupInfo of groupTransformation) {
		if (specificSet.has(groupInfo)) {
			// if something in Options.columns is not in Group
			specificSet.delete(groupInfo);
		}
	}
	if (specificSet.size !== 0) {
		return false;
	}

	if (!validateNonSpecificIDs(nonDatasetSpecific, applyTransformation)) {
		return false;
	}

	if (!validateApplyFields(applyTransformation, validTypes)) {
		return false;
	}

	// If passed everything
	return true;
}

function validateApplyFields(apply: ApplyRule[], validTypes: string[]) {
	for (const aRule of apply) {
		if (!isTypeOf(aRule, Object)) {
			return false;
		}

		const rule = Object.values(aRule)[0];
		const applyType = Object.keys(rule)[0];
		const applyValue = rule[applyType];

		if (!validTypes.includes(applyType)) {
			return false;
		}

		const [id, key] = applyValue.split("_");
		// Temp
		if (applyType !== "COUNT") {
			if (!validKeys.slice(endStringKeyIndex).includes(key)) {
				return false;
			}
			continue;
		}
		if (!validKeys.includes(key)) {
			return false;
		}
	}
	return true;
}

function validateNonSpecificIDs(nonSpecificIds: string[], apply: ApplyRule[]) {
	const nonSpecificIdsSet = new Set(nonSpecificIds);
	for (const aRule of apply) {
		const key = Object.keys(aRule)[0];
		if (nonSpecificIdsSet.has(key)) {
			nonSpecificIdsSet.delete(key);
		}
	}

	return nonSpecificIdsSet.size === 0;
}


// // Check if everything in nonIDspecific is in APPLY key
// let keysInApplyTransformation = [];
// // Check if the keys in Apply's object are valid (AVG, COUNT, MAX, MIN, SUM)
// for (let applyInfo of applyTransformation) {
// 	for (let singleNonIDspecific of nonDatasetSpecific) {
// 		// getting inside Apply's object
// 		if (Object.keys(applyInfo).includes(singleNonIDspecific)) {
// 			for (let keyInApply in applyInfo[singleNonIDspecific]) {
// 				// checking if the key is valid
// 				if (!validTypes.includes(keyInApply)) {
// 					return false;
// 				}
// 			}
// 		}
// 	}
// 	// Additional job: make APPLY key list
// 	keysInApplyTransformation.push(Object.keys(applyInfo)[0]);
// }
// // Check if everything in nonID specific is in APPLY key
// if (JSON.stringify(keysInApplyTransformation) !== JSON.stringify(nonDatasetSpecific)) {
// 	return false;
// }
