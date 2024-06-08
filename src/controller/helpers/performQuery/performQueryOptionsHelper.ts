import {InsightResult} from "../../IInsightFacade";
import {OptionType, OrderObject} from "./types";
import {isTypeOf} from "./commonHelpers";

export function applyOptions(options: OptionType, result: InsightResult[]) {
	const columns = options.COLUMNS;
	result.forEach((section) => {
		for (const key in section) {
			if (!columns.includes(key)) {
				delete section[key];
			}
		}
	});

	const order = options.ORDER;
	if (order === undefined) {
		return;
	}
	let sortFunction;
	if (isTypeOf(order, String)) {
		sortFunction = (a: InsightResult, b: InsightResult) => {
			return (a[order as string] as number) - (b[order as string] as number);
		};
	} else {
		sortFunction = createSortFunction((order as OrderObject).dir, (order as OrderObject).keys);
	}

	result.sort(sortFunction);
}

function createSortFunction(dir: string, orderList: string[]) {
	const isAscending = (dir === "UP");

	return (a: InsightResult, b: InsightResult) => {
		let sortValue: number = NaN;
		for (const key of orderList) {
			 sortValue = isAscending ?
				((a[key] as number) - (b[key] as number)) :
				((b[key] as number) - (a[key] as number));

			if (sortValue !== 0) {
				return sortValue;
			}
		}
		return sortValue;
	};
}


