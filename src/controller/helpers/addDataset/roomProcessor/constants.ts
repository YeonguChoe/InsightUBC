export const validHTMLClass = "views-field";

// export const roomClassToKey = {
// 	[`${validHTMLClass}-nothing`]: "href",
// 	[`${validHTMLClass}-field-room-number`]: "number",
// 	[`${validHTMLClass}-field-room-capacity`]: "seats",
// 	[`${validHTMLClass}-field-room-furniture`]: "furniture",
// 	[`${validHTMLClass}-field-room-type`]: "type"
// };
export const validIndexTableClass = [
	`${validHTMLClass}-field-building-image`,
	`${validHTMLClass}-field-building-code`,
	`${validHTMLClass}-field-building-address`,
	`${validHTMLClass}-title`,
	`${validHTMLClass}-nothing`,
];

export const buildingClassToKey = {
	[`${validHTMLClass}-field-building-code`]: "shortname",
	[`${validHTMLClass}-field-building-address`]: "address",
	[`${validHTMLClass}-field-title`]: "fullname",
	[`${validHTMLClass}-nothing`]: "href",
};
