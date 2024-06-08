import path from "path";
import fs from "fs-extra";
import JSZip from "jszip";
import {parse} from "parse5";

import {InsightDatasetKind, InsightError} from "../../../IInsightFacade";
import {JSONObject} from "../../types";

let stringKeys: string[];
stringKeys = ["id", "Course", "Title", "Professor", "Subject"];
let numberKeys: Array<string | any>;
numberKeys = ["Year", "Avg", "Pass", "Fail", "Audit"];

let keyPairs: {[key: string]: string} = {
	id: "uuid",
	Course: "id",
	Title: "title",
	Professor: "instructor",
	Subject: "dept",
	Year: "year",
	Avg: "avg",
	Pass: "pass",
	Fail: "fail",
	Audit: "audit",
};

export async function extractSection(zip: JSZip, id: string): Promise<Array<{[p: string]: any}>> {
	const zip1 = zip.folder("courses");
	if (zip1 === null) {
		throw new InsightError("no courses directory found");
	}

	let fileContents: Array<Promise<string>> = [];

	// Read the files that are located inside the `courses` directory
	zip1.forEach((relativePath, file) => {
		fileContents.push(file.async("string"));
	});

	const content = Promise.all(fileContents);
	const courses = await validateContent(id, content);

	if (courses.length < 1) {
		throw new InsightError("no valid sections found");
	}

	return courses;
}

export function validateContent(id: string, promise: Promise<string[]>): Promise<Array<{[key: string]: any}>> {
	return promise.then((fileContents: string[]) => {
		let sections: Array<{[key: string]: any}> = [];
		// Filter out the valid sections from the invalid ones
		for (const file of fileContents) {
			const course = validateCourse(id, file);

			// Check if the course is valid or not
			if (typeof course === "boolean") {
				continue;
			}

			sections = sections.concat(course as Array<{[key: string]: any}>);
		}

		return sections;
	});
}

/**
 * Validate a `section` object
 *
 * @param section The `section` object in question
 *
 * @return boolean
 *
 * A valid `section` should contain all of the valid query keys
 * with their appropriate types as specified on the Checkpoint 0 page:
 *
 * https://sites.google.com/view/ubc-cpsc310-22w2/project/c0?authuser=0#h.ue8blowppk4w
 *
 * If the `section` is invalid, the function returns true.
 * Otherwise, it returns false
 *
 */

// validate the section based on the values (id, course....)
// "Year": "2022" -> convert to int,  >1900
// typeof, isNaN("2022"), undefined
// 1) Convert string to int, check type, check isNan
export function validateSection(section: JSONObject): boolean {
	// Convert StringArray to IntegerArray
	const numKey = [];
	for (let x = 0; x < numberKeys.length; x++) {
		numKey.push(parseInt(section[numberKeys[x]] as string, 10));
		// Check if type is number
		if (typeof numKey[x] !== "number" || isNaN(numKey[x])) {
			return false;
		}
	}

	if (numKey[0] < 1900) {
		return false;
	}

	for (const y of stringKeys) {
		// If type is array or object return false
		if (["object", "undefined"].includes(typeof section[y])) {
			return false;
		}
	}
	return true;
}

/**
 * Validate a `course` object
 *
 * @param courseFile the content of a course file
 *
 * @returns boolean or array of objects
 *
 * A valid `course` object contains a valid array of section
 * under the `result` key.
 *
 * If the `course` is invalid, the function returns false.
 * Otherwise it returns an array of section objects.
 */
export function validateCourse(id: string, courseFile: string): Array<{[key: string]: any}> | boolean {
	// Try parsing the courseFile into JSON
	let course = null;
	try {
		course = JSON.parse(courseFile);
	} catch (error) {
		return false;
	}

	// Verify that the `result` key is an array
	if (!Array.isArray(course.result)) {
		return false;
	}

	// Validate each element of the `result` array
	const validatedCourse: Array<{[key: string]: any}> = [];

	for (const section of course.result) {
		if (validateSection(section)) {
			const payload: JSONObject = {};
			for (const key of numberKeys) {
				if (key === "Year") {
					if (section.Section === "overall") {
						payload[`${id}_${keyPairs[key]}`] = 1900;
						continue;
					}
				}
				payload[`${id}_${keyPairs[key]}`] = parseFloat(section[key]);
			}
			for (const key of stringKeys) {
				payload[`${id}_${keyPairs[key]}`] = String(section[key]);
			}
			validatedCourse.push(payload);
		}
	}

	if (validatedCourse.length === 0) {
		return false;
	}

	return validatedCourse;
}
