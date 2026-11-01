export const investments = [
  { id: "economy", icon: "↗", title: "Wirtschaft ankurbeln", description: "Unternehmen und Infrastruktur fördern.", cost: 20 },
  { id: "welfare", icon: "♡", title: "Menschen unterstützen", description: "Hilfen für Familien und soziale Einrichtungen.", cost: 18 },
  { id: "education", icon: "✳", title: "In Bildung investieren", description: "Schulen, Forschung und Ausbildung stärken.", cost: 16 },
  { id: "defense", icon: "⬡", title: "Zivilschutz stärken", description: "Katastrophenschutz und Verteidigungsbereitschaft ausbauen.", cost: 21 },
];

export const laws = [
  { id: "social", name: "Sozialpaket", description: "Mehr Unterstützung. Verlässlichere soziale Sicherung.", cost: 12, upkeep: 2, effects: { prosperity: 2, approval: 1 } },
  { id: "education", name: "Bildungsoffensive", description: "Dauerhafte Investitionen in Schulen und Ausbildung.", cost: 16, upkeep: 2, effects: { economy: 1, prosperity: 1, legitimacy: 1 } },
  { id: "climate", name: "Klimaschutzgesetz", description: "Energiewende und widerstandsfähige Infrastruktur.", cost: 15, upkeep: 2, effects: { economy: 1, prosperity: 1, approval: 1 } },
  { id: "tax", name: "Faire Steuerreform", description: "Breitere Einnahmen für öffentliche Leistungen.", cost: 5, upkeep: 0, effects: { approval: -1, legitimacy: 1 }, income: 3 },
  { id: "defense", name: "Zivilschutzgesetz", description: "Mehr Geld für Bevölkerungsschutz und Bereitschaft.", cost: 12, upkeep: 3, effects: { defense: 2, approval: -1 } },
  { id: "integrity", name: "Transparenzgesetz", description: "Öffentliche Kontrolle und strengere Vergaberegeln.", cost: 8, upkeep: 1, effects: { legitimacy: 3, approval: 1 } },
  { id: "peace", name: "Friedensgesetz", description: "Die Regierung darf keine Konflikte beginnen und muss zuerst verhandeln.", cost: 10, upkeep: 0, effects: { approval: 3, legitimacy: 3 } },
];

export const procurementItems = [
  { id: "personnel", label: "Personal", unit: "Personen", step: 100, max: 20000, cost: 0.00005, upkeep: 0.000008, icon: "●" },
  { id: "tanks", label: "Panzer", unit: "Panzer", step: 1, max: 100, cost: 0.35, upkeep: 0.015, icon: "▰" },
  { id: "ships", label: "Schiffe", unit: "Schiffe", step: 1, max: 20, cost: 1.8, upkeep: 0.06, icon: "◈" },
  { id: "aircraft", label: "Flugzeuge", unit: "Flugzeuge", step: 1, max: 30, cost: 1.25, upkeep: 0.045, icon: "✈" },
  { id: "missiles", label: "Abstrakte Abwehrsysteme", unit: "Systeme", step: 1, max: 200, cost: 0.06, upkeep: 0.003, icon: "◇" },
];

export const agreements = [
  { id: "trade", name: "Handelsabkommen", cost: 5, description: "Gemeinsamer Handel stärkt die Wirtschaft beider Länder." },
  { id: "cooperation", name: "Kooperationsvertrag", cost: 7, description: "Forschung, Bildung und Infrastruktur gemeinsam fördern." },
  { id: "defense", name: "Beistandspakt", cost: 8, description: "Politische Unterstützung im Krisenfall. Kein Automatismus für einen Krieg." },
];

const natoMembers = new Set([
  "albania", "belgium", "bulgaria", "croatia", "czech-republic", "denmark", "estonia",
  "finland", "france", "germany", "greece", "hungary", "iceland", "italy", "latvia",
  "lithuania", "luxembourg", "montenegro", "netherlands", "north-macedonia", "norway",
  "poland", "portugal", "romania", "slovakia", "slovenia", "spain", "sweden", "turkey",
  "united-kingdom",
]);

const europeanUnionMembers = new Set([
  "austria", "belgium", "bulgaria", "croatia", "cyprus", "czech-republic", "denmark",
  "estonia", "finland", "france", "germany", "greece", "hungary", "ireland", "italy",
  "latvia", "lithuania", "luxembourg", "malta", "netherlands", "poland", "portugal",
  "romania", "slovakia", "slovenia", "spain", "sweden",
]);

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

function hashString(value) {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function seededValue(id, suffix) {
  return hashString(`${id}:${suffix}`) / 0xffffffff;
}

function economicIndex(profile) {
  const perCapita = profile?.gdp?.value && profile?.population?.value
    ? profile.gdp.value / profile.population.value
    : 26000;
  return clamp(Math.round(34 + (Math.log10(perCapita) - 3.8) * 36), 15, 88);
}

function alliancesFor(countryId) {
  return [
    ...(natoMembers.has(countryId) ? ["NATO"] : []),
    ...(europeanUnionMembers.has(countryId) ? ["EU"] : []),
  ];
}

function countryStyle(countryId, economy, defense) {
  if (economy - defense > 15) return "Wirtschaft";
  if (defense - economy > 18) return "Verteidigung";
  if (seededValue(countryId, "specialty") > .56) return "Diplomatie";
  return "Ausgewogen";
}

function diplomacyStyle(countryId) {
  const approach = seededValue(countryId, "diplomacy-style");
  return approach < .34 ? "Vorsichtig" : approach < .7 ? "Pragmatisch" : "Durchsetzungsstark";
}

function defenseIndex(countryId, aircraftByCountry) {
  const fleet = aircraftByCountry[countryId];
  const strength = fleet?.aircraft?.length ?? 0;
  return clamp(18 + strength * 9 + (fleet?.onOrder?.length ?? 0) * 2, 8, 92);
}

function relationLabel(relation) {
  if (relation.tension >= 70) return "Angespannt";
  if (relation.score >= 72) return "Enger Partner";
  if (relation.score >= 55) return "Gute Beziehungen";
  if (relation.score <= 32) return "Schwierig";
  return "Sachlich";
}

function makeLog(state, text, type = "normal") {
  state.log.unshift({ round: state.round, text, type });
  state.log.length = Math.min(state.log.length, 24);
}

function emptyInventory() {
  return { personnel: 15000, tanks: 12, ships: 2, aircraft: 8, missiles: 24 };
}

function startingInventory(countryId, population, defense, aircraftByCountry) {
  const aircraftCount = aircraftByCountry[countryId]?.aircraft?.length ?? 0;
  return {
    personnel: clamp(Math.round(population / 1000), 500, 20000),
    tanks: clamp(Math.round(5 + defense * .25), 6, 35),
    ships: clamp(Math.round(1 + defense / 30), 1, 6),
    aircraft: clamp(4 + aircraftCount * 3, 4, 60),
    missiles: clamp(Math.round(10 + defense * .55), 8, 70),
  };
}

function procurementCost(quantities) {
  return procurementItems.reduce((sum, item) => sum + (quantities[item.id] ?? 0) * item.cost, 0);
}

function grantTreaty(state, relation, type, makeLogEntry = true) {
  if (!relation.treaties.includes(type)) relation.treaties.push(type);
  relation.score = clamp(relation.score + 8);
  relation.trust = clamp(relation.trust + 9);
  if (type === "trade") {
    relation.tension = clamp(relation.tension - 10);
    state.economy = clamp(state.economy + 2);
  }
  if (type === "cooperation") {
    state.prosperity = clamp(state.prosperity + 2);
    state.legitimacy = clamp(state.legitimacy + 1);
  }
  if (type === "defense") state.defense = clamp(state.defense + 1);
  if (makeLogEntry) makeLog(state, `${relation.name}: ${agreements.find((item) => item.id === type)?.name ?? "Abkommen"} geschlossen.`, "diplomacy");
}

export function createCampaign(country, profile, allCountries, profiles, aircraftByCountry) {
  const gdpPerCapita = profile?.gdp?.value && profile?.population?.value
    ? profile.gdp.value / profile.population.value
    : 26000;
  const people = profile?.population?.value ?? 5_000_000;
  const gdp = profile?.gdp?.value ?? 130_000_000_000;
  const treasury = clamp(Math.round(25 + Math.sqrt(gdp / 1e9) * 2.7), 35, 185);
  const army = defenseIndex(country.id, aircraftByCountry);
  const economy = economicIndex(profile);
  const neighbors = allCountries.filter((item) => item.id !== country.id).map((other) => {
    const otherProfile = profiles[other.name];
    const otherGdp = otherProfile?.gdp?.value ?? 40_000_000_000;
    const otherArmy = defenseIndex(other.id, aircraftByCountry);
    const otherEconomy = economicIndex(otherProfile);
    const distance = Math.abs(seededValue(country.id, other.id) - .5);
    return {
      id: other.id,
      name: other.name,
      flag: other.flag,
      gdp: otherGdp,
      economy: otherEconomy,
      defense: otherArmy,
      population: otherProfile?.population?.value ?? 5_000_000,
      alliances: alliancesFor(other.id),
      style: diplomacyStyle(other.id),
      specialty: countryStyle(other.id, otherEconomy, otherArmy),
      score: Math.round(47 + (seededValue(country.id, `score:${other.id}`) - .5) * 28),
      trust: Math.round(48 + (seededValue(country.id, `trust:${other.id}`) - .5) * 20),
      tension: Math.round(distance * 30),
      treaties: [],
    };
  });

  const game = {
    version: 2,
    country,
    round: 1,
    treasury,
    economy,
    prosperity: clamp(Math.round(29 + (Math.log10(gdpPerCapita) - 3.4) * 23), 25, 82),
    defense: army,
    alliances: alliancesFor(country.id),
    specialty: countryStyle(country.id, economy, army),
    inventory: startingInventory(country.id, people, army, aircraftByCountry),
    approval: 61,
    legitimacy: 67,
    debt: Math.round(Math.max(0, treasury * (1.1 - seededValue(country.id, "debt")))),
    population: people,
    gdp,
    actions: { government: false, diplomacy: false, defense: false },
    laws: [],
    escalationRisk: 8,
    peacePactUntil: 0,
    relations: neighbors,
    selectedNationId: [...neighbors].sort((a, b) => b.gdp - a.gdp)[0]?.id ?? "",
    offer: null,
    conflict: null,
    news: { title: "Eine neue Regierung", text: "Dein Kabinett übernimmt. Das Parlament erwartet erste Entscheidungen.", type: "normal" },
    log: [],
    electionsWon: 0,
    daysInOffice: 0,
    lastSave: null,
    ended: false,
  };
  makeLog(game, `Regierungsübernahme in ${country.name}. Deine erste Amtszeit beginnt.`, "normal");
  return game;
}

export function getRelation(game, nationId) {
  return game.relations.find((relation) => relation.id === nationId) ?? null;
}

export function relationStatus(relation) {
  return relationLabel(relation);
}

export function enactLaw(game, lawId) {
  if (game.actions.government) return { ok: false, message: "Diese Runde hast du bereits eine Regierungsentscheidung getroffen." };
  const law = laws.find((item) => item.id === lawId);
  if (!law) return { ok: false, message: "Dieses Gesetz gibt es nicht." };
  const alreadyEnacted = game.laws.includes(lawId);
  const cost = alreadyEnacted ? 0 : law.cost;
  if (game.treasury < cost) return { ok: false, message: `Für dieses Gesetz fehlen ${cost - game.treasury} Mrd. €.` };
  const votes = Math.round(game.approval * .48 + game.legitimacy * .42 + (game.economy > 55 ? 6 : 0));
  if (!alreadyEnacted && votes < 39) {
    game.actions.government = true;
    game.approval = clamp(game.approval - 2);
    game.legitimacy = clamp(game.legitimacy - 3);
    makeLog(game, `Das Parlament lehnt das Gesetz „${law.name}“ ab. Der Streit kostet Vertrauen.`, "crisis");
    game.news = { title: "Keine Mehrheit im Parlament", text: `Der Gesetzesvorschlag „${law.name}“ ist gescheitert.`, type: "crisis" };
    return { ok: true, passed: false };
  }
  game.actions.government = true;
  game.treasury -= cost;
  if (alreadyEnacted) {
    game.laws = game.laws.filter((id) => id !== lawId);
    game.legitimacy = clamp(game.legitimacy + 1);
    makeLog(game, `Das Parlament hebt das Gesetz „${law.name}“ auf.`, "law");
    game.news = { title: "Gesetz aufgehoben", text: `Das Parlament hat „${law.name}“ aufgehoben.`, type: "normal" };
    return { ok: true, repealed: true };
  }
  game.laws.push(lawId);
  for (const [stat, effect] of Object.entries(law.effects)) game[stat] = clamp(game[stat] + effect);
  makeLog(game, `Das Parlament beschließt das Gesetz „${law.name}“.`, "law");
  game.news = { title: "Neues Gesetz beschlossen", text: `„${law.name}“ tritt in Kraft. Die Auswirkungen beginnen in dieser Runde.`, type: "normal" };
  return { ok: true, passed: true };
}

export function makeInvestment(game, investmentId) {
  if (game.actions.government) return { ok: false, message: "Deine Regierung hat diese Runde bereits gehandelt." };
  const investment = investments.find((item) => item.id === investmentId);
  if (!investment) return { ok: false, message: "Diese Investition ist nicht verfügbar." };
  if (game.treasury < investment.cost) return { ok: false, message: "Die Staatskasse reicht dafür nicht aus." };
  game.actions.government = true;
  game.treasury -= investment.cost;
  const effects = {
    economy: { economy: 7, approval: 1 },
    welfare: { prosperity: 7, approval: 3 },
    education: { economy: 3, prosperity: 3, legitimacy: 2 },
    defense: { defense: 7, legitimacy: 1 },
  }[investmentId];
  for (const [stat, effect] of Object.entries(effects)) game[stat] = clamp(game[stat] + effect);
  makeLog(game, `${investment.title}: −${investment.cost} Mrd. € Spielgeld.`, "government");
  game.news = { title: "Regierungsbeschluss", text: `${investment.description} Die Investition kostet ${investment.cost} Mrd. € Spielgeld.`, type: "normal" };
  return { ok: true };
}

export function procureEquipment(game, quantities) {
  if (game.actions.defense) return { ok: false, message: "Diese Runde hast du bereits über Sicherheit entschieden." };
  if (game.conflict) return { ok: false, message: "Während eines Konflikts sind neue Beschaffungen ausgesetzt." };
  const purchase = {};
  for (const item of procurementItems) {
    const quantity = quantities?.[item.id] ?? 0;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > item.max) {
      return { ok: false, message: `Die Menge für ${item.label} muss zwischen 0 und ${item.max} liegen.` };
    }
    purchase[item.id] = quantity;
  }
  if (!procurementItems.some((item) => purchase[item.id] > 0)) {
    return { ok: false, message: "Wähle mindestens eine positive Menge aus." };
  }
  const cost = procurementCost(purchase);
  if (cost > game.treasury) return { ok: false, message: `Für diese Beschaffung fehlen ${Number((cost - game.treasury).toFixed(2))} Mrd. €.` };
  game.inventory ??= startingInventory(game.country.id, game.population, game.defense, {});
  game.treasury = Number((game.treasury - cost).toFixed(3));
  for (const item of procurementItems) game.inventory[item.id] += purchase[item.id];
  const readiness = Math.min(20, Math.ceil(
    purchase.personnel / 2500
      + purchase.tanks * 0.3
      + purchase.ships * 0.6
      + purchase.aircraft * 0.5
      + purchase.missiles * 0.08,
  ));
  game.defense = clamp(game.defense + readiness);
  const militarySignal = Math.min(24, Math.ceil(
    purchase.personnel / 5000
      + purchase.tanks / 8
      + purchase.ships * 1.2
      + purchase.aircraft
      + purchase.missiles * .12,
  ));
  const target = getRelation(game, game.selectedNationId);
  if (target && militarySignal > 0) {
    target.tension = clamp(target.tension + militarySignal);
    target.score = clamp(target.score - Math.ceil(militarySignal / 3));
    target.trust = clamp(target.trust - Math.ceil(militarySignal / 4));
    for (const relation of game.relations) {
      if (relation.id !== target.id && target.alliances?.some((alliance) => relation.alliances?.includes(alliance))) {
        relation.tension = clamp(relation.tension + Math.ceil(militarySignal * .3));
      }
    }
    game.escalationRisk = clamp((game.escalationRisk ?? 8) + Math.ceil(militarySignal * .55));
  }
  game.actions.defense = true;
  const summary = procurementItems
    .filter((item) => purchase[item.id] > 0)
    .map((item) => `${purchase[item.id].toLocaleString("de-DE")} ${item.unit}`)
    .join(", ");
  makeLog(game, `Beschaffung: ${summary}. Kosten: ${cost.toLocaleString("de-DE", { maximumFractionDigits: 2 })} Mrd. € Spielgeld.`, "security");
  game.news = {
    title: "Beschaffung beschlossen",
    text: `${summary} verstärken den vereinfachten Verteidigungswert um ${readiness} Punkte.${militarySignal ? ` ${target?.name ?? "Andere Staaten"} reagieren auf die Aufrüstung; das Eskalationsrisiko steigt.` : ""}`,
    type: "security",
  };
  if (militarySignal) makeLog(game, `Die Beschaffung erhöht das Eskalationsrisiko um ${Math.ceil(militarySignal * .55)} Punkte.`, "crisis");
  return { ok: true, cost, readiness, militarySignal };
}

export function proposeAgreement(game, nationId, agreementId, random = Math.random) {
  if (game.actions.diplomacy) return { ok: false, message: "Deine Regierung hat diese Runde bereits einen diplomatischen Schritt getan." };
  const relation = getRelation(game, nationId);
  const agreement = agreements.find((item) => item.id === agreementId);
  if (!relation || !agreement) return { ok: false, message: "Wähle ein Land und ein gültiges Abkommen." };
  if (relation.treaties.includes(agreementId)) return { ok: false, message: "Dieses Abkommen besteht mit dem Land bereits." };
  if (game.treasury < agreement.cost) return { ok: false, message: "Die Staatskasse reicht für die Verhandlungen nicht aus." };
  game.actions.diplomacy = true;
  game.treasury -= agreement.cost;
  const resistance = agreementId === "defense" ? 14 : 0;
  const acceptance = clamp(relation.score * .48 + relation.trust * .25 - relation.tension * .27 - resistance + 20, 6, 94);
  if (random() * 100 < acceptance) {
    grantTreaty(game, relation, agreementId);
    game.news = { title: "Vertrag geschlossen", text: `${relation.name} nimmt dein Angebot für ein ${agreement.name} an.`, type: "diplomacy" };
    return { ok: true, accepted: true };
  }
  relation.score = clamp(relation.score - 2);
  makeLog(game, `${relation.name} lehnt das Angebot für ein ${agreement.name} ab.`, "diplomacy");
  game.news = { title: "Angebot abgelehnt", text: `${relation.name} hat die Verhandlungen beendet.`, type: "crisis" };
  return { ok: true, accepted: false };
}

export function answerOffer(game, accept) {
  if (!game.offer) return { ok: false, message: "Es liegt kein Angebot vor." };
  if (game.actions.diplomacy) return { ok: false, message: "Diese Runde hast du bereits einen diplomatischen Schritt getan." };
  const offer = game.offer;
  const relation = getRelation(game, offer.nationId);
  const agreement = agreements.find((item) => item.id === offer.type);
  if (!relation || !agreement) return { ok: false, message: "Dieses Vertragsangebot ist nicht mehr gültig." };
  if (relation.treaties.includes(offer.type)) return { ok: false, message: "Dieses Abkommen besteht mit dem Land bereits." };
  if (accept && game.treasury < offer.cost) return { ok: false, message: "Die Staatskasse reicht für die Annahme nicht aus." };
  game.actions.diplomacy = true;
  game.offer = null;
  if (accept) {
    game.treasury -= offer.cost;
    grantTreaty(game, relation, offer.type);
    game.news = { title: "Vertrag angenommen", text: `${relation.name}: ${agreement.name}.`, type: "diplomacy" };
    return { ok: true };
  }
  relation.score = clamp(relation.score - 1);
  makeLog(game, `Du lehnst das Angebot von ${offer.nationName} ab.`, "diplomacy");
  game.news = { title: "Angebot abgelehnt", text: `Das Angebot von ${offer.nationName} wurde abgelehnt.`, type: "normal" };
  return { ok: true };
}

export function useDiplomacyAction(game, actionId, random = Math.random) {
  if (game.actions.diplomacy) return { ok: false, message: "Diese Runde ist kein weiterer diplomatischer Schritt möglich." };
  if (actionId === "peaceConference") {
    const cost = 8;
    if (game.treasury < cost) return { ok: false, message: "Für eine europäische Friedenskonferenz fehlen 8 Mrd. €." };
    const majorPowers = [...game.relations].sort((left, right) => right.gdp - left.gdp).slice(0, 5);
    const supporters = majorPowers.filter((nation) =>
      nation.score >= 52
      || nation.embassy
      || nation.treaties.includes("cooperation")
      || nation.treaties.includes("defense"),
    );
    game.treasury -= cost;
    game.actions.diplomacy = true;
    const requiredSupport = Math.ceil(majorPowers.length * 0.6);
    if (supporters.length < requiredSupport) {
      game.approval = clamp(game.approval - 1);
      makeLog(game, `Die Friedenskonferenz scheitert: Nur ${supporters.length} von ${majorPowers.length} großen europäischen Staaten unterstützen den Vorschlag.`, "diplomacy");
      game.news = { title: "Keine Mehrheit für den Friedensplan", text: `${supporters.length} von ${majorPowers.length} großen europäischen Staaten unterstützen den Vorschlag. Stärke Beziehungen und eröffne Botschaften, bevor du es erneut versuchst.`, type: "crisis" };
      return { ok: true, passed: false, supporters: supporters.length };
    }
    game.peacePactUntil = Math.max(game.peacePactUntil ?? 0, game.round + 3);
    if (game.conflict) {
      const opponent = getRelation(game, game.conflict.opponentId);
      if (opponent) {
        opponent.tension = clamp(opponent.tension - 35);
        opponent.score = clamp(opponent.score + 7);
      }
      game.conflict = null;
    }
    game.legitimacy = clamp(game.legitimacy + 4);
    game.approval = clamp(game.approval + 2);
    makeLog(game, `Europäische Friedensvereinbarung: ${supporters.length} von ${majorPowers.length} großen Staaten stimmen für eine vier Runden geltende Konfliktsperre.`, "diplomacy");
    game.news = { title: "Europäische Friedensvereinbarung", text: `${supporters.length} von ${majorPowers.length} großen Partnern stimmen zu. Konflikte sind für vier Runden ausgesetzt; ein laufender Konflikt wurde beendet.`, type: "diplomacy" };
    return { ok: true, passed: true, supporters: supporters.length };
  }
  const relation = actionId === "talks" && game.conflict
    ? getRelation(game, game.conflict.opponentId)
    : getRelation(game, game.selectedNationId);
  if (!relation) return { ok: false, message: "Wähle zuerst ein anderes Land aus." };
  if (actionId === "embassy") {
    if (relation.embassy) return { ok: false, message: `In ${relation.name} besteht bereits eine Botschaft.` };
    if (game.treasury < 4) return { ok: false, message: "Für die Eröffnung einer Botschaft fehlen 4 Mrd. €." };
    game.actions.diplomacy = true;
    game.treasury -= 4;
    relation.embassy = true;
    relation.score = clamp(relation.score + 10);
    relation.trust = clamp(relation.trust + 8);
    makeLog(game, `Botschaft in ${relation.name} eröffnet.`, "diplomacy");
    game.news = { title: "Neue Botschaft", text: `Die Botschaft in ${relation.name} stärkt den dauerhaften Austausch. Unterhalt: 0,5 Mrd. € pro Runde.`, type: "diplomacy" };
    return { ok: true };
  }
  if (actionId === "sanctions") {
    if (game.treasury < 3) return { ok: false, message: "Für Sanktionen fehlen 3 Mrd. €." };
    game.actions.diplomacy = true;
    game.treasury -= 3;
    relation.score = clamp(relation.score - 11);
    relation.tension = clamp(relation.tension + 28);
    relation.trust = clamp(relation.trust - 12);
    makeLog(game, `Sanktionen gegen ${relation.name}: Die Spannungen steigen.`, "crisis");
    game.news = { title: "Sanktionen verhängt", text: `Die Beziehungen zu ${relation.name} verschlechtern sich. Vergeltungsmaßnahmen sind möglich.`, type: "crisis" };
    return { ok: true };
  }
  if (actionId === "aid") {
    if (game.treasury < 8) return { ok: false, message: "Für ein Hilfspaket fehlen 8 Mrd. €." };
    game.actions.diplomacy = true;
    game.treasury -= 8;
    relation.score = clamp(relation.score + 9);
    relation.trust = clamp(relation.trust + 8);
    relation.tension = clamp(relation.tension - 8);
    makeLog(game, `Humanitäre Hilfe für ${relation.name}: −8 Mrd. € Spielgeld.`, "diplomacy");
    game.news = { title: "Humanitäres Hilfspaket", text: `Die Hilfe für ${relation.name} stärkt die Beziehungen.`, type: "diplomacy" };
    return { ok: true };
  }
  if (actionId === "talks") {
    if (!game.conflict || game.conflict.opponentId !== relation.id) {
      return { ok: false, message: "Mit diesem Land besteht derzeit kein bewaffneter Konflikt." };
    }
    game.actions.diplomacy = true;
    game.conflict.ceasefireOffer = true;
    relation.tension = clamp(relation.tension - 19);
    makeLog(game, `${relation.name} erhält einen Vorschlag für eine Waffenruhe.`, "diplomacy");
    game.news = { title: "Friedensgespräche", text: "Im nächsten Rundenwechsel wird über die angebotene Waffenruhe entschieden.", type: "diplomacy" };
    return { ok: true };
  }
  return { ok: false, message: "Dieser diplomatische Schritt ist nicht verfügbar." };
}

function openConflict(game, nation, aggressor, reason) {
  if (game.conflict) return;
  game.conflict = {
    opponentId: nation.id,
    attackerId: aggressor === "player" ? game.country.id : nation.id,
    defenderId: aggressor === "player" ? nation.id : game.country.id,
    aggressor,
    reason,
    startedRound: game.round,
    exchanges: 0,
    ceasefireOffer: false,
  };
  const relation = getRelation(game, nation.id);
  relation.tension = 100;
  relation.score = clamp(relation.score - 15);
  game.legitimacy = clamp(game.legitimacy - (aggressor === "player" ? 12 : 2));
  game.approval = clamp(game.approval - (aggressor === "player" ? 10 : 4));
  game.escalationRisk = clamp((game.escalationRisk ?? 8) + 22);
  const sharedAlliance = (game.alliances ?? []).find((alliance) => nation.alliances?.includes(alliance));
  if (aggressor === "player" && sharedAlliance) {
    for (const ally of game.relations.filter((other) =>
      other.id !== nation.id && other.alliances?.includes(sharedAlliance))) {
      ally.score = clamp(ally.score - 14);
      ally.tension = clamp(ally.tension + 15);
    }
    makeLog(game, `${sharedAlliance}: Dein Angriff auf ein Mitglied beschädigt die Bündnissolidarität.`, "crisis");
  }
  game.news = {
    title: "Bewaffneter Konflikt",
    text: `${reason} Für ${nation.name} kannst du eine Waffenruhe beantragen oder die Lage politisch neu bewerten.`,
    type: "war",
  };
  makeLog(game, `Konflikt mit ${nation.name}: ${reason}`, "war");
}

export function useDefenseAction(game, actionId, random = Math.random) {
  if (game.actions.defense) return { ok: false, message: "Diese Runde hast du bereits über Sicherheit entschieden." };
  const relation = getRelation(game, game.selectedNationId);
  if (actionId === "readiness") {
    if (game.treasury < 9) return { ok: false, message: "Für die Bereitschaftsmaßnahme fehlen 9 Mrd. €." };
    game.actions.defense = true;
    game.treasury -= 9;
    game.defense = clamp(game.defense + 5);
    game.securityReadiness = Math.min(20, (game.securityReadiness ?? 0) + 10);
    makeLog(game, "Zivilschutz und Einsatzbereitschaft wurden erhöht.", "security");
    game.news = { title: "Vorsorge verstärkt", text: "Die Maßnahme verbessert Bevölkerungsschutz und Bereitschaft. Sie legt keine konkrete Kampfstrategie fest.", type: "security" };
    return { ok: true };
  }
  if (actionId === "intervention") {
    if (game.conflict) return { ok: false, message: "Während eines laufenden Konflikts kann keine weitere Militäraktion genehmigt werden." };
    if (game.round <= (game.peacePactUntil ?? 0)) return { ok: false, message: "Eine europäische Friedensvereinbarung untersagt derzeit neue Konflikte." };
    if (game.laws.includes("peace")) return { ok: false, message: "Das Friedensgesetz untersagt deiner Regierung, einen Konflikt zu beginnen." };
    if (!relation) return { ok: false, message: "Wähle zuerst ein Land." };
    if (game.treasury < 15) return { ok: false, message: "Für die Genehmigung fehlen 15 Mrd. €." };
    if (game.legitimacy < 45) return { ok: false, message: "Das Parlament verweigert ohne ausreichende Rechtsstaatlichkeit ein militärisches Mandat." };
    if (relation.alliances?.includes("NATO") && (game.alliances ?? []).includes("NATO")) {
      return { ok: false, message: "Ein Angriff auf ein eigenes Bündnismitglied wird durch das Verteidigungsbündnis verhindert." };
    }
    game.actions.defense = true;
    game.treasury -= 15;
    openConflict(game, relation, "player", "Das Parlament genehmigt eine umstrittene Militäraktion.");
    return { ok: true };
  }
  if (actionId === "ceasefire") {
    if (!game.conflict) return { ok: false, message: "Es gibt keinen Konflikt, den du beenden kannst." };
    const opponent = getRelation(game, game.conflict.opponentId);
    if (!opponent) return { ok: false, message: "Das gegnerische Land wurde nicht gefunden." };
    game.actions.defense = true;
    if (game.conflict.ceasefireOffer || random() < .72) {
      opponent.tension = clamp(opponent.tension - 35);
      opponent.score = clamp(opponent.score + 8);
      game.conflict = null;
      game.approval = clamp(game.approval + 3);
      game.legitimacy = clamp(game.legitimacy + 2);
      game.news = { title: "Waffenruhe vereinbart", text: `${opponent.name} stimmt der Waffenruhe zu. Der Konflikt ist vorerst beendet.`, type: "diplomacy" };
      makeLog(game, `Waffenruhe mit ${opponent.name} vereinbart.`, "diplomacy");
    } else {
      game.news = { title: "Verhandlungen dauern an", text: `${opponent.name} bittet um weitere Verhandlungen. Der Konflikt dauert an.`, type: "war" };
      makeLog(game, `${opponent.name} stimmt einer sofortigen Waffenruhe noch nicht zu.`, "war");
    }
    return { ok: true };
  }
  if (actionId === "retreat") {
    if (!game.conflict) return { ok: false, message: "Es gibt keinen laufenden Konflikt." };
    game.actions.defense = true;
    const opponent = getRelation(game, game.conflict.opponentId);
    if (opponent) {
      opponent.tension = clamp(opponent.tension - 26);
      opponent.score = clamp(opponent.score + 5);
    }
    game.conflict = null;
    game.defense = clamp(game.defense - 3);
    game.approval = clamp(game.approval - 2);
    game.news = { title: "Rückzug angeordnet", text: "Der Einsatz wird beendet. Die Spannungen sinken, die Bereitschaft aber auch.", type: "diplomacy" };
    makeLog(game, "Du beendest den Einsatz und ordnest den Rückzug an.", "security");
    return { ok: true };
  }
  if (actionId === "neutrality") {
    if (!game.conflict) return { ok: false, message: "Es gibt keinen Konflikt, aus dem du dich heraushalten kannst." };
    const opponent = getRelation(game, game.conflict.opponentId);
    if (opponent) {
      opponent.tension = clamp(opponent.tension - 14);
      opponent.score = clamp(opponent.score + 2);
    }
    game.conflict = null;
    game.defense = clamp(game.defense - 2);
    game.legitimacy = clamp(game.legitimacy + 2);
    game.actions.defense = true;
    game.news = { title: "Nichteinmischung erklärt", text: "Deine Regierung beendet ihre Beteiligung und setzt auf Neutralität. Die Lage zwischen anderen Staaten bleibt bestehen.", type: "diplomacy" };
    makeLog(game, "Du erklärst die Nichteinmischung und beendest die Beteiligung deines Landes.", "diplomacy");
    return { ok: true };
  }
  return { ok: false, message: "Diese Sicherheitsentscheidung ist nicht verfügbar." };
}

function advanceOtherCountries(game, random) {
  for (const relation of game.relations) {
    relation.economy = clamp(relation.economy + Math.round((random() - .48) * 3), 10, 95);
    if (relation.treaties.includes("trade")) relation.economy = clamp(relation.economy + 1);
    if (relation.tension > 35 && random() < .22) relation.tension = clamp(relation.tension - 2);
    if (relation.embassy) {
      relation.score = clamp(relation.score + 1);
      relation.trust = clamp(relation.trust + 1);
    }
    if (relation.tension >= 38 && random() < (relation.style === "Durchsetzungsstark" ? .3 : .14)) {
      relation.defense = clamp(relation.defense + 1);
      relation.tension = clamp(relation.tension + 2);
      game.escalationRisk = clamp((game.escalationRisk ?? 8) + 1);
      makeLog(game, `${relation.name} erhöht seine Bereitschaft. Die Spannungen in Europa nehmen zu.`, "crisis");
    }
  }
  if (!game.offer && !game.conflict && random() < .32) {
    const candidates = game.relations.filter((relation) => relation.score > 42 && relation.tension < 38);
    const partner = candidates[Math.floor(random() * candidates.length)];
    if (partner) {
      const type = partner.treaties.includes("trade") ? "cooperation" : "trade";
      game.offer = {
        nationId: partner.id,
        nationName: partner.name,
        type,
        cost: agreements.find((agreement) => agreement.id === type).cost,
      };
      game.news = { title: "Vertragsangebot eingegangen", text: `${partner.name} bietet ein ${agreements.find((agreement) => agreement.id === type).name} an. Du kannst im Diplomatie-Tab antworten.`, type: "diplomacy" };
      makeLog(game, `${partner.name} schlägt ein ${agreements.find((agreement) => agreement.id === type).name} vor.`, "diplomacy");
    }
  }
  if (game.conflict) return;
  const tense = game.relations
    .filter((relation) => {
      const threshold = relation.style === "Durchsetzungsstark" ? 55 : relation.style === "Pragmatisch" ? 64 : 72;
      return relation.tension >= threshold && !relation.treaties.includes("defense");
    })
    .sort((left, right) => right.tension - left.tension);
  const aggressor = tense[0];
  const escalationChance = aggressor?.style === "Durchsetzungsstark" ? .34 : .2;
  if (aggressor && game.round > (game.peacePactUntil ?? 0) && !game.laws.includes("peace") && random() < escalationChance) {
    openConflict(game, aggressor, "ai", "Eine diplomatische Krise eskaliert.");
  }
}

function resolveConflict(game, random) {
  const conflict = game.conflict;
  if (!conflict) return;
  const opponent = getRelation(game, conflict.opponentId);
  if (!opponent) {
    game.conflict = null;
    return;
  }
  if (conflict.ceasefireOffer && random() < .62) {
    opponent.tension = clamp(opponent.tension - 32);
    opponent.score = clamp(opponent.score + 7);
    game.conflict = null;
    game.news = { title: "Waffenruhe angenommen", text: `${opponent.name} nimmt die angebotene Waffenruhe an.`, type: "diplomacy" };
    makeLog(game, `Waffenruhe mit ${opponent.name} angenommen.`, "diplomacy");
    return;
  }

  const treatySupport = game.relations
    .filter((relation) => relation.treaties.includes("defense") && relation.tension < 60)
    .reduce((sum, relation) => sum + relation.defense * .12, 0);
  const playerNatoSupport = conflict.aggressor === "ai" && (game.alliances ?? []).includes("NATO")
    ? game.relations.filter((relation) => relation.alliances?.includes("NATO") && relation.tension < 75)
      .reduce((sum, relation) => sum + relation.defense * .1, 0)
    : 0;
  const opponentNatoSupport = conflict.aggressor === "player" && opponent.alliances?.includes("NATO")
    ? game.relations.filter((relation) =>
      relation.id !== opponent.id && relation.alliances?.includes("NATO") && relation.tension < 75)
      .reduce((sum, relation) => sum + relation.defense * .1, 0)
    : 0;
  const inventory = game.inventory ?? emptyInventory();
  const supply = Math.min(24,
    inventory.personnel / 2500
      + inventory.tanks * 0.3
      + inventory.ships * 0.6
      + inventory.aircraft * 0.5
      + inventory.missiles * 0.08,
  );
  const defenseScore = game.defense + supply + (game.securityReadiness ?? 0) + Math.min(24, treatySupport + playerNatoSupport) + game.treasury * .05;
  const opposition = opponent.defense + Math.min(28, opponentNatoSupport) + 10 + seededValue(opponent.id, `conflict:${game.round}`) * 12;
  const outcome = clamp(Math.round(50 + (defenseScore - opposition) * .8 + (random() - .5) * 18), 8, 92);
  const won = random() * 100 < outcome;
  conflict.exchanges += 1;
  game.treasury = Math.max(0, game.treasury - 4);
  game.economy = clamp(game.economy - 2);
  game.approval = clamp(game.approval + (won ? 1 : -4));
  game.defense = clamp(game.defense - 2);
  game.securityReadiness = Math.max(0, (game.securityReadiness ?? 0) - 4);
  opponent.tension = clamp(opponent.tension - (won ? 5 : 2));
  const result = won ? "Deine Verteidigung setzt sich in dieser Runde durch" : "Die Gegenseite gewinnt in dieser Runde an Boden";
  makeLog(game, `${result}. Der Konflikt mit ${opponent.name} verursacht wirtschaftliche und politische Kosten.`, "war");
  if (won) opponent.defense = clamp(opponent.defense - 3);
  game.news = { title: won ? "Konfliktlage stabilisiert" : "Konflikt verschärft sich", text: `${result}. Das Ergebnis wird abstrakt berechnet; es gibt keine taktischen Kampfdetails. Du kannst Verhandlungen aufnehmen oder die Lage neu bewerten.`, type: "war" };
  if (conflict.exchanges >= 3 || game.treasury <= 4) {
    opponent.tension = clamp(opponent.tension - 22);
    game.conflict = null;
    game.approval = clamp(game.approval + (won ? 2 : -2));
    game.news = { title: "Konflikt beendet", text: `Die Auseinandersetzung mit ${opponent.name} endet nach ${conflict.exchanges} Runden.`, type: "diplomacy" };
    makeLog(game, `Der Konflikt mit ${opponent.name} ist beendet.`, "diplomacy");
  }
}

function resolveCrisis(game, random) {
  if (game.round % 4 !== 0 || random() > .38) return;
  const crises = [
    { title: "Starkregen in Europa", text: "Ein schweres Unwetter beschädigt wichtige Infrastruktur.", effect: { treasury: -5, approval: -2 }, choice: "Katastrophenhilfe kostet 5 Mrd. €." },
    { title: "Energiepreisschock", text: "Steigende Energiepreise belasten Haushalte und Unternehmen.", effect: { economy: -2, prosperity: -2, approval: -3 }, choice: "Preisdruck bremst Wirtschaft und Wohlstand." },
    { title: "Forschungsdurchbruch", text: "Neue Technologien eröffnen Chancen für die heimische Wirtschaft.", effect: { economy: 3, legitimacy: 1 }, choice: "Der Innovationsschub stärkt die Wirtschaft." },
    { title: "Europäische Hilfsanfrage", text: "Ein Partnerland bittet um Unterstützung nach einer Naturkatastrophe.", effect: { prosperity: 1, legitimacy: 2, treasury: -3 }, choice: "Du leistest ein Hilfspaket von 3 Mrd. €." },
  ];
  const crisis = crises[Math.floor(random() * crises.length)];
  for (const [stat, effect] of Object.entries(crisis.effect)) {
    if (stat === "treasury") game.treasury = Math.max(0, game.treasury + effect);
    else game[stat] = clamp(game[stat] + effect);
  }
  game.news = { title: crisis.title, text: `${crisis.text} ${crisis.choice}`, type: "crisis" };
  makeLog(game, `${crisis.title}: ${crisis.choice}`, "crisis");
}

export function endTurn(game, random = Math.random) {
  if (game.ended) return { ok: false, message: "Diese Amtszeit ist bereits beendet." };
  const activeLaws = laws.filter((law) => game.laws.includes(law.id));
  const income = Math.max(4, Math.round(5 + game.economy * .12 + game.prosperity * .045 + activeLaws.reduce((sum, law) => sum + (law.income ?? 0), 0)));
  game.inventory ??= emptyInventory();
  const equipmentUpkeep = procurementItems.reduce((sum, item) => sum + game.inventory[item.id] * item.upkeep, 0);
  const embassyUpkeep = game.relations.filter((relation) => relation.embassy).length * 0.5;
  const upkeep = Math.round((game.defense * .035 + activeLaws.reduce((sum, law) => sum + law.upkeep, 0) + equipmentUpkeep + embassyUpkeep) * 100) / 100;
  const net = income - upkeep;
  game.treasury = Math.max(0, game.treasury + net);
  game.debt = Math.max(0, game.debt + (net < 0 ? Math.abs(net) : 0) - Math.min(game.debt, Math.max(0, net - 8)));
  game.securityReadiness = Math.max(0, (game.securityReadiness ?? 0) - 2);
  game.daysInOffice += 90;

  for (const law of activeLaws) {
    for (const [stat, effect] of Object.entries(law.effects)) {
      game[stat] = clamp(game[stat] + (effect > 0 ? 1 : Math.sign(effect)));
    }
  }
  if (net < 0) {
    game.approval = clamp(game.approval - 2);
    game.news = { title: "Haushaltsdefizit", text: `Die laufenden Ausgaben übersteigen die Einnahmen um ${Math.abs(net)} Mrd. € Spielgeld.`, type: "crisis" };
  } else if (net > 0) {
    game.economy = clamp(game.economy + 1);
  }

  resolveConflict(game, random);
  advanceOtherCountries(game, random);
  resolveCrisis(game, random);
  const highestTension = Math.max(0, ...game.relations.map((relation) => relation.tension));
  game.escalationRisk = clamp((game.escalationRisk ?? 8)
    + (game.conflict ? 6 : highestTension >= 55 ? 2 : -3));

  if (game.round % 5 === 0) {
    if (game.approval >= 40 && game.legitimacy >= 35) {
      game.electionsWon += 1;
      game.approval = clamp(game.approval + 3);
      makeLog(game, "Du gewinnst die turnusmäßige Wahl und erhältst ein neues demokratisches Mandat.", "government");
      game.news = { title: "Wahl gewonnen", text: "Die Wählerinnen und Wähler bestätigen deine Regierung. Das neue Mandat stärkt den demokratischen Rückhalt.", type: "normal" };
    } else {
      game.approval = clamp(game.approval - 7);
      game.legitimacy = clamp(game.legitimacy - 2);
      game.news = { title: "Schwierige Parlamentswahl", text: "Deine Zustimmung ist gering. Eine Koalitionskrise schwächt dein Mandat, aber du kannst weiterregieren.", type: "crisis" };
      makeLog(game, "Die Regierung verliert bei der Wahl an Rückhalt.", "crisis");
    }
  }

  game.round += 1;
  game.actions = { government: false, diplomacy: false, defense: false };
  makeLog(game, `Runde abgeschlossen. Einnahmen: +${income} · laufende Kosten: −${upkeep} Mrd. € Spielgeld.`);
  return { ok: true };
}

export function saveCampaign(game) {
  return JSON.stringify(game);
}

export function loadCampaign(serialized, knownCountries) {
  let saved;
  try {
    saved = JSON.parse(serialized);
  } catch {
    return null;
  }
  if (saved?.version !== 2 || !Number.isInteger(saved.round) || saved.round < 1 || typeof saved.country?.id !== "string") return null;
  const country = knownCountries.find((item) => item.id === saved.country.id);
  if (!country
    || !Array.isArray(saved.relations)
    || !Array.isArray(saved.laws)
    || !Array.isArray(saved.log)
    || !saved.relations.every((relation) => relation
      && typeof relation.id === "string"
      && typeof relation.name === "string"
      && Number.isFinite(relation.score)
      && Number.isFinite(relation.trust)
      && Number.isFinite(relation.tension)
      && Number.isFinite(relation.defense)
      && Array.isArray(relation.treaties))
    || !["treasury", "economy", "prosperity", "defense", "approval", "legitimacy", "debt"].every((key) => Number.isFinite(saved[key]))
    || !saved.actions || typeof saved.actions !== "object"
    || (saved.conflict !== null && saved.conflict !== undefined
      && (!saved.conflict || typeof saved.conflict.opponentId !== "string"
        || !saved.relations.some((relation) => relation.id === saved.conflict.opponentId)
        || !Number.isInteger(saved.conflict.exchanges) || saved.conflict.exchanges < 0))) return null;
  saved.country = country;
  saved.alliances = alliancesFor(country.id);
  saved.specialty = typeof saved.specialty === "string" ? saved.specialty : "Ausgewogen";
  saved.escalationRisk = Number.isFinite(saved.escalationRisk) ? clamp(saved.escalationRisk) : 8;
  saved.inventory = { ...emptyInventory(), ...(saved.inventory ?? {}) };
  if (!procurementItems.every((item) => Number.isInteger(saved.inventory[item.id]) && saved.inventory[item.id] >= 0)) return null;
  saved.peacePactUntil = Number.isInteger(saved.peacePactUntil) ? Math.max(0, saved.peacePactUntil) : 0;
  saved.relations = saved.relations.filter((relation) => relation.id !== country.id);
  if (new Set(saved.relations.map((relation) => relation.id)).size !== saved.relations.length) return null;
  saved.relations.forEach((relation) => {
    relation.embassy = Boolean(relation.embassy);
    relation.alliances = alliancesFor(relation.id);
    relation.style = ["Vorsichtig", "Pragmatisch", "Durchsetzungsstark"].includes(relation.style)
      ? relation.style
      : diplomacyStyle(relation.id);
    relation.specialty = typeof relation.specialty === "string" ? relation.specialty : "Ausgewogen";
  });
  if (!saved.conflict) saved.conflict = null;
  saved.laws = [...new Set(saved.laws.filter((id) => laws.some((law) => law.id === id)))];
  saved.actions = {
    government: Boolean(saved.actions?.government),
    diplomacy: Boolean(saved.actions?.diplomacy),
    defense: Boolean(saved.actions?.defense),
  };
  const offerRelation = saved.offer && saved.relations.find((relation) => relation.id === saved.offer.nationId);
  const offerAgreement = saved.offer && agreements.find((agreement) => agreement.id === saved.offer.type);
  saved.offer = offerRelation && offerAgreement && !offerRelation.treaties.includes(offerAgreement.id)
    ? { nationId: offerRelation.id, nationName: offerRelation.name, type: offerAgreement.id, cost: offerAgreement.cost }
    : null;
  if (saved.conflict && !saved.relations.some((relation) => relation.id === saved.conflict.opponentId)) saved.conflict = null;
  saved.selectedNationId = saved.relations.some((relation) => relation.id === saved.selectedNationId)
    ? saved.selectedNationId
    : saved.relations[0]?.id ?? "";
  saved.securityReadiness = Number.isFinite(saved.securityReadiness) ? saved.securityReadiness : 0;
  return saved;
}
