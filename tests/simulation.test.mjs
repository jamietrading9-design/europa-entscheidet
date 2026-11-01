import assert from "node:assert/strict";
import test from "node:test";
import {
  answerOffer,
  createCampaign,
  endTurn,
  enactLaw,
  makeInvestment,
  procureEquipment,
  proposeAgreement,
  saveCampaign,
  useDefenseAction,
  useDiplomacyAction,
  loadCampaign,
} from "../simulation.js";

const countries = [
  { id: "alpha", name: "Alfa", flag: "🇦🇱" },
  { id: "beta", name: "Beta", flag: "🇧🇪" },
  { id: "gamma", name: "Gamma", flag: "🇬🇷" },
];
const profile = { gdp: { value: 130_000_000_000 }, population: { value: 5_000_000 } };
const profiles = Object.fromEntries(countries.map((country) => [country.name, profile]));
const aircraft = {};
const createGame = () => createCampaign(countries[0], profile, countries, profiles, aircraft);

test("campaign creates relations for every other country", () => {
  const game = createGame();
  assert.equal(game.relations.length, countries.length - 1);
  assert.equal(game.round, 1);
  assert.equal(game.actions.government, false);
  assert.ok(game.treasury > 0);
});

test("investment charges once and blocks a second government action", () => {
  const game = createGame();
  const balance = game.treasury;
  assert.equal(makeInvestment(game, "education").ok, true);
  assert.equal(game.treasury, balance - 16);
  const second = makeInvestment(game, "welfare");
  assert.equal(second.ok, false);
  assert.equal(game.treasury, balance - 16);
});

test("law can be enacted and repealed in separate rounds", () => {
  const game = createGame();
  const before = game.treasury;
  assert.equal(enactLaw(game, "integrity").passed, true);
  assert.ok(game.laws.includes("integrity"));
  assert.equal(game.treasury, before - 8);
  endTurn(game, () => 1);
  assert.equal(enactLaw(game, "integrity").repealed, true);
  assert.ok(!game.laws.includes("integrity"));
});

test("agreement acceptance and refusal update state and costs", () => {
  const accepted = createGame();
  assert.equal(proposeAgreement(accepted, "beta", "trade", () => 0).accepted, true);
  assert.ok(accepted.relations.find((relation) => relation.id === "beta").treaties.includes("trade"));
  const acceptedBalance = accepted.treasury;
  assert.equal(proposeAgreement(accepted, "beta", "trade", () => 0).ok, false);
  assert.equal(accepted.treasury, acceptedBalance);

  const refused = createGame();
  const balance = refused.treasury;
  assert.equal(proposeAgreement(refused, "beta", "trade", () => 1).accepted, false);
  assert.equal(refused.treasury, balance - 5);
});

test("incoming offer costs one diplomatic action and rejects invalid acceptance", () => {
  const game = createGame();
  game.offer = { nationId: "beta", nationName: "Beta", type: "trade", cost: 5 };
  assert.equal(answerOffer(game, false).ok, true);
  assert.equal(game.actions.diplomacy, true);
  assert.equal(game.offer, null);
  assert.equal(useDiplomacyAction(game, "aid").ok, false);

  const cannotAfford = createGame();
  cannotAfford.offer = { nationId: "beta", nationName: "Beta", type: "trade", cost: 5 };
  cannotAfford.treasury = 0;
  assert.equal(answerOffer(cannotAfford, true).ok, false);
  assert.ok(cannotAfford.offer);
  assert.equal(cannotAfford.actions.diplomacy, false);
});

test("aid and sanctions enforce their costs", () => {
  const game = createGame();
  game.selectedNationId = "beta";
  const balance = game.treasury;
  assert.equal(useDiplomacyAction(game, "aid").ok, true);
  assert.equal(game.treasury, balance - 8);

  const poor = createGame();
  poor.selectedNationId = "beta";
  poor.treasury = 2;
  assert.equal(useDiplomacyAction(poor, "sanctions").ok, false);
  assert.equal(poor.actions.diplomacy, false);
  assert.equal(poor.treasury, 2);
});

test("quantity-based procurement checks budget and quantities before purchase", () => {
  const game = createGame();
  const quantities = { personnel: 1000, tanks: 2, ships: 1, aircraft: 1, missiles: 5 };
  const total = 1000 * 0.00005 + 2 * 0.35 + 1.8 + 1.25 + 5 * 0.06;
  const before = game.treasury;
  const result = procureEquipment(game, quantities);
  assert.equal(result.ok, true);
  assert.equal(result.cost, total);
  assert.equal(game.treasury, Number((before - total).toFixed(3)));
  assert.deepEqual(game.inventory, { personnel: 16000, tanks: 14, ships: 3, aircraft: 9, missiles: 29 });
  assert.equal(game.actions.defense, true);
  assert.equal(procureEquipment(game, quantities).ok, false);

  const invalid = createGame();
  const invalidBalance = invalid.treasury;
  assert.equal(procureEquipment(invalid, { personnel: -100 }).ok, false);
  assert.equal(procureEquipment(invalid, { personnel: 20001 }).ok, false);
  assert.equal(procureEquipment(invalid, {}).ok, false);
  assert.equal(invalid.treasury, invalidBalance);

  const unaffordable = createGame();
  unaffordable.treasury = 1;
  assert.equal(procureEquipment(unaffordable, { personnel: 0, tanks: 10, ships: 0, aircraft: 0, missiles: 0 }).ok, false);
  assert.equal(unaffordable.actions.defense, false);
});

test("embassies improve relations and add recurring upkeep", () => {
  const game = createGame();
  game.selectedNationId = "beta";
  const relation = game.relations.find((item) => item.id === "beta");
  const score = relation.score;
  const balance = game.treasury;
  assert.equal(useDiplomacyAction(game, "embassy").ok, true);
  assert.equal(relation.embassy, true);
  assert.equal(relation.score, score + 10);
  assert.equal(game.treasury, balance - 4);
  assert.equal(useDiplomacyAction(game, "embassy").ok, false);

  const withEmbassy = createGame();
  const withoutEmbassy = createGame();
  withEmbassy.relations[0].embassy = true;
  endTurn(withEmbassy, () => 1);
  endTurn(withoutEmbassy, () => 1);
  assert.equal(withoutEmbassy.treasury - withEmbassy.treasury, 0.5);
  assert.equal(withEmbassy.relations[0].score, withoutEmbassy.relations[0].score + 1);
});

test("peace law prevents starting a conflict", () => {
  const game = createGame();
  assert.equal(enactLaw(game, "peace").passed, true);
  game.actions.defense = false;
  const balance = game.treasury;
  const result = useDefenseAction(game, "intervention");
  assert.equal(result.ok, false);
  assert.equal(game.conflict, null);
  assert.equal(game.treasury, balance);
});

test("majority peace conference ends conflict and blocks new interventions", () => {
  const game = createGame();
  game.relations.forEach((relation) => { relation.score = 90; });
  game.selectedNationId = "beta";
  assert.equal(useDefenseAction(game, "intervention", () => 0).ok, true);
  assert.ok(game.conflict);
  endTurn(game, () => 1);

  const result = useDiplomacyAction(game, "peaceConference");
  assert.equal(result.ok, true);
  assert.equal(result.passed, true);
  assert.equal(game.conflict, null);
  assert.equal(game.peacePactUntil, game.round + 3);

  game.actions.defense = false;
  const balance = game.treasury;
  assert.equal(useDefenseAction(game, "intervention").ok, false);
  assert.equal(game.treasury, balance);
});

test("peace conference without enough major-state support fails cleanly", () => {
  const game = createGame();
  game.relations.forEach((relation) => { relation.score = 30; });
  const balance = game.treasury;
  const result = useDiplomacyAction(game, "peaceConference");
  assert.equal(result.ok, true);
  assert.equal(result.passed, false);
  assert.equal(result.supporters, 0);
  assert.equal(game.treasury, balance - 8);
  assert.equal(game.peacePactUntil, 0);
  assert.equal(game.actions.diplomacy, true);
});

test("neutrality ends a conflict without starting a ceasefire resolution", () => {
  const game = createGame();
  game.selectedNationId = "beta";
  useDefenseAction(game, "intervention", () => 0);
  endTurn(game, () => 1);
  const result = useDefenseAction(game, "neutrality");
  assert.equal(result.ok, true);
  assert.equal(game.conflict, null);
  assert.equal(game.actions.defense, true);
});

test("peace talks target the active conflict even if another country is selected", () => {
  const game = createGame();
  game.selectedNationId = "beta";
  assert.equal(useDefenseAction(game, "intervention", () => 0).ok, true);
  game.selectedNationId = "gamma";
  assert.equal(useDiplomacyAction(game, "talks").ok, true);
  assert.equal(game.conflict.ceasefireOffer, true);
});

test("withdrawal and ceasefire both resolve conflicts", () => {
  const retreat = createGame();
  retreat.selectedNationId = "beta";
  useDefenseAction(retreat, "intervention", () => 0);
  endTurn(retreat, () => 1);
  assert.equal(useDefenseAction(retreat, "retreat").ok, true);
  assert.equal(retreat.conflict, null);

  const ceasefire = createGame();
  ceasefire.selectedNationId = "beta";
  useDefenseAction(ceasefire, "intervention", () => 0);
  endTurn(ceasefire, () => 1);
  assert.equal(useDefenseAction(ceasefire, "ceasefire", () => 0).ok, true);
  assert.equal(ceasefire.conflict, null);
});

test("turn advances finances and resets only the new round's actions", () => {
  const game = createGame();
  makeInvestment(game, "education");
  const round = game.round;
  assert.equal(endTurn(game, () => 1).ok, true);
  assert.equal(game.round, round + 1);
  assert.deepEqual(game.actions, { government: false, diplomacy: false, defense: false });
  assert.ok(game.treasury >= 0);
});

test("save and restore preserve used actions and discard invalid offers", () => {
  const game = createGame();
  makeInvestment(game, "economy");
  game.offer = { nationId: "beta", nationName: "Beta", type: "unknown", cost: -50 };
  const restored = loadCampaign(saveCampaign(game), countries);
  assert.ok(restored);
  assert.equal(restored.actions.government, true);
  assert.equal(restored.offer, null);
  assert.deepEqual(restored.inventory, game.inventory);
  const oldSave = JSON.parse(saveCampaign(game));
  delete oldSave.inventory;
  delete oldSave.peacePactUntil;
  oldSave.relations.forEach((relation) => { delete relation.embassy; });
  const migrated = loadCampaign(JSON.stringify(oldSave), countries);
  assert.deepEqual(migrated.inventory, { personnel: 15000, tanks: 12, ships: 2, aircraft: 8, missiles: 24 });
  assert.equal(migrated.peacePactUntil, 0);
  assert.equal(loadCampaign("{invalid", countries), null);
  const malformed = JSON.parse(saveCampaign(game));
  malformed.treasury = "unavailable";
  assert.equal(loadCampaign(JSON.stringify(malformed), countries), null);
});
