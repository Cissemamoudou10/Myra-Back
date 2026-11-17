import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { messagePaiement } from "./whatsapp.service.js";

describe("messagePaiement", () => {
  test("liste les deux moyens de paiement configurés", () => {
    const message = messagePaiement(15000, { orange_money_numero: "76612934", sarali_numero: "7647" });
    assert.match(message, /Orange Money : \*76612934\*/);
    assert.match(message, /Sarali : \*7647\*/);
    assert.match(message, /15\s000 FCFA/);
  });

  test("n'affiche que le moyen configuré", () => {
    const message = messagePaiement(5000, { orange_money_numero: null, sarali_numero: "7647" });
    assert.doesNotMatch(message, /Orange Money/);
    assert.match(message, /Sarali : \*7647\*/);
  });

  test("sans numéro configuré, invite la cliente à répondre", () => {
    const message = messagePaiement(5000, { orange_money_numero: null, sarali_numero: null });
    assert.match(message, /Répondez à ce message/);
  });
});
