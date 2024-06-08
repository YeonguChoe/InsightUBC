import JSZip from "jszip";
import {Element} from "parse5/dist/tree-adapters/default";

import {BuildingInfo, JSONObject} from "./types";
import {findValidTable, getAllValidTr, getTrDirectParent} from "./htmlUtil";
import {InsightError, InsightDatasetKind} from "../../../IInsightFacade";
import {isBuildingInfoValid, retrieveBuilding} from "./indexUtil";
import {stringList2jsonList} from "./fromHTMLtoRooms";

/**
 * Load a zip file into a JSZip object
 *
 * @param content the base64 string representation of the zip file
 * @returns a JSZip object representing the zip file
 */
async function loadZipToJSZip(content: string): Promise<JSZip> {
	const zip = new JSZip();
	return await zip.loadAsync(content, {base64: true}).catch((error) => {
		throw new InsightError("content is not a zip file");
	});
}

/**
 * Open the `index.htm` file of the zip file
 *
 * @param zip a JSZip representing the opened zip file
 * @returns the string content of `./index.htm` file in the zip file
 *
 * Throws an InsightError if there is no `index.htm` file in the zip file
 */
function openIndexHTML(zip: JSZip): Promise<string> {
	const indexHTML = zip.file("index.htm");

	if (indexHTML === null) {
		throw new InsightError("index.htm doesn't exist");
	}

	return indexHTML.async("string");
}

export async function processRoomZipToBuildingsInfo(
	zip: JSZip,
	id: string
// ): Promise<BuildingInfo[]> {
): Promise<string[]> {
	// const zip = await loadZipToJSZip(content);
	const html = await openIndexHTML(zip);

	const trContainer = getTrDirectParent(findValidTable(html) as Element);

	if (trContainer === null) {
		throw new InsightError("No valid table in index.htm");
	}

	// const buildings: BuildingInfo[] = [];
	const buildings: string[] = [];
	const promises = [];

	for (const tr of getAllValidTr(trContainer)) {
		promises.push(serializeBuildingInfo(tr as Element, buildings, zip));
	}

	await Promise.all(promises);
	return buildings;
}

async function serializeBuildingInfo(tr: Element, collection: string[] /* BuildingInfo[]*/, zip: JSZip) {
	const buildingInfo = retrieveBuilding(tr as Element);
	const buildingFile = zip.file(buildingInfo.buildingFileContent.slice(2));
	const htmlContent = await buildingFile?.async("string");

	if (htmlContent !== null || htmlContent !== undefined) {
		buildingInfo.buildingFileContent = htmlContent as string;
	} else {
		return;
	}

	collection.push(buildingInfo.buildingFileContent);
}

export async function extractRooms(zip: JSZip, id: string): Promise<Array<{[p: string]: any}>> {
	const zip1 = zip.folder("rooms");
	if (zip1 === null) {
		throw new InsightError("no rooms directory found");
	}

	let fileContents: string[] = await processRoomZipToBuildingsInfo(zip, id);
	return stringList2jsonList(id, fileContents);
	// return Promise.resolve([]);
}
