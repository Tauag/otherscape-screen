import assert from "node:assert/strict";
import { test } from "node:test";
import { decideRoute, isAuthCallbackPath } from "../route-decision.mjs";

test("anonymous is sent to login from a private route, but not looped from /login", () => {
  assert.equal(decideRoute({ pathname: "/", email: undefined }), "login");
  assert.equal(decideRoute({ pathname: "/c/123", email: undefined }), "login");
  assert.equal(decideRoute({ pathname: "/login", email: undefined }), "next");
});

test("anonymous can reach a public share link", () => {
  assert.equal(decideRoute({ pathname: "/s/abc", email: undefined }), "next");
});

test("signed in passes through a private route, and /login sends them home", () => {
  assert.equal(decideRoute({ pathname: "/", email: "x@example.com" }), "next");
  assert.equal(decideRoute({ pathname: "/login", email: "x@example.com" }), "home");
});

test("the OAuth callback always runs, regardless of session state", () => {
  for (const email of [undefined, "x@example.com"]) {
    assert.equal(isAuthCallbackPath("/auth/callback"), true);
    assert.equal(decideRoute({ pathname: "/auth/callback", email }), "next");
  }
});
