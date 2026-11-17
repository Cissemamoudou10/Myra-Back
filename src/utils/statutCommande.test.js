import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { STATUTS } from "../models/Commande.js";
import { peutPasser, verifierTransition, TRANSITIONS } from "./statutCommande.js";
import AppError from "./AppError.js";

describe("peutPasser", () => {
  test("autorise le parcours nominal d'une commande", () => {
    assert.equal(peutPasser(STATUTS.EN_ATTENTE, STATUTS.SIGNALE), true);
    assert.equal(peutPasser(STATUTS.SIGNALE, STATUTS.PAYEE), true);
    assert.equal(peutPasser(STATUTS.PAYEE, STATUTS.EN_LIVRAISON), true);
    assert.equal(peutPasser(STATUTS.EN_LIVRAISON, STATUTS.LIVREE), true);
  });

  test("autorise le paiement direct sans signalement préalable", () => {
    assert.equal(peutPasser(STATUTS.EN_ATTENTE, STATUTS.PAYEE), true);
  });

  test("autorise l'expiration uniquement depuis en_attente_paiement", () => {
    assert.equal(peutPasser(STATUTS.EN_ATTENTE, STATUTS.EXPIREE), true);
    assert.equal(peutPasser(STATUTS.SIGNALE, STATUTS.EXPIREE), false);
    assert.equal(peutPasser(STATUTS.PAYEE, STATUTS.EXPIREE), false);
  });

  test("autorise l'annulation tant que la commande n'est ni livrée ni expirée", () => {
    assert.equal(peutPasser(STATUTS.EN_ATTENTE, STATUTS.ANNULEE), true);
    assert.equal(peutPasser(STATUTS.SIGNALE, STATUTS.ANNULEE), true);
    assert.equal(peutPasser(STATUTS.PAYEE, STATUTS.ANNULEE), true);
    assert.equal(peutPasser(STATUTS.EN_LIVRAISON, STATUTS.ANNULEE), true);
  });

  test("interdit de revenir en arrière dans le cycle", () => {
    assert.equal(peutPasser(STATUTS.PAYEE, STATUTS.EN_ATTENTE), false);
    assert.equal(peutPasser(STATUTS.EN_LIVRAISON, STATUTS.SIGNALE), false);
    assert.equal(peutPasser(STATUTS.LIVREE, STATUTS.EN_LIVRAISON), false);
  });

  test("interdit de sauter des étapes vers la livraison", () => {
    assert.equal(peutPasser(STATUTS.EN_ATTENTE, STATUTS.EN_LIVRAISON), false);
    assert.equal(peutPasser(STATUTS.EN_ATTENTE, STATUTS.LIVREE), false);
    assert.equal(peutPasser(STATUTS.SIGNALE, STATUTS.LIVREE), false);
  });

  test("les états finaux (livree, annulee, expiree) n'ont aucune transition sortante", () => {
    for (const etatFinal of [STATUTS.LIVREE, STATUTS.ANNULEE, STATUTS.EXPIREE]) {
      assert.deepEqual(TRANSITIONS[etatFinal], []);
      for (const cible of Object.values(STATUTS)) {
        assert.equal(peutPasser(etatFinal, cible), false, `${etatFinal} -> ${cible} devrait être refusé`);
      }
    }
  });
});

describe("verifierTransition", () => {
  test("ne lève pas d'erreur pour une transition autorisée", () => {
    assert.doesNotThrow(() => verifierTransition(STATUTS.PAYEE, STATUTS.EN_LIVRAISON));
  });

  test("lève une AppError 409 TRANSITION_INVALIDE pour une transition interdite", () => {
    assert.throws(
      () => verifierTransition(STATUTS.LIVREE, STATUTS.ANNULEE),
      (err) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, "TRANSITION_INVALIDE");
        return true;
      }
    );
  });
});
