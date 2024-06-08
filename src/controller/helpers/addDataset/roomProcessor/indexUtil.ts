import {Attribute} from "parse5/dist/common/token";
import {Element, TextNode} from "parse5/dist/tree-adapters/default";

import {BuildingInfo, JSONObject, JSONValueType} from "./types";
import {validHTMLClass} from "./constants";
import {getAttr, getIdentifierClass, getDirectChildOfType, getAllTd} from "./htmlUtil";

const identifierClassToProcessor: Map<string, any> = new Map<string, any>([
	[`${validHTMLClass}-field-building-code`, addText("shortname")],
	[`${validHTMLClass}-field-building-address`, addText("address")],
	[`${validHTMLClass}-title`, addText("fullname", "a")],
	[`${validHTMLClass}-nothing`, addHref("buildingFileContent")],
]);

function addText(key: string, textContainer: string = "") {
	return (target: BuildingInfo, element: Element) => {
		let e: Element | null = element;
		if (textContainer !== "") {
			e = getDirectChildOfType(e, textContainer);
		}
		e = getDirectChildOfType(e as Element, "#text");

		if (e === null) {
			return;
		}

		const data = (e as any).value.trim();
		target[key as keyof BuildingInfo] = data;
	};
}

function addHref(key: string) {
	return (target: BuildingInfo, element: Element) => {
		const a = getDirectChildOfType(element, "a");
		const attr: Attribute | null = getAttr(a as Element, "href");
		target[key as keyof BuildingInfo] = attr?.value !== undefined ? attr.value : "";
	};
}

/**
 * Retrieve building information from a tr element
 *
 * @param tr the tr element to extract building information from
 * @returns a JSON object containing information about a building
 */
export function retrieveBuilding(tr: Element): BuildingInfo {
	const result = {};

	if (tr?.childNodes === undefined) {
		return result as BuildingInfo;
	}

	for (const td of getAllTd(tr)) {
		const queryKeyClass = getIdentifierClass(td as Element);

		if (identifierClassToProcessor.get(queryKeyClass as any) !== undefined) {
			identifierClassToProcessor.get(queryKeyClass as any)(result, td as Element);
		}
	}

	return result as BuildingInfo;
}

export function isBuildingInfoValid(building: BuildingInfo): boolean {
	for (const key of []) {
		if (building[key as keyof BuildingInfo] === undefined) {
			return false;
		}
	}

	return true;
}
