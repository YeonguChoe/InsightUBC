export function isTypeOf(obj: unknown, type: unknown): boolean {
	return obj?.constructor === type;
}
