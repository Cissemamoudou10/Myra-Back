import { test } from "node:test";
import assert from "node:assert/strict";
import { motsRecherche } from "./recherche.js";

test("motsRecherche : minuscules, sans accents, mots séparés", () => {
  assert.deepEqual(motsRecherche("  Crème  HYDRATANTE "), ["creme", "hydratante"]);
  assert.deepEqual(motsRecherche("Sérum éclat"), ["serum", "eclat"]);
});

test("motsRecherche : retire les caractères spéciaux de LIKE et gère le vide", () => {
  assert.deepEqual(motsRecherche("100% _test"), ["100", "test"]);
  assert.deepEqual(motsRecherche(""), []);
  assert.deepEqual(motsRecherche(undefined), []);
});
