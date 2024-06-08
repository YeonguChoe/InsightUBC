import {parse} from "parse5";
import {Attribute} from "parse5/dist/common/token";
import {Element, Document, TextNode} from "parse5/dist/tree-adapters/default";

import {validHTMLClass, validIndexTableClass} from "./constants";

/**
 * Function for finding a valid table in a html file
 *
 * @param htmlString the string content of a html file
 * @returns the desired table element
 */
export function findValidTable(htmlString: string): Element | null {
	const indexDoc = parse(htmlString);
	const htmlDocument = getRootHTMLElement(indexDoc);

	return findTableRecursion(htmlDocument as Element);
}

/**
 * Helper function that recurse through the HTML file to find the valid table
 *
 * @param currentNode the current node that the function is recursing on
 * @returns the desired table element
 */
function findTableRecursion(currentNode: Element): Element | null {
	if (elementIsTr(currentNode)) {
		if (
			trContainsValidTd(currentNode) &&
			trContainsRequiredTds(currentNode, validIndexTableClass)
		) {
			return getParentTable(currentNode);
		}

		return null;
	}

	if (!elementHasChildren(currentNode)) {
		return null;
	}

	for (const child of currentNode.childNodes) {
		const result = findTableRecursion(child as Element);
		if (result !== null) {
			return result;
		}
	}

	return null;
}

export function getRootHTMLElement(document: Document): Element | null {
	for (const element of document.childNodes) {
		if (element.nodeName === "html") {
			return element as Element;
		}
	}

	return null;
}

export function getAllValidTr(table: Element): Element[] {
	const trContainer = getTrDirectParent(table);
	const result: Element[] = [];

	for (const tr of trContainer.childNodes) {
		if (trContainsValidTd(tr as Element)) {
			result.push(tr as Element);
		}
	}

	return result;
}

export function trContainsRequiredTds(tr: Element, classList: string[]) {
	const classSet: Set<string> = new Set<string>(classList);
	const tds: Element[] = getAllTd(tr);

	for (const td of tds) {
		if (!elementContainsClass(td, validHTMLClass)) {
			continue;
		}

		const identifierClass: string | null = getIdentifierClass(td);
		if (classSet.has(identifierClass as string)) {
			classSet.delete(identifierClass as string);
		}
	}

	return classSet.size === 0;
}

export function getAllTd(tr: Element): Element[] {
	if (tr?.childNodes === undefined) {
		return [];
	}

	const result: Element[] = [];

	for (const e of tr.childNodes) {
		if (isElementOfType(e as Element, "td") && elementContainsClass(e as Element, validHTMLClass)) {
			result.push(e as Element);
		}
	}

	return result;
}

export function getTrDirectParent(table: Element): Element {
	for (const element of table.childNodes) {
		if (element.nodeName === "tbody") {
			return element;
		}
	}

	return table;
}

export function trContainsValidTd(tr: Element): boolean {
	if (!elementHasChildren(tr)) {
		return false;
	}

	for (const td of tr.childNodes) {
		if (elementContainsClass(td as Element, validHTMLClass)) {
			return true;
		}
	}

	return false;
}

/**
 * Retrieve the `class` attribute of an HTML element
 *
 * @param element the element whose class is to be searched
 * @param attrName the name of the attribute to be retrieved
 * @returns an Attribute object that contains the list of class
 *
 * Returns the element's `class` Attribute, null if the element doesn't have
 * the `class` attribute
 */
export function getAttr(element: Element, attrName: string): Attribute | null {
	if (element?.attrs === undefined) {
		return null;
	}

	for (const attr of element.attrs) {
		if (attr.name === attrName) {
			return attr;
		}
	}

	return null;
}

/**
 * Helper function to retrieve the first identifier class (i.e. fields-view-XXX)
 * for which query key the td element corresponds to
 *
 * @param td the td element from which the identifier class is to be retrieved from
 * @returns the identifer class string
 */
export function getIdentifierClass(td: Element): string | null {
	const classString: Attribute | null = getAttr(td, "class");

	if (classString === null) {
		return null;
	}

	const classList: string[] = classAttrToClassList(classString);
	const filteredClassList = classList.filter((value) => value !== validHTMLClass);

	for (const c of filteredClassList) {
		if (c.startsWith(validHTMLClass)) {
			return c;
		}
	}

	return null;
}

/**
 * Checks if a class string contains a valid class
 *
 * @param classAttr the class Attribute object
 * @param className the class name
 * @returns true if the class attribute contains the valid class
 */
export function classListContainsClass(classAttr: Attribute, className: string): boolean {
	const classList: string[] = classAttrToClassList(classAttr);
	return classList.includes(className);
}

export function elementContainsClass(element: Element, className: string): boolean {
	let classAttr: Attribute | null = getAttr(element, "class");

	if (classAttr === null) {
		return false;
	}

	return classListContainsClass(classAttr, className);
}

/**
 * Get the parent table element of a given HTML element.
 *
 * @param element an element associated with the table element (tr, td, thead, tbody, etc.)
 * @returns a table element
 *
 * The element passed through as an argument is assumed to be a children element inside
 * a table element.
 */
export function getParentTable(element: Element): Element {
	let result: Element = element;

	while (result.nodeName !== "table") {
		result = result?.parentNode as Element;
	}

	return result;
}

export function elementIsTr(element: Element): boolean {
	return element?.nodeName === "tr";
}

export function elementHasChildren(element: Element): boolean {
	return element?.childNodes !== undefined;
}

export function classAttrToClassList(classAttr: Attribute): string[] {
	return classAttr.value.split(" ");
}

export function isElementOfType(element: Element, tag: string): boolean {
	return element.nodeName === tag;
}

export function getDirectChildOfType(parent: Element, tag: string): Element | null {
	if (!elementHasChildren(parent)) {
		return null;
	}

	for (const child of parent.childNodes) {
		if (isElementOfType(child as Element, tag)) {
			return child as Element;
		}
	}

	return null;
}
