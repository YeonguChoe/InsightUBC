export interface JSONObject {
	[key: string]: JSONValueType;
}

export interface BuildingInfo {
	fullname: string;
	shortname: string;
	address: string;
	buildingFileContent: string;
}

export type JSONValueType = JSONValueType[] | JSONObject | string | number | null | boolean;
