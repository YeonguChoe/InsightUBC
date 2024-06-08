export const validKeys: string[] = [
	"uuid",
	"id",
	"title",
	"instructor",
	"dept",
	"fullname",
	"shortname",
	"number",
	"name",
	"address",
	"type",
	"furniture",
	"href",
	"year",
	"avg",
	"pass",
	"fail",
	"audit",
	"lat",
	"lon",
	"seats"
];

export const startStringKeyIndex = 0;
export const endStringKeyIndex = 13;

// Hardcoded stuff REMOVE LATER
const s = "sections";
const r = "rooms";
export const invalidQueryKeys = [
	`${r}_uuid`,
	`${r}_id`,
	`${r}_title`,
	`${r}_instructor`,
	`${r}_dept`,
	`${s}_fullname`,
	`${s}_shortname`,
	`${s}_number`,
	`${s}_name`,
	`${s}_address`,
	`${s}_type`,
	`${s}_furniture`,
	`${s}_href`,
	`${r}_year`,
	`${r}_avg`,
	`${r}_pass`,
	`${r}_fail`,
	`${r}_audit`,
	`${s}_lat`,
	`${s}_lon`,
	`${s}_seats`
];
