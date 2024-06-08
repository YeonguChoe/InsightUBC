export type JSONValues = string | number | object | boolean | JSONObject | JSONValues[];

export interface JSONObject {
	[key: string]: JSONValues;
}
