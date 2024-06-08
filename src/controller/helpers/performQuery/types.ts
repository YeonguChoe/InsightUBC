import {JSONObject} from "../types";

type MComparatorType = "GT" | "LT" | "EQ";
type SComparatorType = "IS";
type LogicComparatorType = "OR" | "AND";
type NegationComparatorType = "NOT";

interface Comparator {
	[key: string]: any;
}

interface MComparator extends Comparator {
	[key: keyof MComparator]: {
		[mkey: string]: number;
	};
}

interface SComparator extends Comparator {
	[key: keyof SComparator]: {
		[sKey: string]: string;
	};
}

interface NegationComparator extends Comparator {
	NOT: SComparator | MComparator | LogicComparator;
}

interface LogicComparator extends Comparator {
	[key: keyof LogicComparator]: Array<SComparator | MComparator | NegationComparator | LogicComparator>;
}

export interface OrderObject {
	dir: string,
	keys: string[]
}

export interface OptionType {
	COLUMNS: string[];
	ORDER?: string | OrderObject
}

export type WhereType = LogicComparator | MComparator | SComparator | NegationComparator;

export interface Query {
	WHERE: WhereType
	OPTIONS: OptionType
	TRANSFORMATIONS: TransformationType
}


export interface TransformationType {
	GROUP: string[],
	APPLY: ApplyRule[]
}

export interface ApplyRule {
	[key: string]: {
		[key: string]: string
	}
}

export interface Section {
	[key: string]: string | number;
}

export type ComparatorFunction = (section: Section) => boolean;
