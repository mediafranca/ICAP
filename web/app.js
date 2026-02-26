const DIMENSIONS = [
  { key: "clarity", code: "CLA", fallbackName: "Claridad" },
  { key: "recognizability", code: "REC", fallbackName: "Reconocibilidad" },
  { key: "semantic_transparency", code: "SEM", fallbackName: "Transparencia Semántica" },
  { key: "pragmatic_fit", code: "PRA", fallbackName: "Adecuación Pragmática" },
  { key: "cultural_adequacy", code: "CUL", fallbackName: "Adecuación Cultural" },
  { key: "cognitive_accessibility", code: "COG", fallbackName: "Accesibilidad Cognitiva" },
];

const AXIS_COLORS = ["#2563eb", "#0d9488", "#d97706", "#9333ea", "#e11d48", "#16a34a"];
const ICAP50_LIBRARY_PATH = "./examples/icap_50_v1_graph_2026-02-11.json";
const PROFILE_STORAGE_KEY = "icap:evaluator-profile:v2";
const LIBRARY_STORAGE_PREFIX = "icap:library-evals:v2:";

const state = {
  rubric: null,
  library: null,
  items: [],
  previewIndex: 0,
  evalIndex: 0,
  evaluatorProfile: null,
  evaluations: new Map(),
};

const el = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindElements();
  bindEvents();

  state.rubric = await loadRubric();
  buildSliders();
  loadEvaluatorProfile();
  updateStepLocks();
  goToStep(1);
}

function bindElements() {
  el.stepBtn1 = document.getElementById("stepBtn1");
  el.stepBtn2 = document.getElementById("stepBtn2");
  el.stepBtn3 = document.getElementById("stepBtn3");

  el.step1 = document.getElementById("step1");
  el.step2 = document.getElementById("step2");
  el.step3 = document.getElementById("step3");

  el.libraryFileInput = document.getElementById("libraryFileInput");
  el.loadSampleBtn = document.getElementById("loadSampleBtn");
  el.loadICAP50Btn = document.getElementById("loadICAP50Btn");
  el.libraryStatus = document.getElementById("libraryStatus");
  el.librarySummary = document.getElementById("librarySummary");

  el.libraryPreview = document.getElementById("libraryPreview");
  el.previewPrevBtn = document.getElementById("previewPrevBtn");
  el.previewNextBtn = document.getElementById("previewNextBtn");
  el.previewImage = document.getElementById("previewImage");
  el.previewCounter = document.getElementById("previewCounter");
  el.toStep2Btn = document.getElementById("toStep2Btn");

  el.evaluatorForm = document.getElementById("evaluatorForm");
  el.evalName = document.getElementById("evalName");
  el.evalAgeRange = document.getElementById("evalAgeRange");
  el.evalGender = document.getElementById("evalGender");
  el.evalRegion = document.getElementById("evalRegion");
  el.evalInstitution = document.getElementById("evalInstitution");
  el.evalEducation = document.getElementById("evalEducation");
  el.evalPrimaryLanguage = document.getElementById("evalPrimaryLanguage");
  el.evalAacExperience = document.getElementById("evalAacExperience");
  el.evalContext = document.getElementById("evalContext");
  el.evalRole = document.getElementById("evalRole");
  el.evalConsent = document.getElementById("evalConsent");
  el.toStep1Btn = document.getElementById("toStep1Btn");

  el.backToStep2Btn = document.getElementById("backToStep2Btn");
  el.evalPrevBtn = document.getElementById("evalPrevBtn");
  el.evalNextBtn = document.getElementById("evalNextBtn");
  el.evalCounter = document.getElementById("evalCounter");
  el.evalProgress = document.getElementById("evalProgress");

  el.focusImage = document.getElementById("focusImage");
  el.focusPhrase = document.getElementById("focusPhrase");

  el.interpretationStage = document.getElementById("interpretationStage");
  el.guessText = document.getElementById("guessText");
  el.saveGuessBtn = document.getElementById("saveGuessBtn");
  el.skipGuessBtn = document.getElementById("skipGuessBtn");

  el.likertStage = document.getElementById("likertStage");
  el.realPhraseText = document.getElementById("realPhraseText");
  el.dynamicTexts = document.getElementById("dynamicTexts");
  el.slidersContainer = document.getElementById("slidersContainer");
  el.editGuessBtn = document.getElementById("editGuessBtn");
  el.clearEvalBtn = document.getElementById("clearEvalBtn");

  el.hexChart = document.getElementById("hexChart");
  el.scoreBadge = document.getElementById("scoreBadge");

  el.exportJsonBtn = document.getElementById("exportJsonBtn");
}

function bindEvents() {
  el.stepBtn1.addEventListener("click", () => goToStep(1));
  el.stepBtn2.addEventListener("click", () => {
    if (!el.stepBtn2.disabled) goToStep(2);
  });
  el.stepBtn3.addEventListener("click", () => {
    if (!el.stepBtn3.disabled) goToStep(3);
  });

  el.libraryFileInput.addEventListener("change", onLibraryFileChange);
  el.loadSampleBtn.addEventListener("click", onLoadSampleClick);
  el.loadICAP50Btn.addEventListener("click", onLoadICAP50Click);
  el.previewPrevBtn.addEventListener("click", () => changePreviewIndex(state.previewIndex - 1));
  el.previewNextBtn.addEventListener("click", () => changePreviewIndex(state.previewIndex + 1));
  el.toStep2Btn.addEventListener("click", () => goToStep(2));

  el.toStep1Btn.addEventListener("click", () => goToStep(1));
  el.evaluatorForm.addEventListener("submit", onEvaluatorSubmit);

  el.backToStep2Btn.addEventListener("click", () => goToStep(2));
  el.evalPrevBtn.addEventListener("click", () => changeEvalItem(state.evalIndex - 1));
  el.evalNextBtn.addEventListener("click", () => changeEvalItem(state.evalIndex + 1));

  el.saveGuessBtn.addEventListener("click", onSaveGuess);
  el.skipGuessBtn.addEventListener("click", onSkipGuess);
  el.editGuessBtn.addEventListener("click", onEditGuess);
  el.clearEvalBtn.addEventListener("click", clearCurrentEvaluation);

  el.exportJsonBtn.addEventListener("click", exportEvaluationJson);
}

async function loadRubric() {
  try {
    const response = await fetch("./data/rubric-scale-descriptions.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("No se pudo cargar rubrica, uso fallback.", error);
    return createFallbackRubric();
  }
}

function createFallbackRubric() {
  const scale = {
    "1": { label_es: "No funcional", general_es: "No funciona y requiere rediseño.", color: "#dc2626" },
    "2": { label_es: "Insuficiente", general_es: "Presenta problemas relevantes.", color: "#ea580c" },
    "3": { label_es: "Funciona", general_es: "Funciona, aunque requiere mejoras.", color: "#d97706" },
    "4": { label_es: "Bien", general_es: "Cumple bien con mejoras menores.", color: "#65a30d" },
    "5": { label_es: "Excelente", general_es: "No requiere mejoras.", color: "#16a34a" },
  };

  const dimensions = {};
  DIMENSIONS.forEach((dim) => {
    const levels = {};
    for (let i = 1; i <= 5; i += 1) {
      levels[String(i)] = { text_es: `Nivel ${i} para ${dim.fallbackName}.` };
    }
    dimensions[dim.key] = {
      name_es: dim.fallbackName,
      description_es: dim.fallbackName,
      levels,
    };
  });

  return { version: "fallback", scale, dimensions };
}

function buildSliders() {
  el.slidersContainer.innerHTML = "";
  DIMENSIONS.forEach((dim) => {
    const meta = getDimensionMeta(dim.key);

    const card = document.createElement("article");
    card.className = "slider-card";

    const head = document.createElement("div");
    head.className = "slider-head";

    const titleWrap = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = `${meta.name} (${dim.code})`;
    const small = document.createElement("small");
    small.textContent = meta.description;
    titleWrap.append(strong, small);

    const chip = document.createElement("span");
    chip.className = "level-chip";
    chip.id = `chip-${dim.key}`;
    chip.textContent = "3/5";

    head.append(titleWrap, chip);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "5";
    slider.step = "1";
    slider.value = "3";
    slider.id = `slider-${dim.key}`;
    slider.dataset.key = dim.key;
    slider.addEventListener("input", onSliderInput);

    card.append(head, slider);
    el.slidersContainer.append(card);
  });
}

function goToStep(step) {
  el.step1.classList.toggle("hidden", step !== 1);
  el.step2.classList.toggle("hidden", step !== 2);
  el.step3.classList.toggle("hidden", step !== 3);

  el.stepBtn1.classList.toggle("active", step === 1);
  el.stepBtn2.classList.toggle("active", step === 2);
  el.stepBtn3.classList.toggle("active", step === 3);

  if (step === 3) renderCurrentEvalItem();
}

function updateStepLocks() {
  const hasLibrary = state.items.length > 0;
  const hasProfile = isProfileComplete(state.evaluatorProfile);

  el.stepBtn2.disabled = !hasLibrary;
  el.stepBtn3.disabled = !(hasLibrary && hasProfile);
  el.toStep2Btn.disabled = !hasLibrary;
}

function isProfileComplete(profile) {
  if (!profile) return false;
  return Boolean(
    profile.name &&
      profile.ageRange &&
      profile.gender &&
      profile.region &&
      profile.institution &&
      profile.primaryLanguage &&
      profile.aacExperience &&
      profile.context &&
      profile.role &&
      profile.consent,
  );
}

async function onLibraryFileChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    loadLibraryPayload(payload, file.name);
  } catch (error) {
    console.error(error);
    alert("No se pudo leer el JSON de biblioteca.");
  } finally {
    event.target.value = "";
  }
}

async function onLoadSampleClick() {
  const payload = buildSyntheticSampleLibrary();
  loadLibraryPayload(payload, "library-dump-sample.json");
}

async function onLoadICAP50Click() {
  try {
    const response = await fetch(ICAP50_LIBRARY_PATH);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    loadLibraryPayload(payload, "icap_50_v1_graph_2026-02-11.json");
  } catch (error) {
    console.error(error);
    alert("No se pudo cargar la biblioteca ICAP-50 de ejemplo.");
  }
}

function buildSyntheticSampleLibrary() {
  const phrases = ["Necesito agua", "Estoy feliz", "Vamos al parque"];
  const rows = phrases.map((utterance, index) => ({
    id: `SAMPLE_${String(index + 1).padStart(3, "0")}`,
    UTTERANCE: utterance,
    bitmap: createSyntheticBitmap(index, utterance),
  }));

  return {
    version: "1.0.0",
    type: "pictonet_graph_dump",
    timestamp: new Date().toISOString(),
    config: { lang: "es", author: "ICAP Synthetic Sample" },
    rows,
  };
}

function createSyntheticBitmap(index, utterance) {
  const palette = [
    ["#0f172a", "#38bdf8"],
    ["#0f172a", "#fbbf24"],
    ["#0f172a", "#22c55e"],
  ];
  const [ink, accent] = palette[index % palette.length];

  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 460;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(24, 24, canvas.width - 48, canvas.height - 48);
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(220, 170, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = accent;
  ctx.fillRect(320, 120, 170, 120);
  ctx.fillStyle = ink;
  ctx.fillRect(332, 132, 146, 96);

  ctx.fillStyle = "#374151";
  ctx.font = "600 30px Lexend, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Sample bitmap", 62, 330);
  ctx.font = "500 25px Lexend, sans-serif";
  ctx.fillText(utterance, 62, 372);

  return canvas.toDataURL("image/png");
}

function loadLibraryPayload(payload, fileName) {
  const { items } = parseLibraryPayload(payload);
  if (!items.length) {
    alert("El archivo no contiene pictogramas evaluables.");
    return;
  }

  state.items = items;
  state.library = {
    fileName,
    type: payload.type || "library_dump",
    version: payload.version || "desconocida",
    timestamp: payload.timestamp || null,
    author: payload.config && payload.config.author ? payload.config.author : "",
    key: buildLibraryStorageKey(payload, items),
  };

  state.previewIndex = 0;
  state.evalIndex = 0;
  state.evaluations = new Map();
  loadStoredEvaluations();

  renderLibrarySummary();
  renderPreview();
  updateStepLocks();
}

function parseLibraryPayload(payload) {
  const items = [];
  if (Array.isArray(payload.rows)) {
    payload.rows.forEach((row, index) => {
      const item = normalizeRowItem(row, index);
      if (item) items.push(item);
    });
  }

  return { items };
}

function normalizeRowItem(row, index) {
  const id = String(row.id || row.sourceRowId || `ROW_${index + 1}`);
  const utterance = String(row.UTTERANCE || row.utterance || row.prompt || `Item ${index + 1}`);

  const imageSrc = normalizeImageSource(row.bitmap);
  if (!imageSrc) return null;
  return { index, id, utterance, imageSrc };
}

function normalizeImageSource(raw) {
  if (typeof raw !== "string") return "";

  const value = raw.trim();
  if (!value) return "";

  if (value.startsWith("data:")) {
    if (/^data:image\/svg\+xml/i.test(value)) return "";
    if (!/^data:image\/(jpeg|jpg|png|webp)/i.test(value)) return "";
    if (/;base64,/i.test(value)) {
      const commaIndex = value.indexOf(",");
      const prefix = value.slice(0, commaIndex + 1);
      const payload = value.slice(commaIndex + 1).replace(/\s+/g, "");
      return `${prefix}${payload}`;
    }
    return value;
  }

  if (/^https?:\/\//i.test(value)) return value;

  const looksBase64 = /^[A-Za-z0-9+/=\s]+$/.test(value) && value.length > 512;
  if (looksBase64) {
    return `data:image/jpeg;base64,${value.replace(/\s+/g, "")}`;
  }

  return "";
}

function renderLibrarySummary() {
  if (!state.library) return;

  el.libraryStatus.textContent = `Biblioteca cargada con ${state.items.length} elementos.`;
  el.librarySummary.innerHTML = [
    `<strong>Archivo:</strong> ${escapeHtml(state.library.fileName)}`,
    `<strong>Tipo:</strong> ${escapeHtml(state.library.type)}`,
    `<strong>Versión:</strong> ${escapeHtml(state.library.version)}`,
    `<strong>Autor:</strong> ${escapeHtml(state.library.author || "No informado")}`,
  ].join(" · ");
  el.librarySummary.classList.remove("hidden");
  el.libraryPreview.classList.remove("hidden");
}

function changePreviewIndex(next) {
  if (next < 0 || next >= state.items.length) return;
  state.previewIndex = next;
  renderPreview();
}

function renderPreview() {
  if (!state.items.length) return;
  const item = state.items[state.previewIndex];

  setImage(el.previewImage, item.imageSrc, `Pictograma ${item.id}`);
  el.previewCounter.textContent = `${state.previewIndex + 1} / ${state.items.length}`;

  el.previewPrevBtn.disabled = state.previewIndex === 0;
  el.previewNextBtn.disabled = state.previewIndex === state.items.length - 1;
}

function setImage(imgEl, source, label) {
  const fallback = createPlaceholder(label || "Pictograma sin imagen");
  imgEl.onerror = () => {
    if (imgEl.src !== fallback) imgEl.src = fallback;
  };
  imgEl.src = source || fallback;
}

function createPlaceholder(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 520;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  ctx.fillStyle = "#6b7280";
  ctx.font = "600 28px Lexend, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL("image/png");
}

function onEvaluatorSubmit(event) {
  event.preventDefault();
  const profile = {
    name: el.evalName.value.trim(),
    ageRange: el.evalAgeRange.value,
    gender: el.evalGender.value,
    region: el.evalRegion.value.trim(),
    institution: el.evalInstitution.value.trim(),
    education: el.evalEducation.value,
    primaryLanguage: el.evalPrimaryLanguage.value,
    aacExperience: el.evalAacExperience.value,
    context: el.evalContext.value,
    consent: Boolean(el.evalConsent.checked),
    role: el.evalRole.value,
    savedAt: new Date().toISOString(),
  };

  if (
    !profile.name ||
    !profile.ageRange ||
    !profile.gender ||
    !profile.region ||
    !profile.institution ||
    !profile.primaryLanguage ||
    !profile.aacExperience ||
    !profile.context ||
    !profile.role ||
    !profile.consent
  ) {
    alert("Completa todos los campos obligatorios del evaluador.");
    return;
  }

  state.evaluatorProfile = profile;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

  updateStepLocks();
  goToStep(3);
}

function loadEvaluatorProfile() {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return;
  try {
    const profile = JSON.parse(raw);
    state.evaluatorProfile = profile;

    el.evalName.value = profile.name || "";
    el.evalAgeRange.value = profile.ageRange || "";
    el.evalGender.value = profile.gender || "";
    el.evalRegion.value = profile.region || "";
    el.evalInstitution.value = profile.institution || "";
    el.evalEducation.value = profile.education || "";
    el.evalPrimaryLanguage.value = profile.primaryLanguage || "";
    el.evalAacExperience.value = profile.aacExperience || "";
    el.evalContext.value = profile.context || "";
    el.evalRole.value = profile.role || "";
    el.evalConsent.checked = Boolean(profile.consent);
  } catch (error) {
    console.warn("No se pudo cargar perfil de evaluador.", error);
  }
}

function changeEvalItem(nextIndex) {
  if (nextIndex < 0 || nextIndex >= state.items.length) return;
  state.evalIndex = nextIndex;
  renderCurrentEvalItem();
}

function renderCurrentEvalItem() {
  if (!state.items.length) return;

  const item = state.items[state.evalIndex];
  const record = ensureRecord(item.id);

  setImage(el.focusImage, item.imageSrc, `Pictograma ${item.id}`);
  el.evalCounter.textContent = `${state.evalIndex + 1} / ${state.items.length}`;
  el.evalPrevBtn.disabled = state.evalIndex === 0;
  el.evalNextBtn.disabled = state.evalIndex === state.items.length - 1;

  const completed = countCompletedItems();
  el.evalProgress.textContent = `${completed} evaluados de ${state.items.length}`;

  const hasGuess = Boolean(record.guess && record.guess.trim());
  const wasSkipped = Boolean(record.guessSkipped);

  if (!hasGuess && !wasSkipped) {
    el.focusPhrase.textContent = "";
    el.interpretationStage.classList.remove("hidden");
    el.likertStage.classList.add("hidden");
    el.guessText.value = "";
    return;
  }

  el.interpretationStage.classList.add("hidden");
  el.likertStage.classList.remove("hidden");
  el.focusPhrase.textContent = "";
  el.realPhraseText.textContent = item.utterance;

  setScoresToUI(record.scores || defaultScores());
  updateLikertTexts(record.scores || defaultScores());
}

function onSaveGuess() {
  if (!state.items.length) return;

  const guess = el.guessText.value.trim();
  if (!guess) {
    alert("Debes escribir qué comunica el pictograma antes de pasar a la evaluación.");
    return;
  }

  const item = state.items[state.evalIndex];
  const record = ensureRecord(item.id);
  record.guess = guess;
  record.guessSkipped = false;
  record.guessUpdatedAt = new Date().toISOString();

  if (!record.scores) record.scores = defaultScores();
  record.average = averageScore(record.scores);
  record.updatedAt = new Date().toISOString();

  state.evaluations.set(item.id, record);
  persistEvaluations();

  renderCurrentEvalItem();
}

function onSkipGuess() {
  if (!state.items.length) return;
  const item = state.items[state.evalIndex];
  const record = ensureRecord(item.id);

  record.guess = "";
  record.guessSkipped = true;
  record.guessUpdatedAt = new Date().toISOString();
  if (!record.scores) record.scores = defaultScores();
  record.average = averageScore(record.scores);
  record.updatedAt = new Date().toISOString();

  state.evaluations.set(item.id, record);
  persistEvaluations();
  renderCurrentEvalItem();
}

function onEditGuess() {
  if (!state.items.length) return;
  const item = state.items[state.evalIndex];
  const record = ensureRecord(item.id);
  el.guessText.value = record.guess || "";
  record.guessSkipped = false;
  state.evaluations.set(item.id, record);
  persistEvaluations();
  el.interpretationStage.classList.remove("hidden");
  el.likertStage.classList.add("hidden");
}

function clearCurrentEvaluation() {
  if (!state.items.length) return;
  const item = state.items[state.evalIndex];
  state.evaluations.delete(item.id);
  persistEvaluations();
  renderCurrentEvalItem();
}

function onSliderInput(event) {
  const item = state.items[state.evalIndex];
  if (!item) return;

  const scores = readScoresFromUI();
  const record = ensureRecord(item.id);
  record.scores = scores;
  record.average = averageScore(scores);
  record.updatedAt = new Date().toISOString();

  state.evaluations.set(item.id, record);
  persistEvaluations();

  updateLikertTexts(scores);
}

function updateLikertTexts(scores) {
  DIMENSIONS.forEach((dim) => {
    const value = clampScore(scores[dim.key]);
    const chip = document.getElementById(`chip-${dim.key}`);
    chip.textContent = `${value}/5`;

    const color = getScaleMeta(value).color;
    chip.style.borderColor = color;
    chip.style.color = color;
  });

  renderDynamicTexts(scores);
  drawHexChart(scores);

  const avg = averageScore(scores);
  el.scoreBadge.textContent = `ICAP ${avg.toFixed(2)}`;
  const rounded = clampScore(Math.round(avg));
  el.scoreBadge.style.backgroundColor = getScaleMeta(rounded).color;
}

function renderDynamicTexts(scores) {
  el.dynamicTexts.innerHTML = "";

  const avg = averageScore(scores);
  const rounded = clampScore(Math.round(avg));
  const scale = getScaleMeta(rounded);

  const general = document.createElement("article");
  general.innerHTML = `<h4>Resumen general (${scale.label})</h4><p>${escapeHtml(scale.general)}</p>`;
  el.dynamicTexts.append(general);

  DIMENSIONS.forEach((dim) => {
    const score = clampScore(scores[dim.key]);
    const meta = getDimensionMeta(dim.key);
    const fullText = getDimensionLevelText(dim.key, score);
    const shortText = toFirstSentence(fullText);

    const card = document.createElement("article");
    card.innerHTML = `<h4>${escapeHtml(meta.name)} (${score})</h4><p>${escapeHtml(shortText)}</p>`;
    el.dynamicTexts.append(card);
  });
}

function toFirstSentence(text) {
  if (!text) return "";
  const trimmed = text.trim();
  const dotIndex = trimmed.indexOf(".");
  if (dotIndex === -1) return trimmed;
  return `${trimmed.slice(0, dotIndex + 1)}`;
}

function drawHexChart(scores) {
  const canvas = el.hexChart;
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2 + 8;
  const radius = Math.min(width, height) * 0.34;

  ctx.clearRect(0, 0, width, height);

  for (let lvl = 1; lvl <= 5; lvl += 1) {
    const points = DIMENSIONS.map((_, i) => polarPoint(cx, cy, (radius * lvl) / 5, i, DIMENSIONS.length));
    strokePolygon(ctx, points, lvl === 5 ? "#9ca3af" : "#e5e7eb", lvl === 5 ? 0 : 3);
  }

  DIMENSIONS.forEach((dim, i) => {
    const edge = polarPoint(cx, cy, radius, i, DIMENSIONS.length);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(edge.x, edge.y);
    ctx.strokeStyle = "#e5e7eb";
    ctx.setLineDash([]);
    ctx.stroke();

    const label = polarPoint(cx, cy, radius + 20, i, DIMENSIONS.length);
    ctx.fillStyle = "#4b5563";
    ctx.font = "600 12px Lexend, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(dim.code, label.x, label.y);
  });

  const dataPoints = DIMENSIONS.map((dim, i) => {
    const val = clampScore(scores[dim.key]);
    return polarPoint(cx, cy, (radius * val) / 5, i, DIMENSIONS.length);
  });

  ctx.beginPath();
  dataPoints.forEach((point, i) => {
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(37, 99, 235, 0.16)";
  ctx.strokeStyle = "#1d4ed8";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  dataPoints.forEach((point, i) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = AXIS_COLORS[i];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  });
}

function ensureRecord(itemId) {
  const existing = state.evaluations.get(itemId);
  if (existing) return existing;

  const record = {
    itemId,
    guess: "",
    guessSkipped: false,
    guessUpdatedAt: null,
    scores: null,
    average: null,
    updatedAt: null,
  };
  state.evaluations.set(itemId, record);
  return record;
}

function readScoresFromUI() {
  const scores = {};
  DIMENSIONS.forEach((dim) => {
    const slider = document.getElementById(`slider-${dim.key}`);
    scores[dim.key] = clampScore(Number(slider.value));
  });
  return scores;
}

function setScoresToUI(scores) {
  DIMENSIONS.forEach((dim) => {
    const slider = document.getElementById(`slider-${dim.key}`);
    slider.value = String(clampScore(scores[dim.key]));
  });
}

function defaultScores() {
  const scores = {};
  DIMENSIONS.forEach((dim) => {
    scores[dim.key] = 3;
  });
  return scores;
}

function averageScore(scores) {
  const total = DIMENSIONS.reduce((acc, dim) => acc + clampScore(scores[dim.key]), 0);
  return total / DIMENSIONS.length;
}

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 3;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function polarPoint(cx, cy, radius, index, total) {
  const angle = -Math.PI / 2 + (index * (Math.PI * 2)) / total;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function strokePolygon(ctx, points, strokeColor, dash) {
  if (!points.length) return;
  ctx.beginPath();
  points.forEach((point, i) => {
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.strokeStyle = strokeColor;
  if (dash > 0) ctx.setLineDash([dash, dash]);
  else ctx.setLineDash([]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function getDimensionMeta(key) {
  const dim = state.rubric && state.rubric.dimensions ? state.rubric.dimensions[key] : null;
  const fallback = DIMENSIONS.find((d) => d.key === key);
  return {
    name: dim && dim.name_es ? dim.name_es : fallback.fallbackName,
    description: dim && dim.description_es ? dim.description_es : fallback.fallbackName,
  };
}

function getDimensionLevelText(key, score) {
  const dim = state.rubric && state.rubric.dimensions ? state.rubric.dimensions[key] : null;
  const lvl = dim && dim.levels ? dim.levels[String(score)] : null;
  return lvl && lvl.text_es ? lvl.text_es : "Sin descripción para este nivel.";
}

function getScaleMeta(score) {
  const scale = state.rubric && state.rubric.scale ? state.rubric.scale[String(score)] : null;
  return {
    label: scale && scale.label_es ? scale.label_es : `Nivel ${score}`,
    general: scale && scale.general_es ? scale.general_es : "",
    color: scale && scale.color ? scale.color : "#111827",
  };
}

function buildLibraryStorageKey(payload, items) {
  const basis = [
    payload.type || "",
    payload.version || "",
    payload.timestamp || "",
    String(items.length),
    items[0] ? items[0].id : "",
    items[items.length - 1] ? items[items.length - 1].id : "",
  ].join("|");

  let hash = 0;
  for (let i = 0; i < basis.length; i += 1) {
    hash = (hash << 5) - hash + basis.charCodeAt(i);
    hash |= 0;
  }

  return `k${Math.abs(hash)}`;
}

function persistEvaluations() {
  if (!state.library) return;
  const key = LIBRARY_STORAGE_PREFIX + state.library.key;
  const payload = {
    savedAt: new Date().toISOString(),
    evaluations: Array.from(state.evaluations.values()),
  };
  localStorage.setItem(key, JSON.stringify(payload));
}

function loadStoredEvaluations() {
  if (!state.library) return;
  const key = LIBRARY_STORAGE_PREFIX + state.library.key;
  const raw = localStorage.getItem(key);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const map = new Map();
    if (Array.isArray(parsed.evaluations)) {
      parsed.evaluations.forEach((record) => {
        if (!record || !record.itemId) return;
        map.set(record.itemId, record);
      });
    }
    state.evaluations = map;
  } catch (error) {
    console.warn("No se pudieron recuperar evaluaciones guardadas.", error);
  }
}

function countCompletedItems() {
  let count = 0;
  state.items.forEach((item) => {
    const record = state.evaluations.get(item.id);
    if (record && record.scores) count += 1;
  });
  return count;
}

function exportEvaluationJson() {
  if (!state.library || !state.items.length) {
    alert("Primero carga una biblioteca.");
    return;
  }

  if (!state.evaluatorProfile) {
    alert("Primero guarda los datos del evaluador.");
    return;
  }

  const items = state.items.map((item, idx) => {
    const record = state.evaluations.get(item.id) || null;
    return {
      index: idx + 1,
      itemId: item.id,
      utterance: item.utterance,
      comprension_pragmatica: {
        estado: record ? (record.guessSkipped ? "omitida" : record.guess ? "respondida" : "pendiente") : "pendiente",
        respuesta: record && record.guess ? record.guess : "",
      },
      scores: record && record.scores ? record.scores : null,
      average: record && typeof record.average === "number" ? Number(record.average.toFixed(3)) : null,
      updatedAt: record ? record.updatedAt : null,
    };
  });

  const summary = buildSummary();
  const payload = {
    schemaVersion: "icap-library-evaluation-1.1.0",
    exportedAt: new Date().toISOString(),
    library: state.library,
    evaluator: state.evaluatorProfile,
    summary,
    items,
  };

  const safeBase = sanitizeFilename((state.library.fileName || "library").replace(/\.json$/i, ""));
  const fileName = `${safeBase}_icap_eval_${new Date().toISOString().slice(0, 10)}.json`;
  downloadJson(payload, fileName);
}

function buildSummary() {
  const all = Array.from(state.evaluations.values()).filter((r) => r && r.scores);
  if (!all.length) {
    return {
      totalItems: state.items.length,
      completedItems: 0,
      completionRate: 0,
      overallAverage: null,
      dimensionAverages: Object.fromEntries(DIMENSIONS.map((d) => [d.key, null])),
    };
  }

  const dimensionAverages = {};
  DIMENSIONS.forEach((dim) => {
    const sum = all.reduce((acc, r) => acc + clampScore(r.scores[dim.key]), 0);
    dimensionAverages[dim.key] = Number((sum / all.length).toFixed(3));
  });

  const overall = all.reduce((acc, r) => acc + r.average, 0) / all.length;
  return {
    totalItems: state.items.length,
    completedItems: all.length,
    completionRate: Number(((all.length / state.items.length) * 100).toFixed(2)),
    overallAverage: Number(overall.toFixed(3)),
    dimensionAverages,
  };
}

function downloadJson(payload, fileName) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

function sanitizeFilename(value) {
  return value.replace(/[^a-z0-9._-]/gi, "_").replace(/_+/g, "_");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
