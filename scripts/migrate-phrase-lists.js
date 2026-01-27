#!/usr/bin/env node

/**
 * Migrate Phrase Lists to New i18n Format
 *
 * Transforms phrase list files from legacy format to new bilingual format:
 * - "spanish" → "text_es"
 * - "english" → "text_en"
 * - "domain" → "domain_es" + "domain_en" (with translation)
 * - "syntax" → "syntax_es" + "syntax_en" (with translation)
 *
 * Usage:
 *   node scripts/migrate-phrase-lists.js --dry-run   # Preview changes
 *   node scripts/migrate-phrase-lists.js --apply     # Apply changes
 *   node scripts/migrate-phrase-lists.js --file core-phrase-list-01-request.json
 */

const fs = require('fs');
const path = require('path');
const { detectLanguage, loadMessages } = require('./lib/i18n');

// Domain translations (Spanish → English)
const DOMAIN_TRANSLATIONS = {
  'Higiene/Salud': 'Health/Hygiene',
  'Salud/Higiene': 'Health/Hygiene',
  'Hogar': 'Home',
  'Casa/Hogar': 'Home',
  'Escuela': 'School',
  'Comida': 'Food',
  'Comunidad': 'Community',
  'Ocio': 'Leisure',
  'Ocio/Comunidad': 'Leisure/Community',
  'Escuela/Ocio': 'School/Leisure',
  'Emociones': 'Emotions',
  'Interacción Social': 'Social Interaction',
  'Actividades Cotidianas': 'Daily Activities',
  'Actividades cotidianas': 'Daily Activities',
  'Transporte': 'Transport',
  'Comunicación': 'Communication',
  'Tiempo': 'Time',
  'Lugar': 'Place',
  'Personas': 'People',
  'Objetos': 'Objects',
  'Acciones': 'Actions',
  'General': 'General'
};

// Syntax pattern translations (partial matches)
const SYNTAX_PATTERNS = {
  'Verbo': 'Verb',
  'Sustantivo': 'Noun',
  'Adjetivo': 'Adjective',
  'Adverbio': 'Adverb',
  'Pronombre': 'Pronoun',
  'Negación': 'Negation',
  'Exclamación': 'Exclamation',
  'Interjección': 'Interjection',
  'Locución': 'Phrase',
  'Frase nominal': 'Noun phrase',
  'Fórmula fija': 'Fixed formula',
  'Expresión': 'Expression',
  'querer': 'want',
  'necesitar': 'need',
  'tener': 'have',
  'ir': 'go',
  'hacer': 'do/make',
  'estar': 'be',
  'infinitivo': 'infinitive',
  'presente': 'present',
  'futuro': 'future',
  'pasado': 'past',
  'imperativo': 'imperative',
  'lugar': 'place',
  'persona': 'person',
  'objeto': 'object',
  'acción': 'action',
  'tiempo': 'time',
  'modo': 'manner',
  'cantidad': 'quantity',
  'pregunta': 'question',
  'cortesía': 'politeness',
  'rechazo': 'rejection',
  'cuantificador': 'quantifier',
  'adverbial': 'adverbial',
  'saludo': 'greeting',
  'despedida': 'farewell',
  'disculpa': 'apology',
  'elogio': 'praise'
};

/**
 * Translate domain to English
 */
function translateDomain(domainES) {
  if (!domainES) return '';

  // Exact match
  if (DOMAIN_TRANSLATIONS[domainES]) {
    return DOMAIN_TRANSLATIONS[domainES];
  }

  // Try case-insensitive match
  const domainLower = domainES.toLowerCase();
  for (const [es, en] of Object.entries(DOMAIN_TRANSLATIONS)) {
    if (es.toLowerCase() === domainLower) {
      return en;
    }
  }

  // Return original if no translation found
  console.warn(`  ⚠️  No translation found for domain: "${domainES}"`);
  return domainES;
}

/**
 * Translate syntax description to English
 */
function translateSyntax(syntaxES) {
  if (!syntaxES) return '';

  let syntaxEN = syntaxES;

  // Replace known patterns
  for (const [es, en] of Object.entries(SYNTAX_PATTERNS)) {
    const regex = new RegExp(es, 'gi');
    syntaxEN = syntaxEN.replace(regex, en);
  }

  // If nothing was translated, warn
  if (syntaxEN === syntaxES) {
    console.warn(`  ⚠️  No translation applied for syntax: "${syntaxES}"`);
  }

  return syntaxEN;
}

/**
 * Transform phrase object from old to new format
 */
function transformPhrase(phrase) {
  const transformed = {};

  // Copy phrase_id and function if they exist
  if (phrase.phrase_id) transformed.phrase_id = phrase.phrase_id;
  if (phrase.function) transformed.function = phrase.function;

  // Transform text fields
  if (phrase.spanish) {
    transformed.text_es = phrase.spanish;
  } else if (phrase.text_es) {
    transformed.text_es = phrase.text_es;
  }

  if (phrase.english) {
    transformed.text_en = phrase.english;
  } else if (phrase.text_en) {
    transformed.text_en = phrase.text_en;
  }

  // Transform domain
  if (phrase.domain) {
    transformed.domain_es = phrase.domain;
    transformed.domain_en = translateDomain(phrase.domain);
  } else {
    if (phrase.domain_es) transformed.domain_es = phrase.domain_es;
    if (phrase.domain_en) transformed.domain_en = phrase.domain_en;
  }

  // Transform syntax
  if (phrase.syntax) {
    transformed.syntax_es = phrase.syntax;
    transformed.syntax_en = translateSyntax(phrase.syntax);
  } else {
    if (phrase.syntax_es) transformed.syntax_es = phrase.syntax_es;
    if (phrase.syntax_en) transformed.syntax_en = phrase.syntax_en;
  }

  // Copy any other fields
  for (const [key, value] of Object.entries(phrase)) {
    if (!['phrase_id', 'function', 'spanish', 'english', 'domain', 'syntax',
          'text_es', 'text_en', 'domain_es', 'domain_en', 'syntax_es', 'syntax_en'].includes(key)) {
      transformed[key] = value;
    }
  }

  return transformed;
}

/**
 * Check if phrase list needs migration
 */
function needsMigration(data) {
  if (!data.phrases || !Array.isArray(data.phrases)) {
    return false;
  }

  // Check if any phrase has old format fields
  return data.phrases.some(phrase =>
    phrase.hasOwnProperty('spanish') ||
    phrase.hasOwnProperty('english') ||
    (phrase.hasOwnProperty('domain') && !phrase.hasOwnProperty('domain_es'))
  );
}

/**
 * Migrate single file
 */
function migrateFile(filePath, dryRun = true) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);

  // Read file
  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(content);
  } catch (error) {
    console.error(`  ❌ Error reading file: ${error.message}`);
    return { success: false, error: error.message };
  }

  // Check if migration needed
  if (!needsMigration(data)) {
    console.log(`  ✅ Already in new format - skipping`);
    return { success: true, skipped: true };
  }

  console.log(`  🔄 Old format detected - migration needed`);

  // Transform phrases
  const transformedData = {
    ...data,
    phrases: data.phrases.map(phrase => transformPhrase(phrase))
  };

  // Show sample transformation
  if (data.phrases.length > 0) {
    console.log(`  📝 Sample transformation:`);
    console.log(`     Before: spanish="${data.phrases[0].spanish?.substring(0, 30)}..."`);
    console.log(`     After:  text_es="${transformedData.phrases[0].text_es?.substring(0, 30)}..."`);
  }

  // Count changes
  const phraseCount = data.phrases.length;
  console.log(`  📊 Phrases to migrate: ${phraseCount}`);

  if (dryRun) {
    console.log(`  🔍 DRY RUN - No changes written`);
    return { success: true, dryRun: true, phraseCount };
  }

  // Create backup
  const backupPath = `${filePath}.backup`;
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`  💾 Backup created: ${path.basename(backupPath)}`);
  } catch (error) {
    console.error(`  ❌ Error creating backup: ${error.message}`);
    return { success: false, error: error.message };
  }

  // Write transformed file
  try {
    const output = JSON.stringify(transformedData, null, 2);
    fs.writeFileSync(filePath, output + '\n', 'utf8');
    console.log(`  ✅ File migrated successfully`);
    return { success: true, migrated: true, phraseCount, backupPath };
  } catch (error) {
    console.error(`  ❌ Error writing file: ${error.message}`);
    // Try to restore backup
    try {
      fs.copyFileSync(backupPath, filePath);
      console.log(`  ↩️  Backup restored`);
    } catch (restoreError) {
      console.error(`  ❌ Error restoring backup: ${restoreError.message}`);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Find all phrase list files
 */
function findPhraseListFiles(specificFile = null) {
  const rootDir = path.resolve(__dirname, '..');

  if (specificFile) {
    const filePath = path.resolve(rootDir, specificFile);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return [filePath];
  }

  // Find all core-phrase-list-*.json files in root directory
  const files = fs.readdirSync(rootDir)
    .filter(file => file.startsWith('core-phrase-list-') && file.endsWith('.json'))
    .map(file => path.join(rootDir, file));

  return files;
}

/**
 * Main migration process
 */
function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const apply = args.includes('--apply');
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const specificFile = fileArg ? fileArg.split('=')[1] : null;

  // Validate arguments
  if (!dryRun && !apply) {
    console.error('❌ Error: Must specify --dry-run or --apply');
    console.error('\nUsage:');
    console.error('  node scripts/migrate-phrase-lists.js --dry-run   # Preview changes');
    console.error('  node scripts/migrate-phrase-lists.js --apply     # Apply changes');
    console.error('  node scripts/migrate-phrase-lists.js --apply --file=core-phrase-list-01-request.json');
    process.exit(1);
  }

  // Load messages for output
  const lang = detectLanguage();
  const msg = loadMessages(lang, 'migration');

  // Display header
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  VCSCI Phrase List Migration                               ║');
  console.log('║  Legacy Format → New i18n Format                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  if (dryRun) {
    console.log('🔍 Mode: DRY RUN (preview only, no changes will be written)');
  } else {
    console.log('✍️  Mode: APPLY (changes will be written to files)');
  }

  // Find files
  let files;
  try {
    files = findPhraseListFiles(specificFile);
    console.log(`\n📁 Found ${files.length} file(s) to process\n`);
  } catch (error) {
    console.error(`\n❌ ${error.message}\n`);
    process.exit(1);
  }

  // Process files
  const results = [];
  for (const file of files) {
    const result = migrateFile(file, dryRun);
    results.push({ file, ...result });
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('═'.repeat(60));

  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const migrated = results.filter(r => r.migrated).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;
  const totalPhrases = results.reduce((sum, r) => sum + (r.phraseCount || 0), 0);

  console.log(`\nFiles analyzed:  ${total}`);
  console.log(`Files migrated:  ${migrated}`);
  console.log(`Files skipped:   ${skipped} (already in new format)`);
  console.log(`Files failed:    ${failed}`);
  console.log(`Total phrases:   ${totalPhrases}`);

  if (failed > 0) {
    console.log('\n❌ Errors occurred during migration:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${path.basename(r.file)}: ${r.error}`);
    });
  }

  if (dryRun && migrated > 0) {
    console.log('\n💡 To apply these changes, run:');
    console.log('   node scripts/migrate-phrase-lists.js --apply');
  }

  if (!dryRun && migrated > 0) {
    console.log('\n💾 Backups created for all migrated files (.backup extension)');
    console.log('\n✅ Migration complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Verify migrated files are correct');
    console.log('   2. Run: node scripts/validate-i18n.js');
    console.log('   3. Test loading phrase lists in scripts');
    console.log('   4. If all good, delete .backup files');
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  transformPhrase,
  needsMigration,
  migrateFile,
  translateDomain,
  translateSyntax
};
