import assert from "node:assert/strict";
import { test } from "node:test";
import { sample } from "./character/__tests__/sample.ts";
import { FALLBACK_PACK, questionLabel, type ContentPack } from "./content/pack.ts";
import {
  answerCounts,
  formatSpecial,
  powerQuestions,
  specialName,
  specialsOf,
  weaknessQuestions,
} from "./pickers.ts";

const troubledPast = sample.themes[0];

test("every power letter stays offered, however often it is already answered", () => {
  assert.deepEqual(
    powerQuestions(FALLBACK_PACK, troubledPast.themebook).map((question) => question.letter),
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  );
  assert.deepEqual(troubledPast.powerTags.map((tag) => tag.letter), ["A", "C", "C"]);
});

test("every weakness letter stays offered too", () => {
  assert.deepEqual(
    weaknessQuestions(FALLBACK_PACK, troubledPast.themebook).map((question) => question.letter),
    ["A", "B", "C", "D"],
  );
});

test("a homebrew themebook offers the whole range with no text, and no specials", () => {
  const questions = powerQuestions(FALLBACK_PACK, "The Dog That Follows Me");
  assert.equal(questions.length, 10);
  assert.deepEqual([...new Set(questions.map((question) => question.text))], [""]);
  assert.equal(weaknessQuestions(FALLBACK_PACK, "The Dog That Follows Me").length, 4);
  assert.deepEqual(specialsOf(FALLBACK_PACK, "The Dog That Follows Me"), []);
  // A blank question row is readable only because the label names it.
  assert.equal(questionLabel("power", questions[1].letter), "power tag question B");
});

test("a pack the player has uploaded carries its question text through", () => {
  const pack: ContentPack = {
    themebooks: [
      {
        ...FALLBACK_PACK.themebooks[0],
        powerQuestions: FALLBACK_PACK.themebooks[0].powerQuestions.map((question) => ({
          ...question,
          text: `Question ${question.letter}?`,
        })),
      },
    ],
  };
  assert.equal(powerQuestions(pack, pack.themebooks[0].name)[2].text, "Question C?");
});

test("a stored special keeps the name — text convention the sheet already uses", () => {
  const special = {
    name: "Borrowed Rites",
    text: "a power tag here may answer a question from any Mythos themebook.",
  };
  const stored = formatSpecial(special);
  assert.equal(stored, sample.themes[1].specials[0]);
  assert.equal(specialName(stored), "Borrowed Rites");
  // The pack is empty until it is uploaded, and an empty slot stores nothing.
  assert.equal(formatSpecial({ name: "", text: "" }), "");
});

test("answered letters count a question answered twice as twice", () => {
  assert.deepEqual(answerCounts(troubledPast.powerTags), { A: 1, C: 2 });
  assert.deepEqual(answerCounts(troubledPast.weaknessTags), { B: 1 });
  assert.deepEqual(answerCounts([]), {});
});
