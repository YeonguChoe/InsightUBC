import {JSONObject} from "../addDataset/roomProcessor/types";
import {isTypeOf} from "./commonHelpers";
import {groupJSONGenerator} from "./performQueryGroup";
import {computeApplyTransformation} from "./performQueryApplyToken";
import {ApplyRule, TransformationType} from "./types";

export function applyTransformations(dataset: JSONObject[], transformation: TransformationType) {
	if (!isTypeOf(transformation, Object)) {
		return dataset;
	}
	const group: JSONObject = groupJSONGenerator(dataset, (transformation.GROUP as string[]));
	const result = [];
	for (const i of Object.values(group)) {
		result.push(computeApplyTransformation(
			i as JSONObject[],
			transformation.APPLY as ApplyRule[],
			transformation.GROUP as string[]));
	}
	return result;
}
