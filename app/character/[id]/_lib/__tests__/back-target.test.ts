import assert from "node:assert/strict";
import { test } from "node:test";
import { backTarget } from "../back-target.ts";

test("backTarget", () => {
	const id = "abc";
	assert.equal(backTarget(`/character/${id}`, id), "/");
	assert.equal(backTarget(`/character/${id}/crew`, id), `/character/${id}`);
	assert.equal(
		backTarget(`/character/${id}/crew/specials`, id),
		`/character/${id}/crew`,
	);
	assert.equal(
		backTarget(`/character/${id}/crew/tag/t1`, id),
		`/character/${id}/crew`,
	);
	assert.equal(backTarget(`/character/${id}/theme/t1`, id), `/character/${id}`);
	assert.equal(
		backTarget(`/character/${id}/theme/t1/specials`, id),
		`/character/${id}/theme/t1`,
	);
	assert.equal(
		backTarget(`/character/${id}/theme/t1/tag/tg1`, id),
		`/character/${id}/theme/t1`,
	);
	assert.equal(
		backTarget(`/character/${id}/evolution/veteran-specials`, id),
		`/character/${id}/evolution`,
	);
});
