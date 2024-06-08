import {logicFactory, negationFactory, sCompFactory} from "./performQueryCollectorHelpers";
import {Decimal} from "decimal.js";
import {JSONObject} from "../addDataset/roomProcessor/types";
import {ApplyRule} from "./types";
export const tokenFactoryMap: {[key: string]: any} = {
	MAX: calMax,
	MIN: calMin,
	AVG: calAvg,
	COUNT: calCount,
	SUM: calSum
};

function calSum(group: JSONObject[], key: string): number{
	let result = new Decimal(0);
	for(const item of group){
		result = result.add(new Decimal(item[key] as number));
	}
	return Number(result.toFixed(2));
}

function calMax(group: JSONObject[], key: string): number{
	let result = -Infinity;
	for(const item of group){
		if(result < (item[key] as number)){
			result = item[key] as number;
		}

	}
	return result;
}

function calMin(group: JSONObject[], key: string): number{
	let result = Infinity;
	for(const item of group){
		if(result > (item[key] as number)){
			result = item[key] as number;
		}

	}
	return result;
}

function calCount(group: JSONObject[], key: string): number{
	const tracker = new Set();
	for(const item of group){
		tracker.add(item[key]);
	}
	return tracker.size;
}

function calAvg(group: JSONObject[], key: string): number{
	let result = new Decimal(0);
	let count = 0;
	for(const item of group) {
		result = result.add(new Decimal(item[key] as number));
		count += 1;
	}
	return Number((result.toNumber() / count).toFixed(2));
}

function applyTokensToGroup(group: JSONObject[], apply: ApplyRule) {
	const token = Object.values(apply)[0];
	const key = Object.keys(token)[0];
	const value = Object.values(token)[0];
	return tokenFactoryMap[key](group, value);
}

export function computeApplyTransformation(groups: JSONObject[], apply: ApplyRule[], groupList: string[]){
	const result: JSONObject = {};
	for(const g of groupList){
		result[g] = groups[0][g];
	}
	for(const aRule of apply){
		const key = Object.keys(aRule)[0];
		result[key] = applyTokensToGroup(groups, aRule);
	}
	return result;
}


