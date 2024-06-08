import {JSONObject} from "../addDataset/roomProcessor/types";


// Final function that returns result of GROUP keyword
// Input: dataset, groupKeys (e.g ["sections_dept", "sections_year"])
// Output: JSON object which contains result of GROUP keyword
export function groupJSONGenerator(dataset: any[], groupKeys: string[]) {
	let groupResult: JSONObject = {};
	let theAllGroupNames = everyGroupNames(dataset, groupKeys);
	for(let group of theAllGroupNames){
		groupResult[group] = [];
	}
	populateGroup(groupResult,dataset,groupKeys);
	return groupResult;
}

function populateGroup(group: JSONObject, dataset: JSONObject[], groupKeys: string[]){
	for(let data of dataset){
		let groupName = makeGroupName(data, groupKeys);
		(group[groupName] as JSONObject[]).push(data);
	}
}

// Input: dataset, groupKeys (e.g ["sections_dept", "sections_year"])
// Output: list of group names (e.g ['cnps-2012', 'cnps-2009'...])
function everyGroupNames(dataset: any, groupKeys: string[]): Set<string> {
	let allGroupNames = [];
	for (let singleData of dataset) {
		let distinctValueCombination = [];
		for (let key of groupKeys) {
			distinctValueCombination.push(singleData[key]);
		}
		let distinctPair = distinctValueCombination.join("/");
		allGroupNames.push(distinctPair);
	}
	return new Set(allGroupNames);
}

export function makeGroupName(section: JSONObject, group: string[]) {
	const payload = [];
	for (let key of group) {
		payload.push(section[key]);
	}

	const res = payload.join("/");
	return res;
}

