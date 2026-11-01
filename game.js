import { aircraftByCountry, airForceSources } from "./aircraft.js";
import {
  agreements,
  answerOffer,
  createCampaign,
  endTurn,
  enactLaw,
  getRelation,
  investments,
  laws,
  loadCampaign,
  makeInvestment,
  procureEquipment,
  procurementItems,
  proposeAgreement,
  relationStatus,
  saveCampaign,
  useDefenseAction,
  useDiplomacyAction,
} from "./simulation.js";

const microstates = [
  { id: "andorra", name: "Andorra", flag: "🇦🇩", coordinates: [1.52, 42.5] },
  { id: "liechtenstein", name: "Liechtenstein", flag: "🇱🇮", coordinates: [9.55, 47.16] },
  { id: "malta", name: "Malta", flag: "🇲🇹", coordinates: [14.37, 35.9] },
  { id: "monaco", name: "Monaco", flag: "🇲🇨", coordinates: [7.42, 43.74] },
  { id: "san-marino", name: "San Marino", flag: "🇸🇲", coordinates: [12.46, 43.94] },
  { id: "vatican", name: "Vatikanstadt", flag: "🇻🇦", coordinates: [12.45, 41.9] },
];

const extraFlags = {
  Albania: "🇦🇱", Armenia: "🇦🇲", Austria: "🇦🇹", Azerbaijan: "🇦🇿", Belarus: "🇧🇾",
  Belgium: "🇧🇪", "Bosnia and Herzegovina": "🇧🇦", Bulgaria: "🇧🇬", Croatia: "🇭🇷",
  Cyprus: "🇨🇾", "Czech Republic": "🇨🇿", Denmark: "🇩🇰", Estonia: "🇪🇪",
  Finland: "🇫🇮", France: "🇫🇷", Georgia: "🇬🇪", Germany: "🇩🇪",
  Greece: "🇬🇷", Hungary: "🇭🇺", Iceland: "🇮🇸", Ireland: "🇮🇪",
  Italy: "🇮🇹", Kosovo: "🇽🇰", Latvia: "🇱🇻", Lithuania: "🇱🇹",
  Luxembourg: "🇱🇺", Moldova: "🇲🇩", Montenegro: "🇲🇪", Netherlands: "🇳🇱",
  "North Macedonia": "🇲🇰", Norway: "🇳🇴", Poland: "🇵🇱", Portugal: "🇵🇹",
  Romania: "🇷🇴", Russia: "🇷🇺", Serbia: "🇷🇸", Slovakia: "🇸🇰",
  Slovenia: "🇸🇮", Spain: "🇪🇸", Sweden: "🇸🇪", Switzerland: "🇨🇭",
  Turkey: "🇹🇷", Ukraine: "🇺🇦", "United Kingdom": "🇬🇧",
};

const statDefinitions = [
  { id: "treasury", label: "STAATSKASSE", format: (value) => `${value} <span class="stat-unit">Mrd. €</span>`, meter: (value) => Math.min(100, value) },
  { id: "debt", label: "STAATSSCHULDEN", format: (value) => `${value} <span class="stat-unit">Mrd. €</span>`, meter: (value) => Math.min(100, value / 2) },
  { id: "economy", label: "WIRTSCHAFT", format: (value) => `${value}<span class="stat-unit"> / 100</span>`, meter: (value) => value },
  { id: "prosperity", label: "WOHLSTAND", format: (value) => `${value}<span class="stat-unit"> / 100</span>`, meter: (value) => value },
  { id: "defense", label: "VERTEIDIGUNG", format: (value) => `${value}<span class="stat-unit"> / 100</span>`, meter: (value) => value },
  { id: "approval", label: "ZUSTIMMUNG", format: (value) => `${value}<span class="stat-unit">%</span>`, meter: (value) => value },
  { id: "legitimacy", label: "RECHTSSTAAT", format: (value) => `${value}<span class="stat-unit"> / 100</span>`, meter: (value) => value },
];

const elements = {
  countryCount: document.querySelector("#country-count"),
  countryList: document.querySelector("#country-list"),
  countrySearch: document.querySelector("#country-search"),
  mapCountries: document.querySelector("#map-countries"),
  microstateMarkers: document.querySelector("#microstate-markers"),
  mapHint: document.querySelector("#map-hint"),
  selectionFlag: document.querySelector("#selection-flag"),
  selectionName: document.querySelector("#selection-name"),
  selectionDescription: document.querySelector("#selection-description"),
  startGame: document.querySelector("#start-game"),
  gameSection: document.querySelector("#game-section"),
  gameTitle: document.querySelector("#game-title"),
  campaignProfile: document.querySelector("#campaign-profile"),
  statsGrid: document.querySelector("#stats-grid"),
  policyGrid: document.querySelector("#policy-grid"),
  nextTurn: document.querySelector("#next-turn"),
  turnMessage: document.querySelector("#turn-message"),
  eventTitle: document.querySelector("#event-title"),
  eventDescription: document.querySelector("#event-description"),
  activityLog: document.querySelector("#activity-log"),
  dossier: document.querySelector("#country-dossier"),
  dossierLandmark: document.querySelector(".dossier-landmark"),
  dossierOverline: document.querySelector("#dossier-overline"),
  dossierTitle: document.querySelector("#dossier-title"),
  dossierCapital: document.querySelector("#dossier-capital"),
  dossierImage: document.querySelector("#dossier-landmark-image"),
  dossierImageFallback: document.querySelector("#dossier-landmark-fallback"),
  dossierFallbackCapital: document.querySelector("#dossier-fallback-capital"),
  dossierFallbackCity: document.querySelector("#dossier-fallback-city"),
  landmarkCredit: document.querySelector("#landmark-credit"),
  countryFacts: document.querySelector("#country-facts"),
  dataSource: document.querySelector("#country-data-source"),
  aircraftCard: document.querySelector("#aircraft-card"),
  aircraftImage: document.querySelector("#aircraft-image"),
  aircraftVisual: document.querySelector("#aircraft-visual"),
  aircraftStatus: document.querySelector("#aircraft-status"),
  aircraftTitle: document.querySelector("#aircraft-title"),
  aircraftModels: document.querySelector("#aircraft-models"),
  aircraftNote: document.querySelector("#aircraft-note"),
  aircraftDataSource: document.querySelector("#aircraft-data-source"),
  aircraftCredit: document.querySelector("#aircraft-credit"),
  actionDots: document.querySelector("#action-dots"),
  gameTabs: document.querySelector("#game-tabs"),
  saveIndicator: document.querySelector("#save-indicator"),
  lawGrid: document.querySelector("#law-grid"),
  nationSelect: document.querySelector("#nation-select"),
  diplomacyProfile: document.querySelector("#diplomacy-profile"),
  agreementGrid: document.querySelector("#agreement-grid"),
  diplomacyActions: document.querySelector("#diplomacy-actions"),
  incomingOffer: document.querySelector("#incoming-offer"),
  relationshipList: document.querySelector("#relationship-list"),
  relationshipTitle: document.querySelector("#relationship-title"),
  diplomacyLog: document.querySelector("#diplomacy-log"),
  conflictBriefing: document.querySelector("#conflict-briefing"),
  securityActions: document.querySelector("#security-actions"),
  procurementForm: document.querySelector("#procurement-form"),
  procurementCost: document.querySelector("#procurement-cost"),
  procurementMaintenance: document.querySelector("#procurement-maintenance"),
  procurementSubmit: document.querySelector("#procurement-submit"),
  inventorySummary: document.querySelector("#inventory-summary"),
  armedForcesSummary: document.querySelector("#armed-forces-summary"),
  armedForcesSource: document.querySelector("#armed-forces-source"),
  securityLog: document.querySelector("#security-log"),
  institutionGrid: document.querySelector("#institution-grid"),
  electionCard: document.querySelector("#election-card"),
  newsLog: document.querySelector("#news-log"),
  mandateTitle: document.querySelector("#mandate-title"),
  mandateDescription: document.querySelector("#mandate-description"),
  mandateMeter: document.querySelector("#mandate-meter"),
  offerBadge: document.querySelector("#offer-badge"),
  conflictBadge: document.querySelector("#conflict-badge"),
  eventIcon: document.querySelector("#event-icon"),
  resumeGame: document.querySelector("#resume-game"),
};

let countries = [];
let countryProfiles = {};
let selectedCountry = null;
let game = null;
let profileRequestId = 0;
const commonsCache = new Map();
const commonsEndpoint = "https://commons.wikimedia.org/w/api.php";

const countryNameEn = {
  "Vereinigtes Königreich": "United Kingdom",
  "Republik Moldau": "Moldova",
  "Republik Zypern": "Cyprus",
  "Tschechien": "Czech Republic",
  "Nordmazedonien": "North Macedonia",
  "Bosnien und Herzegowina": "Bosnia and Herzegovina",
  "Vatikanstadt": "Vatican City",
};

function countryId(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function flagFor(country) {
  return extraFlags[country.nameEn] || "🏳️";
}

function mercatorY(latitude) {
  const radians = (latitude * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

function project([longitude, latitude]) {
  const x = ((longitude + 27) / 78) * 920;
  const top = mercatorY(73);
  const bottom = mercatorY(34);
  const y = ((top - mercatorY(Math.max(-85, Math.min(85, latitude)))) / (top - bottom)) * 610;
  return [x, y];
}

function ringPath(ring) {
  let path = "";
  let drawing = false;
  let previousLongitude = null;
  for (const point of ring) {
    const [longitude] = point;
    if (previousLongitude !== null && Math.abs(longitude - previousLongitude) > 180) {
      path += " Z ";
      drawing = false;
    }
    const [x, y] = project(point);
    path += `${drawing ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `;
    drawing = true;
    previousLongitude = longitude;
  }
  return drawing ? `${path}Z` : path;
}

function geometryPath(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) => polygon.map(ringPath).join(" ")).join(" ");
}

function renderMap() {
  const paths = countries
    .filter((country) => country.geometry)
    .map((country) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "map-country");
      path.setAttribute("d", geometryPath(country.geometry));
      path.dataset.country = country.id;
      path.setAttribute("tabindex", "0");
      path.setAttribute("role", "button");
      path.setAttribute("aria-label", country.name);
      path.setAttribute("aria-pressed", "false");
      return path;
    });
  elements.mapCountries.replaceChildren(...paths);

  const markers = microstates.map((country) => {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const [x, y] = project(country.coordinates);
    marker.setAttribute("class", "microstate-marker");
    marker.setAttribute("cx", x.toFixed(1));
    marker.setAttribute("cy", y.toFixed(1));
    marker.setAttribute("r", "5.5");
    marker.dataset.country = country.id;
    marker.setAttribute("tabindex", "0");
    marker.setAttribute("role", "button");
    marker.setAttribute("aria-label", country.name);
    marker.setAttribute("aria-pressed", "false");
    return marker;
  });
  elements.microstateMarkers.replaceChildren(...markers);
}

function visibleCountries(query = "") {
  const normalizedQuery = query.trim().toLocaleLowerCase("de");
  return countries.filter((country) => country.name.toLocaleLowerCase("de").includes(normalizedQuery));
}

function renderCountryList() {
  const results = visibleCountries(elements.countrySearch.value);
  elements.countryCount.textContent = `${countries.length} LÄNDER`;
  elements.countryList.replaceChildren(...results.map((country) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "country-option";
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selectedCountry?.id === country.id));
    button.dataset.country = country.id;
    const flag = document.createElement("span");
    flag.className = "flag";
    flag.setAttribute("aria-hidden", "true");
    flag.textContent = country.flag;
    const name = document.createElement("span");
    name.className = "country-name";
    name.textContent = country.name;
    button.append(flag, name);
    return button;
  }));
}

function updateSelection(country) {
  selectedCountry = country;
  const requestId = ++profileRequestId;
  renderCountryList();
  document.querySelectorAll("[data-country].map-country, [data-country].microstate-marker").forEach((item) => {
    const active = item.dataset.country === country.id;
    item.classList.toggle("is-selected", active);
    item.setAttribute("aria-pressed", String(active));
  });
  elements.mapHint.textContent = country.name;
  elements.selectionFlag.textContent = country.flag;
  elements.selectionName.textContent = country.name;
  elements.selectionDescription.textContent = `Du möchtest die Regierung von ${country.name} übernehmen.`;
  elements.startGame.disabled = false;
  const saved = getSavedCampaign();
  elements.resumeGame.hidden = !saved || saved.country?.id !== country.id;
  elements.startGame.textContent = saved?.country?.id === country.id ? "Neue Partie beginnen →" : "Neue Partie beginnen →";
  renderCountryProfile(country, requestId);
}

function getSavedCampaign() {
  try {
    const serialized = localStorage.getItem("europa-entscheidet-campaign-v2");
    if (!serialized) return null;
    const saved = JSON.parse(serialized);
    return saved?.version === 2 && typeof saved.country?.id === "string" ? saved : null;
  } catch (error) {
    console.error("Gespeicherte Partie konnte nicht gelesen werden.", error);
    return null;
  }
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("de-DE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatGdp(value) {
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(value / 1e9)} Mrd. US$`;
}

function makeFact(label, value, year) {
  const item = document.createElement("div");
  item.className = "country-fact";
  const name = document.createElement("span");
  name.className = "country-fact-label";
  name.textContent = label;
  const result = document.createElement("strong");
  result.className = "country-fact-value";
  result.textContent = value;
  const date = document.createElement("span");
  date.className = "country-fact-year";
  date.textContent = year ? `WORLD BANK · ${year}` : "WORLD BANK";
  item.append(name, result, date);
  return item;
}

function cleanMetadata(value) {
  if (!value) return "";
  const parsed = new DOMParser().parseFromString(value, "text/html");
  return parsed.body.textContent.replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function imageLicense(imageInfo) {
  const metadata = imageInfo.extmetadata ?? {};
  const license = cleanMetadata(metadata.LicenseShortName?.value);
  if (!license || !/(CC0|CC BY|Public domain|PD-)/i.test(license)) return null;
  const description = [
    metadata.ObjectName?.value,
    metadata.ImageDescription?.value,
    metadata.Artist?.value,
  ].map(cleanMetadata).join(" ");
  if (/(AI[- ]generated|artificial intelligence|computer[- ]generated)/i.test(description)) return null;
  const artist = cleanMetadata(metadata.Artist?.value) || cleanMetadata(metadata.Credit?.value);
  return { license, artist };
}

async function findCommonsImage(query, requiredTerm) {
  const cacheKey = `${query}::${requiredTerm}`;
  if (commonsCache.has(cacheKey)) return commonsCache.get(cacheKey);
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${query} filetype:bitmap -AI-generated -illustration -logo -map`,
    gsrnamespace: "6",
    gsrlimit: "12",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1280",
    format: "json",
    origin: "*",
  });
  let response;
  try {
    response = await fetch(`${commonsEndpoint}?${params}`);
  } catch (error) {
    throw new Error("Wikimedia Commons ist gerade nicht erreichbar.", { cause: error });
  }
  if (!response.ok) throw new Error(`Wikimedia Commons antwortet mit HTTP ${response.status}.`);
  const result = await response.json();
  const pages = Object.values(result.query?.pages ?? {});
  const candidates = pages
    .map((page) => {
      const imageInfo = page.imageinfo?.[0];
      const license = imageInfo ? imageLicense(imageInfo) : null;
      if (!imageInfo?.thumburl || !license || imageInfo.width < 600) return null;
      if (/(AI[- ]generated|artificial intelligence|3d render|video game|fan art)/i.test(page.title)) return null;
      const title = page.title.replace(/^File:/i, "");
      const queryTerms = query.toLocaleLowerCase().split(/\s+/);
      const searchableTitle = normalizeSearchText(title);
      if (!searchableTitle.includes(normalizeSearchText(requiredTerm))) return null;
      const keywordScore = queryTerms.reduce((score, term) => score + (searchableTitle.includes(term) ? 5 : 0), 0);
      const photoScore = /(photo|photograph|panorama|skyline|city|airport|aircraft|flight|flying|airshow)/i.test(title) ? 4 : 0;
      const illustrationPenalty = /(diagram|drawing|painting|model|poster|simulation)/i.test(title) ? -20 : 0;
      return {
        ...license,
        title,
        url: imageInfo.thumburl,
        pageUrl: imageInfo.descriptionurl,
        score: keywordScore + photoScore + Math.min(8, (Number(imageInfo.width) || 0) / 400) + illustrationPenalty,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score);
  const photo = candidates[0] ?? null;
  commonsCache.set(cacheKey, photo);
  return photo;
}

function setAttribution(link, image, defaultText) {
  link.textContent = defaultText;
  link.href = image?.pageUrl || "https://commons.wikimedia.org/";
  if (image) {
    const credit = image.artist ? `${image.artist} · ` : "";
    link.textContent = `${credit}${image.license} · Wikimedia Commons`;
  }
}

function setProfileImage(imageElement, image, creditElement, fallbackText, requestId) {
  if (image) {
    imageElement.src = image.url;
    imageElement.alt = image.title.replace(/\.[^.]+$/, "");
    imageElement.hidden = false;
    if (imageElement === elements.dossierImage) elements.dossierLandmark.classList.add("has-photo");
    setAttribution(creditElement, image, fallbackText);
    imageElement.onerror = () => {
      if (requestId !== profileRequestId) return;
      imageElement.hidden = true;
      imageElement.removeAttribute("src");
      if (imageElement === elements.dossierImage) {
        elements.dossierLandmark.classList.remove("has-photo");
        setAttribution(creditElement, null, "Foto nicht geladen · eigene Vektoransicht");
      } else {
        elements.aircraftVisual.classList.remove("has-photo");
        creditElement.hidden = false;
        creditElement.textContent = "Foto nicht geladen · Modell und Quelle bleiben sichtbar.";
        creditElement.href = "https://commons.wikimedia.org/";
      }
    };
    return;
  }
  imageElement.removeAttribute("src");
  imageElement.alt = "";
  imageElement.hidden = true;
  if (imageElement === elements.dossierImage) elements.dossierLandmark.classList.remove("has-photo");
  setAttribution(creditElement, null, fallbackText);
}

async function renderCountryProfile(country, requestId) {
  const profile = countryProfiles[country.name];
  const countryEnglishName = country.nameEn || countryNameEn[country.name] || country.name;
  const aircraft = aircraftByCountry[country.id] ?? {
    aircraft: [],
    note: "Für dieses Land ist kein eigenes Jagdflugzeug in der Datengrundlage aufgeführt.",
  };
  const capital = profile?.capital || "Keine Angabe";
  elements.dossier.hidden = false;
  elements.dossierOverline.textContent = country.name.toLocaleUpperCase("de");
  elements.dossierTitle.textContent = country.name;
  elements.dossierCapital.textContent = `Hauptstadt · ${capital}`;
  elements.dossierFallbackCapital.textContent = capital.toLocaleUpperCase("de");
  elements.dossierFallbackCity.textContent = `Ein Blick auf ${capital}`;
  elements.landmarkCredit.textContent = "Lizenzierte Fotos werden gesucht …";
  setProfileImage(elements.dossierImage, null, elements.landmarkCredit, "Bildquelle wird geprüft …");
  elements.aircraftImage.hidden = true;
  elements.aircraftImage.removeAttribute("src");
  elements.aircraftVisual.querySelector(".aircraft-image-label").textContent = "EIGENE ILLUSTRATION · SCHEMATISCH";
  elements.aircraftCredit.hidden = true;
  elements.aircraftCredit.textContent = "";
  elements.aircraftVisual.classList.toggle("has-photo", false);

  const facts = [];
  facts.push(makeFact("HAUPTSTADT", capital, null));
  if (profile?.population) {
    facts.push(makeFact("BEVÖLKERUNG", formatCompactNumber(profile.population.value), profile.population.year));
  } else {
    facts.push(makeFact("BEVÖLKERUNG", "Keine Angabe", null));
  }
  if (profile?.gdp) {
    facts.push(makeFact("BIP · NOMINAL", formatGdp(profile.gdp.value), profile.gdp.year));
  } else {
    facts.push(makeFact("BIP · NOMINAL", "Keine Angabe", null));
  }
  elements.countryFacts.replaceChildren(...facts);
  elements.dataSource.href = "https://data.worldbank.org/";
  elements.dataSource.textContent = "QUELLE: WORLD BANK";
  elements.aircraftStatus.textContent = "ÖFFENTLICH DOKUMENTIERTE MUSTER";
  elements.aircraftTitle.textContent = aircraft.aircraft.length ? "Kampfflugzeuge im Bestand" : "Keine eigene Kampfflugzeugflotte";
  elements.aircraftModels.textContent = aircraft.aircraft.length
    ? aircraft.aircraft.join(" · ")
    : aircraft.note;
  elements.aircraftNote.textContent = aircraft.onOrder?.length
    ? `Bestellt / im Zulauf: ${aircraft.onOrder.join(" · ")}. ${aircraft.note}`
    : aircraft.note;
  elements.aircraftDataSource.textContent = `Musterübersicht: ${airForceSources.label}`;
  elements.aircraftDataSource.href = airForceSources.url;
  if (!aircraft.aircraft.length) {
    elements.aircraftCard.classList.add("no-aircraft");
    elements.aircraftStatus.textContent = "LUFTSTREITKRÄFTE";
  } else {
    elements.aircraftCard.classList.remove("no-aircraft");
  }

  const imagePromises = [
    findCommonsImage(`${capital} ${countryEnglishName} city panorama`, capital),
    aircraft.aircraft.length
      ? findCommonsImage(
        `${aircraft.aircraft[0]} ${countryEnglishName} aircraft in flight`,
        aircraft.aircraft[0].match(/F\/A[- ]?\d+|F[- ]?\d+|JAS\s?\d+|Su[- ]?\d+|MiG[- ]?\d+|Eurofighter|Panavia|Rafale|Gripen|Mirage|FA[- ]?\d+/i)?.[0] || aircraft.aircraft[0],
      )
      : Promise.resolve(null),
  ];
  const results = await Promise.allSettled(imagePromises);
  if (requestId !== profileRequestId) return;

  const cityResult = results[0];
  if (cityResult.status === "fulfilled" && cityResult.value) {
    setProfileImage(elements.dossierImage, cityResult.value, elements.landmarkCredit, "Bildnachweis auf Wikimedia Commons", requestId);
  } else {
    const message = cityResult.status === "rejected" ? "Foto gerade nicht verfügbar · eigene Vektoransicht" : "Kein passendes Foto gefunden · eigene Vektoransicht";
    setProfileImage(elements.dossierImage, null, elements.landmarkCredit, message, requestId);
  }

  const aircraftResult = results[1];
  if (aircraft.aircraft.length && aircraftResult.status === "fulfilled" && aircraftResult.value) {
    const photo = aircraftResult.value;
    elements.aircraftImage.src = photo.url;
    elements.aircraftImage.alt = `Wikimedia-Commons-Foto: ${photo.title}`;
    elements.aircraftVisual.querySelector(".aircraft-image-label").textContent = "QUELLENFOTO · LIZENZ UNTER DEM BILD";
    elements.aircraftImage.hidden = false;
    elements.aircraftVisual.classList.add("has-photo");
    elements.aircraftCredit.hidden = false;
    setAttribution(elements.aircraftCredit, photo, "Bildnachweis auf Wikimedia Commons");
    elements.aircraftImage.onerror = () => {
      if (requestId !== profileRequestId) return;
      elements.aircraftImage.hidden = true;
      elements.aircraftImage.removeAttribute("src");
      elements.aircraftVisual.classList.remove("has-photo");
      elements.aircraftCredit.hidden = false;
      elements.aircraftCredit.textContent = "Foto nicht geladen · Modell und Quelle bleiben sichtbar.";
      elements.aircraftCredit.href = "https://commons.wikimedia.org/";
    };
  } else if (aircraft.aircraft.length && aircraftResult.status === "rejected") {
    elements.aircraftCredit.hidden = false;
    elements.aircraftCredit.textContent = "Bild gerade nicht erreichbar · Modellbezeichnung und Quelle bleiben sichtbar.";
    elements.aircraftCredit.href = "https://commons.wikimedia.org/";
  }
}

function renderStats() {
  elements.statsGrid.replaceChildren(...statDefinitions.map((definition) => {
    const card = document.createElement("div");
    card.className = `stat-card${definition.id === "treasury" ? " money" : ""}`;
    const label = document.createElement("span");
    label.className = "stat-label";
    label.textContent = definition.label;
    const value = document.createElement("span");
    value.className = "stat-value";
    value.innerHTML = definition.format(game[definition.id] ?? 0);
    const meter = document.createElement("div");
    meter.className = "stat-meter";
    const bar = document.createElement("span");
    bar.style.width = `${definition.meter(game[definition.id])}%`;
    meter.append(bar);
    card.append(label, value, meter);
    return card;
  }));
}

function renderPolicies() {
  elements.policyGrid.replaceChildren(...investments.map((policy) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "policy-card";
    button.dataset.investment = policy.id;
    button.disabled = game.actions.government || game.treasury < policy.cost;

    const top = document.createElement("span");
    top.className = "policy-topline";
    const icon = document.createElement("span");
    icon.className = "policy-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = policy.icon;
    const cost = document.createElement("span");
    cost.className = "policy-cost";
    cost.textContent = `− ${policy.cost} Mrd. €`;
    top.append(icon, cost);

    const title = document.createElement("h3");
    title.textContent = policy.title;
    const description = document.createElement("p");
    description.textContent = policy.description;
    button.append(top, title, description);
    return button;
  }));
  elements.lawGrid.replaceChildren(...laws.map((law) => {
    const active = game.laws.includes(law.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `law-card${active ? " is-active" : ""}`;
    button.dataset.law = law.id;
    button.disabled = game.actions.government || (!active && game.treasury < law.cost);
    const state = document.createElement("span");
    state.className = "law-state";
    state.textContent = active ? "IN KRAFT · KLICKEN ZUM AUFHEBEN" : "GESETZESENTWURF";
    const title = document.createElement("strong");
    title.textContent = law.name;
    const description = document.createElement("span");
    description.className = "law-description";
    description.textContent = law.description;
    const cost = document.createElement("span");
    cost.className = "law-cost";
    cost.textContent = active ? `Laufend: −${law.upkeep} Mrd. €/Runde` : `Beschluss: −${law.cost} Mrd. €`;
    button.append(state, title, description, cost);
    return button;
  }));
}

function renderLog(target, entries) {
  target.replaceChildren(...(entries.length
    ? entries.map((entry) => {
      const item = document.createElement("div");
      item.className = `activity-item log-${entry.type ?? "normal"}`;
      const text = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = `Zug ${entry.round}: `;
      text.append(strong, document.createTextNode(entry.text));
      item.append(text);
      return item;
    })
    : [Object.assign(document.createElement("p"), { className: "empty-log", textContent: "Noch keine Meldungen." })]));
}

function makeActionButton(text, attributes = {}, disabled = false, className = "action-button") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.disabled = disabled;
  for (const [attribute, value] of Object.entries(attributes)) button.dataset[attribute] = value;
  return button;
}

function renderActionDots() {
  const actions = [
    ["government", "Regierung"],
    ["diplomacy", "Diplomatie"],
    ["defense", "Sicherheit"],
  ];
  elements.actionDots.replaceChildren(...actions.map(([key, label]) => {
    const chip = document.createElement("span");
    chip.className = `action-chip${game.actions[key] ? " is-used" : ""}`;
    const dot = document.createElement("i");
    dot.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.textContent = game.actions[key] ? `${label} erledigt` : `${label} offen`;
    chip.append(dot, text);
    return chip;
  }));
}

function renderDiplomacy() {
  const relations = [...game.relations].sort((a, b) => b.score - a.score);
  if (!getRelation(game, game.selectedNationId) && relations.length) game.selectedNationId = relations[0].id;
  elements.nationSelect.replaceChildren(...relations.map((relation) => {
    const option = document.createElement("option");
    option.value = relation.id;
    option.textContent = `${relation.flag} ${relation.name} · ${relationStatus(relation)}`;
    option.selected = relation.id === game.selectedNationId;
    return option;
  }));
  const relation = getRelation(game, game.selectedNationId);
  if (relation) {
    const profile = document.createElement("div");
    profile.className = "diplomacy-country";
    const flag = document.createElement("span");
    flag.className = "diplomacy-flag";
    flag.textContent = relation.flag;
    const description = document.createElement("div");
    description.className = "diplomacy-country-copy";
    const name = document.createElement("strong");
    name.textContent = relation.name;
    const status = document.createElement("span");
    status.textContent = `${relationStatus(relation)} · Zustimmung ${relation.score}% · Spannung ${relation.tension}%`;
    const profileDetails = document.createElement("span");
    profileDetails.className = "diplomacy-country-details";
    profileDetails.textContent = `${relation.specialty} · ${relation.style} · ${relation.alliances.length ? relation.alliances.join(" / ") : "Kein Bündnis"}${relation.embassy ? " · Botschaft eröffnet" : ""}`;
    description.append(name, status, profileDetails);
    const meter = document.createElement("div");
    meter.className = "relationship-meter";
    const score = document.createElement("span");
    score.style.width = `${relation.score}%`;
    meter.append(score);
    profile.append(flag, description, meter);
    elements.diplomacyProfile.replaceChildren(profile);

    elements.agreementGrid.replaceChildren(...agreements.map((agreement) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `agreement-card${relation.treaties.includes(agreement.id) ? " is-signed" : ""}`;
      card.dataset.agreement = agreement.id;
      card.disabled = game.actions.diplomacy || game.treasury < agreement.cost || relation.treaties.includes(agreement.id);
      const title = document.createElement("strong");
      title.textContent = relation.treaties.includes(agreement.id) ? `${agreement.name} · geschlossen` : agreement.name;
      const detail = document.createElement("span");
      detail.textContent = relation.treaties.includes(agreement.id) ? "Das Abkommen ist in Kraft." : `${agreement.description} Kosten: ${agreement.cost} Mrd. €.`;
      card.append(title, detail);
      return card;
    }));

    const diplomacyActions = [
      makeActionButton("Humanitäres Hilfspaket · 8 Mrd. €", { diplomacy: "aid" }, game.actions.diplomacy || game.treasury < 8),
      makeActionButton("Sanktionen verhängen · 3 Mrd. €", { diplomacy: "sanctions" }, game.actions.diplomacy || game.treasury < 3, "action-button action-button-warning"),
      makeActionButton(relation.embassy ? "Botschaft bereits eröffnet" : "Botschaft eröffnen · 4 Mrd. €", { diplomacy: "embassy" }, game.actions.diplomacy || relation.embassy || game.treasury < 4),
      makeActionButton("Europäische Friedenskonferenz · 8 Mrd. €", { diplomacy: "peaceConference" }, game.actions.diplomacy || game.treasury < 8, "action-button action-button-muted"),
    ];
    elements.diplomacyActions.replaceChildren(...diplomacyActions);
  } else {
    elements.diplomacyProfile.replaceChildren();
    elements.agreementGrid.replaceChildren();
    elements.diplomacyActions.replaceChildren();
  }

  elements.incomingOffer.hidden = !game.offer;
  elements.incomingOffer.replaceChildren();
  if (game.offer) {
    const title = document.createElement("strong");
    title.textContent = `Vertragsangebot von ${game.offer.nationName}`;
    const description = document.createElement("p");
    description.textContent = `${agreements.find((agreement) => agreement.id === game.offer.type)?.name ?? "Abkommen"} · Kosten: ${game.offer.cost} Mrd. € Spielgeld.`;
    const accept = makeActionButton("Vertrag annehmen", { offer: "accept" }, game.actions.diplomacy || game.treasury < game.offer.cost);
    const reject = makeActionButton("Ablehnen", { offer: "reject" }, game.actions.diplomacy, "action-button action-button-muted");
    const actions = document.createElement("div");
    actions.className = "offer-actions";
    actions.append(accept, reject);
    elements.incomingOffer.append(title, description, actions);
  }
  elements.offerBadge.hidden = !game.offer;

  elements.relationshipList.replaceChildren(...relations.slice(0, 10).map((item) => {
    const row = document.createElement("div");
    row.className = "relationship-row";
    const label = document.createElement("span");
    label.textContent = `${item.flag} ${item.name}`;
    const score = document.createElement("strong");
    score.textContent = `${item.score}%`;
    row.append(label, score);
    return row;
  }));
  elements.relationshipTitle.textContent = relation?.name ?? "Europäische Partner";
  renderLog(elements.diplomacyLog, game.log.filter((entry) => ["diplomacy", "crisis", "war"].includes(entry.type)).slice(0, 9));
}

function renderSecurity() {
  const conflict = game.conflict;
  elements.conflictBadge.hidden = !conflict;
  elements.securityActions.replaceChildren();
  const briefing = document.createElement("div");
  briefing.className = `conflict-status${conflict ? " is-active" : ""}`;
  const title = document.createElement("strong");
  const detail = document.createElement("p");
  if (conflict) {
    const opponent = getRelation(game, conflict.opponentId);
    title.textContent = `Aktiver Konflikt · ${opponent?.name ?? "Unbekanntes Land"}`;
    detail.textContent = `Auslöser: ${conflict.reason} Dauer: ${conflict.exchanges} Konfliktrunden. Folgen für Haushalt und Zustimmung werden abstrakt berechnet.`;
  } else {
    title.textContent = "Kein bewaffneter Konflikt";
    detail.textContent = game.round <= (game.peacePactUntil ?? 0)
      ? `Europäische Konfliktsperre: noch ${game.peacePactUntil - game.round + 1} Runde${game.peacePactUntil - game.round === 0 ? "" : "n"}.`
      : game.laws.includes("peace")
        ? "Das Friedensgesetz untersagt, selbst einen Konflikt zu beginnen. Zivilschutz und Sicherheit bleiben möglich."
        : "Bereitschaft stärken, Verträge schließen oder ein parlamentarisches Mandat beantragen.";
  }
  briefing.append(title, detail);
  const risk = document.createElement("div");
  risk.className = "escalation-meter";
  const riskLabel = document.createElement("span");
  riskLabel.textContent = `Eskalationsrisiko · ${game.escalationRisk}/100`;
  const riskTrack = document.createElement("div");
  riskTrack.className = "escalation-track";
  const riskValue = document.createElement("span");
  riskValue.style.width = `${game.escalationRisk}%`;
  riskTrack.append(riskValue);
  risk.append(riskLabel, riskTrack);
  briefing.append(risk);
  elements.conflictBriefing.replaceChildren(briefing);

  elements.securityActions.append(
    makeActionButton("Zivilschutz & Bereitschaft stärken · 9 Mrd. €", { military: "readiness" }, game.actions.defense || game.treasury < 9),
  );
  if (conflict) {
    elements.securityActions.append(
      makeActionButton("Waffenruhe beantragen", { military: "ceasefire" }, game.actions.defense),
      makeActionButton("Einsatz beenden & zurückziehen", { military: "retreat" }, game.actions.defense, "action-button action-button-muted"),
      makeActionButton("Neutral bleiben · Nichteinmischung", { military: "neutrality" }, game.actions.defense, "action-button action-button-muted"),
    );
    if (!game.actions.diplomacy) {
      elements.securityActions.append(makeActionButton("Friedensgespräche aufnehmen", { diplomacy: "talks" }, false, "action-button"));
    }
  } else {
    const peaceLaw = game.laws.includes("peace");
    const peacePact = game.round <= (game.peacePactUntil ?? 0);
    const interventionLabel = peaceLaw
      ? "Durch Friedensgesetz untersagt"
      : peacePact
        ? "Europäische Konfliktsperre aktiv"
        : "Parlamentarisches Militärmandat beantragen · 15 Mrd. €";
    elements.securityActions.append(
      makeActionButton(interventionLabel, { military: "intervention" }, game.actions.defense || game.treasury < 15 || game.legitimacy < 45 || peaceLaw || peacePact, "action-button action-button-warning"),
    );
  }
  const inventory = game.inventory;
  elements.inventorySummary.replaceChildren(...procurementItems.map((item) => {
    const card = document.createElement("div");
    card.className = "inventory-card";
    const label = document.createElement("span");
    label.textContent = item.label;
    const quantity = document.createElement("strong");
    quantity.textContent = inventory[item.id].toLocaleString("de-DE");
    const unit = document.createElement("small");
    unit.textContent = item.unit;
    card.append(label, quantity, unit);
    return card;
  }));
  const formData = new FormData(elements.procurementForm);
  const requested = Object.fromEntries(procurementItems.map((item) => [item.id, Number(formData.get(item.id)) || 0]));
  const procurementTotal = procurementItems.reduce((sum, item) => sum + requested[item.id] * item.cost, 0);
  const currentMaintenance = procurementItems.reduce((sum, item) => sum + inventory[item.id] * item.upkeep, 0);
  const addedMaintenance = procurementItems.reduce((sum, item) => sum + requested[item.id] * item.upkeep, 0);
  elements.procurementCost.textContent = `${procurementTotal.toLocaleString("de-DE", { maximumFractionDigits: 2 })} Mrd. €`;
  elements.procurementMaintenance.textContent = `Unterhalt je Runde: ${currentMaintenance.toLocaleString("de-DE", { maximumFractionDigits: 3 })} Mrd. € aktuell${addedMaintenance ? ` · ${addedMaintenance.toLocaleString("de-DE", { maximumFractionDigits: 3 })} Mrd. € zusätzlich · danach ${(currentMaintenance + addedMaintenance).toLocaleString("de-DE", { maximumFractionDigits: 3 })} Mrd. €` : ""}.`;
  elements.procurementSubmit.disabled = game.actions.defense || Boolean(game.conflict) || procurementTotal <= 0 || procurementTotal > game.treasury;
  elements.procurementSubmit.textContent = game.conflict ? "Während eines Konflikts gesperrt" : game.actions.defense ? "Sicherheit bereits genutzt" : procurementTotal > game.treasury ? "Zu teuer" : "Beschaffung prüfen";
  const profileAircraft = aircraftByCountry[game.country.id];
  elements.armedForcesSummary.textContent = profileAircraft?.aircraft.length
    ? `${profileAircraft.aircraft.join(" · ")}${profileAircraft.onOrder?.length ? ` · Bestellt: ${profileAircraft.onOrder.join(", ")}` : ""}. ${profileAircraft.note} Spielstärke ${game.defense}/100 ist ein abstrahierter Wert und keine tatsächliche Truppen- oder Einsatzstärke.`
    : `${profileAircraft?.note ?? "Kein eigener Kampfflugzeugbestand erfasst."} Sicherheitswert ${game.defense}/100 beschreibt eine vereinfachte Spielmechanik, keine reale militärische Stärke.`;
  elements.armedForcesSource.href = airForceSources.url;
  elements.armedForcesSource.textContent = `Musterübersicht: ${airForceSources.label}`;
  renderLog(elements.securityLog, game.log.filter((entry) => ["war", "security", "crisis", "diplomacy"].includes(entry.type)).slice(0, 9));
}

function renderParliament() {
  const institutions = [
    ["RECHTSSTAATLICHKEIT", game.legitimacy, "Parlamentarische Kontrolle, Rechtsstaat und internationale Glaubwürdigkeit."],
    ["GESELLSCHAFTLICHE ZUSTIMMUNG", game.approval, "Öffentlicher Rückhalt für die Regierung."],
    ["STAATLICHE STABILITÄT", Math.round((game.legitimacy + game.approval) / 2), "Vereinfachter Wert für handlungsfähige demokratische Institutionen."],
  ];
  elements.institutionGrid.replaceChildren(...institutions.map(([label, value, description]) => {
    const card = document.createElement("div");
    card.className = "institution-card";
    const eyebrow = document.createElement("span");
    eyebrow.className = "step-label";
    eyebrow.textContent = label;
    const score = document.createElement("strong");
    score.textContent = `${value}/100`;
    const text = document.createElement("p");
    text.textContent = description;
    const meter = document.createElement("div");
    meter.className = "stat-meter";
    const bar = document.createElement("span");
    bar.style.width = `${value}%`;
    meter.append(bar);
    card.append(eyebrow, score, text, meter);
    return card;
  }));
  elements.electionCard.replaceChildren();
  const electionTitle = document.createElement("strong");
  const electionDescription = document.createElement("p");
  const roundsUntilElection = 5 - ((game.round - 1) % 5);
  electionTitle.textContent = `Nächste Parlamentswahl · in ${roundsUntilElection} Runde${roundsUntilElection === 1 ? "" : "n"}`;
  electionDescription.textContent = game.approval >= 40 && game.legitimacy >= 35
    ? "Mit genügend Zustimmung und Rechtsstaatlichkeit erhält die Regierung bei der nächsten Wahl ein neues Mandat."
    : "Dein Rückhalt ist niedrig. Stärke Zustimmung und Rechtsstaatlichkeit, um dein Mandat zu sichern.";
  elements.electionCard.append(electionTitle, electionDescription);
  elements.mandateTitle.textContent = game.approval >= 40 ? "Regierung hat Rückhalt" : "Mehrheit gefährdet";
  elements.mandateDescription.textContent = `Zustimmung ${game.approval}% · Rechtsstaatlichkeit ${game.legitimacy}%. Wahlen finden alle fünf Spielrunden statt.`;
  elements.mandateMeter.style.width = `${game.approval}%`;
  renderLog(elements.newsLog, game.log.filter((entry) => ["crisis", "war", "government", "law"].includes(entry.type)).slice(0, 9));
  renderLog(document.querySelector("#activity-log"), game.log.slice(0, 10));
}

function saveGame() {
  if (!game) return false;
  try {
    localStorage.setItem("europa-entscheidet-campaign-v2", saveCampaign(game));
    elements.saveIndicator.textContent = "Lokal gespeichert";
    elements.saveIndicator.classList.remove("save-error");
    return true;
  } catch (error) {
    console.error("Spielstand konnte nicht gespeichert werden.", error);
    elements.saveIndicator.textContent = "Speichern fehlgeschlagen";
    elements.saveIndicator.classList.add("save-error");
    return false;
  }
}

function updateTab(tabId) {
  document.querySelectorAll(".game-tab").forEach((tab) => {
    const active = tab.dataset.tab === tabId;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".game-view").forEach((view) => {
    const active = view.dataset.view === tabId;
    view.classList.toggle("is-active", active);
    view.hidden = !active;
  });
}

function renderGame() {
  elements.gameTitle.textContent = game.country.name;
  elements.campaignProfile.textContent = `${game.specialty} · ${game.alliances.length ? game.alliances.join(" / ") : "Kein Bündnis"} · Eskalationsrisiko ${game.escalationRisk}/100`;
  elements.eventTitle.textContent = game.news.title;
  elements.eventDescription.textContent = game.news.text;
  elements.eventIcon.textContent = game.news.type === "war" ? "⚠" : game.news.type === "diplomacy" ? "◇" : game.news.type === "crisis" ? "!" : "✳";
  elements.turnMessage.textContent = [
    game.actions.government ? "Regierung: gehandelt" : "Regierung: offen",
    game.actions.diplomacy ? "Diplomatie: gehandelt" : "Diplomatie: offen",
    game.actions.defense ? "Sicherheit: gehandelt" : "Sicherheit: offen",
  ].join(" · ") + " — Du kannst die Runde jederzeit beenden.";
  renderStats();
  renderPolicies();
  renderActionDots();
  renderDiplomacy();
  renderSecurity();
  renderParliament();
  saveGame();
}

function startGame() {
  if (!selectedCountry) return;
  const saved = getSavedCampaign();
  if (saved?.country?.id === selectedCountry.id
    && !window.confirm("Möchtest du wirklich eine neue Partie starten? Dein bisheriger Spielstand für dieses Land wird überschrieben.")) return;
  game = createCampaign(selectedCountry, countryProfiles[selectedCountry.name], countries, countryProfiles, aircraftByCountry);
  elements.gameSection.dataset.campaignActive = "true";
  elements.gameSection.hidden = false;
  updateTab("cabinet");
  renderGame();
  elements.gameSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function finishTurn() {
  const result = endTurn(game);
  if (!result.ok) return;
  renderGame();
}

function notifyAction(result) {
  if (!result?.ok && result?.message) {
    elements.turnMessage.textContent = result.message;
    return;
  }
  renderGame();
}

function restoreGame() {
  try {
    const serialized = localStorage.getItem("europa-entscheidet-campaign-v2");
    if (!serialized) return false;
    const restored = loadCampaign(serialized, countries);
    if (!restored) {
      localStorage.removeItem("europa-entscheidet-campaign-v2");
      return false;
    }
    game = restored;
    selectedCountry = game.country;
    updateSelection(selectedCountry);
    elements.gameSection.hidden = false;
    renderGame();
    updateTab("cabinet");
    elements.gameSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  } catch (error) {
    console.error("Gespeicherte Partie konnte nicht geladen werden.", error);
    return false;
  }
}

function applyPolicy(policyId) {
  notifyAction(makeInvestment(game, policyId));
}

function activateCountry(event) {
  const item = event.target.closest("[data-country]");
  if (!item) return;
  const country = countries.find((entry) => entry.id === item.dataset.country);
  if (country) updateSelection(country);
}

async function loadCountries() {
  const [mapResponse, countryDataResponse] = await Promise.all([
    fetch("./assets/europe.geojson"),
    fetch("./assets/country-data.json"),
  ]);
  if (!mapResponse.ok) throw new Error(`Europakarte konnte nicht geladen werden (${mapResponse.status}).`);
  if (!countryDataResponse.ok) throw new Error(`Länderprofile konnten nicht geladen werden (${countryDataResponse.status}).`);
  const [mapData, countryData] = await Promise.all([mapResponse.json(), countryDataResponse.json()]);
  countryProfiles = countryData.countries;
  const mapCountries = mapData.features.map((feature) => {
    const nameEn = feature.properties.nameEn || feature.properties.name;
    return {
      id: countryId(nameEn),
      name: feature.properties.name || nameEn,
      nameEn,
      flag: flagFor({ nameEn }),
      geometry: feature.geometry,
    };
  });
  countries = [...mapCountries, ...microstates.map((country) => ({ ...country, nameEn: country.name, geometry: null }))]
    .sort((left, right) => left.name.localeCompare(right.name, "de"));
  renderMap();
  renderCountryList();
  restoreGame();
}

elements.countryList.addEventListener("click", activateCountry);
elements.mapCountries.addEventListener("click", activateCountry);
elements.microstateMarkers.addEventListener("click", activateCountry);
for (const mapGroup of [elements.mapCountries, elements.microstateMarkers]) {
  mapGroup.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-country]")) {
      event.preventDefault();
      activateCountry(event.target);
    }
  });
}
elements.countrySearch.addEventListener("input", renderCountryList);
elements.countrySearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") elements.countryList.querySelector(".country-option")?.click();
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.countrySearch.focus();
  }
});
elements.startGame.addEventListener("click", startGame);
elements.resumeGame.addEventListener("click", restoreGame);
elements.policyGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-investment]");
  if (button && !button.disabled) applyPolicy(button.dataset.investment);
});
elements.lawGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-law]");
  if (button && !button.disabled) notifyAction(enactLaw(game, button.dataset.law));
});
elements.gameSection.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  if (button.dataset.tab) {
    updateTab(button.dataset.tab);
    return;
  }
  if (button.dataset.agreement) {
    notifyAction(proposeAgreement(game, game.selectedNationId, button.dataset.agreement));
    return;
  }
  if (button.dataset.diplomacy) {
    notifyAction(useDiplomacyAction(game, button.dataset.diplomacy));
    return;
  }
  if (button.dataset.military) {
    notifyAction(useDefenseAction(game, button.dataset.military));
    return;
  }
  if (button.dataset.offer) {
    notifyAction(answerOffer(game, button.dataset.offer === "accept"));
  }
});
elements.procurementForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(elements.procurementForm);
  const quantities = Object.fromEntries(procurementItems.map((item) => [item.id, Number(data.get(item.id))]));
  const result = procureEquipment(game, quantities);
  if (result.ok) elements.procurementForm.reset();
  notifyAction(result);
  if (!result.ok) renderSecurity();
});
elements.procurementForm.addEventListener("input", () => {
  if (game) renderSecurity();
});
elements.nationSelect.addEventListener("change", () => {
  if (!game) return;
  game.selectedNationId = elements.nationSelect.value;
  renderDiplomacy();
  renderSecurity();
  saveGame();
});
elements.gameTabs.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  const tabs = [...elements.gameTabs.querySelectorAll(".game-tab")];
  const current = tabs.indexOf(document.activeElement);
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const next = tabs[(current + direction + tabs.length) % tabs.length];
  event.preventDefault();
  next.focus();
  updateTab(next.dataset.tab);
});
elements.nextTurn.addEventListener("click", () => {
  if (game) finishTurn();
});
document.querySelector("#change-country").addEventListener("click", () => {
  elements.gameSection.hidden = true;
  document.querySelector(".setup-layout").scrollIntoView({ behavior: "smooth", block: "start" });
});

loadCountries().catch((error) => {
  console.error(error);
  elements.countryList.textContent = "Die Länderdaten konnten nicht geladen werden. Bitte lade die Seite neu.";
});
