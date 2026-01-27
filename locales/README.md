# VCSCI Internationalisation Guide

This directory contains translation files for the VCSCI project in Spanish (Latin American) and English (British).

---

## 📁 Files in This Directory

- **[es.json](es.json)** - Spanish (Latin American) translations
- **[en.json](en.json)** - English (British) translations
- **README.md** - This file

---

## 🌍 Supported Languages

| Code | Language | Variant | Status |
|------|----------|---------|--------|
| `es` | Spanish | Latin American | ✅ Complete |
| `en` | English | British | ✅ Complete |

---

## 📖 Structure of Translation Files

Translation files are organised by scope:

```json
{
  "ui": {
    "language": "Language",
    "dimensions": {
      "clarity": "Clarity",
      ...
    },
    "scale": {
      "1": "Not Functional",
      ...
    }
  },
  "scripts": {
    "loading_scores": "Loading scores...",
    ...
  },
  "reports": {
    "title": "VCSCI Evaluation Report",
    ...
  },
  "migration": { ... },
  "validation": { ... },
  "colors": { ... },
  "glossary": { ... }
}
```

### Scopes

| Scope | Purpose | Used By |
|-------|---------|---------|
| `ui` | User interface strings | HTML interfaces |
| `scripts` | Script messages and logs | Node.js scripts |
| `reports` | Report generation text | generate-report.js |
| `migration` | Migration process messages | migrate-phrase-lists.js |
| `validation` | Validation messages | validate-i18n.js |
| `colors` | Colour names | All components |
| `glossary` | Terminology definitions | Documentation |

---

## 🔧 Using Translations in Code

### In Node.js Scripts

```javascript
const { detectLanguage, loadMessages, t } = require('./lib/i18n');

// Auto-detect language from environment
const lang = detectLanguage();

// Load all messages for a scope
const msg = loadMessages(lang, 'scripts');
console.log(msg.loading_scores);  // "Loading scores..." or "Cargando puntuaciones..."

// Or use the t() function with dot notation
const message = t('scripts.loading_file', lang, { file: 'data.json' });
// Returns: "Loading file data.json..." or "Cargando archivo data.json..."
```

### In HTML/JavaScript

```javascript
// Load translations
const response = await fetch('../locales/es.json');
const translations = await response.json();

// Access UI strings
const clarityLabel = translations.ui.dimensions.clarity;
```

---

## 🌐 JSON Field Naming Convention

All JSON data files use suffixes `_es` and `_en` for bilingual fields:

### ✅ Correct Pattern

```json
{
  "text_es": "Quiero ir al baño.",
  "text_en": "I want to go to the toilet.",
  "domain_es": "Higiene/Salud",
  "domain_en": "Health/Hygiene"
}
```

### ❌ Legacy Pattern (Do Not Use)

```json
{
  "spanish": "Quiero ir al baño.",
  "english": "I want to go to the toilet.",
  "domain": "Higiene/Salud"
}
```

### Using Bilingual Fields in Code

```javascript
const { getFieldName, getBilingualField } = require('./lib/i18n');

// Get specific language version
const phraseText = getFieldName(phrase, 'text', 'es');  // Returns text_es value

// Get both versions
const bothTexts = getBilingualField(phrase, 'text');
// Returns: { es: "Quiero ir...", en: "I want to..." }
```

---

## ✍️ Adding New Translations

### Step 1: Add to Both Language Files

When adding a new translation key, **always** add it to both `es.json` and `en.json`:

**es.json:**
```json
{
  "ui": {
    "new_button": "Nuevo Botón"
  }
}
```

**en.json:**
```json
{
  "ui": {
    "new_button": "New Button"
  }
}
```

### Step 2: Use in Code

```javascript
const msg = loadMessages(lang, 'ui');
console.log(msg.new_button);
```

### Step 3: Validate

Run the validation script to ensure completeness:

```bash
node scripts/validate-i18n.js
```

---

## 📚 Glossary of Standard Terms

Use these standardised translations for consistency across the project:

| Término Español | English Term | Context | Notes |
|----------------|--------------|---------|-------|
| Claridad | Clarity | VCSCI Dimension | |
| Reconocibilidad | Recognizability | VCSCI Dimension | British spelling |
| Transparencia Semántica | Semantic Transparency | VCSCI Dimension | |
| Adecuación Pragmática | Pragmatic Fit | VCSCI Dimension | |
| Adecuación Cultural | Cultural Adequacy | VCSCI Dimension | |
| Accesibilidad Cognitiva | Cognitive Accessibility | VCSCI Dimension | |
| Pictograma | Pictogram | Visual element | |
| Evaluación | Evaluation | Process | Also: "assessment" |
| Valoración | Assessment | Result | |
| Puntuación | Score | Numerical value | |
| Rúbrica | Rubric | Evaluation tool | |
| Caso | Case | Pictogram case | |
| Frase | Phrase | Utterance | |
| CAA | AAC | Comm. system | Spanish: Comunicación Aumentativa y Alternativa |
| VCSCI | VCSCI | Index name | Unchanged in both languages |
| Excelente | Excellent | Score 5 | |
| Bien | Good | Score 4 | |
| Funciona | Works | Score 3 | |
| Insuficiente | Insufficient | Score 2 | |
| No funcional | Not Functional | Score 1 | |

### Colour Names

| Español | English | Hex Code | Score |
|---------|---------|----------|-------|
| rojo | red | #dc2626 | 1 |
| naranjo | orange | #ea580c | 2 |
| amarillo | yellow | #ffd93d | 3 |
| verde limón | lime green | #84cc16 | 4 |
| verde oscuro | dark green | #16a34a | 5 |

**Note:** In the locale files (`es.json` and `en.json`), colour values are stored as **hex codes** for direct use in interfaces:

```json
{
  "colors": {
    "score_1_color": "#dc2626",
    "score_2_color": "#ea580c",
    "score_3_color": "#ffd93d",
    "score_4_color": "#84cc16",
    "score_5_color": "#16a34a",
    "score_1_name": "rojo" or "red",
    "score_2_name": "naranjo" or "orange",
    ...
  }
}
```

---

## 🎨 Colour System

**Important:** Colours are assigned by **score level** (1-5), not by dimension.

```javascript
// Get colour from locale files
const messages = loadMessages('es', 'colors');
const color = messages.score_5_color;  // "#16a34a"
const colorName = messages.score_5_name;  // "verde oscuro"

// Or from rubric
const score = 5;
const rubric = loadRubric();
const color = rubric.scale[score].color;  // "#16a34a" (dark green)
```

---

## ✅ Translation Guidelines

### 1. Consistency

- Always use terms from the glossary above
- Maintain consistent tone (formal, professional)
- Match technical terminology exactly

### 2. British English vs. American English

Use **British English** spelling in all English translations:

| ✅ British | ❌ American |
|-----------|------------|
| colour | color |
| visualisation | visualization |
| recognise | recognize |
| analyse | analyze |
| centre | center |
| organisation | organization |

### 3. Latin American Spanish

- Use neutral Latin American Spanish
- Avoid regionalisms from specific countries
- Prefer terms widely understood across Spanish-speaking Americas

### 4. Technical Terms

- Do not translate: VCSCI, AAC (when used as acronym), JSON, HTML, SVG
- Translate full names: "Comunicación Aumentativa y Alternativa" (AAC expanded)

### 5. Variable Placeholders

Use `{{variableName}}` for variable placeholders:

```json
{
  "loading_file": "Loading file {{filename}}...",
  "cargando_archivo": "Cargando archivo {{filename}}..."
}
```

---

## 🧪 Testing Translations

### Validate Completeness

Check that all keys exist in both language files:

```bash
node scripts/validate-i18n.js
```

### Test in Scripts

Set environment variable to test different languages:

```bash
# Test Spanish
VCSCI_LANG=es node scripts/compile-evaluation-text.js

# Test English
VCSCI_LANG=en node scripts/compile-evaluation-text.js
```

### Test Language Detection

```bash
node scripts/lib/i18n.js
```

---

## 🔄 Migration from Legacy Format

If you find files still using the old format (`spanish`/`english`), migrate them:

```bash
# Dry run (preview changes)
node scripts/migrate-phrase-lists.js --dry-run

# Apply changes
node scripts/migrate-phrase-lists.js --apply
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T: Mix base field languages

```json
{
  "name": "Clarity",       // base in English
  "name_es": "Claridad",   // suffix for Spanish
  "label": "Excelente",    // base in Spanish ❌ INCONSISTENT
  "label_en": "Excellent"  // suffix for English
}
```

### ✅ DO: Use consistent suffixes

```json
{
  "name_es": "Claridad",
  "name_en": "Clarity",
  "label_es": "Excelente",
  "label_en": "Excellent"
}
```

### ❌ DON'T: Forget to update both files

Adding a key to only `es.json` or only `en.json` will cause validation errors.

### ✅ DO: Always update both language files simultaneously

Use a diff tool to ensure both files have the same structure.

---

## 📝 Contributing Translations

### For New Features

1. Add translation keys to **both** `es.json` and `en.json`
2. Follow the glossary for standard terms
3. Run `node scripts/validate-i18n.js` to verify
4. Test with both languages

### For Improving Existing Translations

1. Edit the appropriate locale file
2. Ensure changes maintain consistency with glossary
3. Run validation script
4. Test in relevant context (script, HTML, etc.)

### Requesting New Languages

To add support for additional languages:

1. Create new locale file (e.g., `fr.json` for French)
2. Copy structure from `en.json` or `es.json`
3. Translate all keys
4. Update `scripts/lib/i18n.js` to recognise new language code
5. Add to supported languages table above
6. Update documentation

---

## 🔗 Related Files

- [scripts/lib/i18n.js](../scripts/lib/i18n.js) - Node.js i18n library
- [scripts/validate-i18n.js](../scripts/validate-i18n.js) - Validation script
- [scripts/migrate-phrase-lists.js](../scripts/migrate-phrase-lists.js) - Migration script
- [examples/lib/i18n.js](../examples/lib/i18n.js) - HTML/JS i18n module

---

## 📞 Questions?

For questions about translations or internationalisation:

1. Check this README first
2. Run `node scripts/lib/i18n.js` to test language detection
3. Run `node scripts/validate-i18n.js` to check for issues
4. Consult the glossary for standard terminology
5. Open an issue on GitHub with tag `i18n`

---

**Last updated:** 2026-01-27
**VCSCI i18n Version:** 1.0.0
