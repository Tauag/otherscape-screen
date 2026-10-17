import assert from "node:assert/strict";
import { test } from "node:test";
import { parseInviteTarget } from "./invite-target.ts";

test("invite target is told apart by shape", () => {
	assert.deepEqual(parseInviteTarget(" 123456789012345678 "), {
		kind: "discord",
		value: "123456789012345678",
	});
	assert.deepEqual(parseInviteTarget("Me@Example.com"), {
		kind: "email",
		value: "me@example.com",
	});
	assert.equal(parseInviteTarget("12345"), null);
	assert.equal(parseInviteTarget("not an email"), null);
	assert.equal(parseInviteTarget(""), null);
});
