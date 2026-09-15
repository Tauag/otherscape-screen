import assert from "node:assert/strict";
import { test } from "node:test";
import { decideRoute, isAuthCallbackPath } from "../route-decision.mjs";

test("anonymous is sent to login from a private route, but not looped from /login", () => {
  assert.equal(decideRoute({ pathname: "/", email: undefined }), "login");
  assert.equal(decideRoute({ pathname: "/character/123", email: undefined }), "login");
  assert.equal(decideRoute({ pathname: "/login", email: undefined }), "next");
});

test("anonymous can reach a public share link", () => {
  assert.equal(decideRoute({ pathname: "/s/abc", email: undefined }), "next");
});

test("anonymous can reach the not-invited page", () => {
  assert.equal(decideRoute({ pathname: "/not-invited", email: undefined }), "next");
});

test("signed in and invited passes through a private route, and /login sends them home", () => {
  assert.equal(decideRoute({ pathname: "/", email: "x@example.com", invited: true }), "next");
  assert.equal(decideRoute({ pathname: "/login", email: "x@example.com", invited: true }), "home");
});

test("signed in and invited is sent home from the not-invited page, not looped there", () => {
  assert.equal(decideRoute({ pathname: "/not-invited", email: "x@example.com", invited: true }), "home");
});

test("signed in but not invited is sent to not-invited from anywhere, including /login", () => {
  assert.equal(decideRoute({ pathname: "/", email: "x@example.com", invited: false }), "not-invited");
  assert.equal(decideRoute({ pathname: "/login", email: "x@example.com", invited: false }), "not-invited");
  assert.equal(decideRoute({ pathname: "/not-invited", email: "x@example.com", invited: false }), "next");
});

test("a signed-in email with no invite check counts as not invited (fail closed)", () => {
  assert.equal(decideRoute({ pathname: "/", email: "x@example.com" }), "not-invited");
});

test("the OAuth callback always runs, regardless of session or invite state", () => {
  for (const email of [undefined, "x@example.com"]) {
    assert.equal(isAuthCallbackPath("/auth/callback"), true);
    assert.equal(decideRoute({ pathname: "/auth/callback", email }), "next");
  }
});
