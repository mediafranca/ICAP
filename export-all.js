/** 
 * Exportador JSON por hoja (incluye NSM).
 * Estructura:
 * {
 *   "function": "<sheet name>",
 *   "phrases": [
 *     {
 *       "english": "...",
 *       "spanish": "...",
 *       "domain": "...",
 *       "syntax": "...",
 *       "nsm": {
 *         "gloss": "...",
 *         "primitives": ["I","WANT",...],
 *         "frame": "...",
 *         "role": "...",
 *         "note": "..."
 *       }
 *     }
 *   ]
 * }
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('VCSCI')
    .addItem('Exportar JSONs (NSM)', 'exportSheetsToJsonsNSM')
    .addToUi();
}

function exportSheetsToJsonsNSM() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const baseName = 'core-phrase-list';
  const timestamp = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd_HHmm');
  const outFolder = DriveApp.createFolder(`VCSCI_export_${timestamp}`);

  // Cabeceras esperadas (mínimas)
  const baseHeaders = ['english','spanish','domain','syntax'];
  const nsmHeaders  = ['nsm-gloss','nsm-primitives','nsm-frame','nsm-role','nsm-note'];

  sheets.forEach((sh, idx) => {
    const sheetName = sh.getName();
    const values = sh.getDataRange().getValues();
    if (values.length < 2) {
      writeJsonFile(outFolder, `${baseName}-${zeroPad(idx+1,2)}-${slugify(sheetName)}.json`, { function: sheetName, phrases: [] });
      return;
    }

    // Normaliza headers
    const headers = values[0].map(h => String(h).trim().toLowerCase());
    const col = mapHeaderIndexes(headers, [...baseHeaders, ...nsmHeaders]);

    const phrases = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      if (row.every(cell => String(cell).trim() === '')) continue;

      const english = pickCell(row, col['english']);
      const spanish = pickCell(row, col['spanish']);
      const domain  = pickCell(row, col['domain']);
      const syntax  = pickCell(row, col['syntax']);

      // extra NSM fields
      const nsm_gloss = pickCell(row, col['nsm-gloss']);
      const nsm_prims_raw = pickCell(row, col['nsm-primitives']);
      const nsm_frame = pickCell(row, col['nsm-frame']);
      const nsm_role  = pickCell(row, col['nsm-role']);
      const nsm_note  = pickCell(row, col['nsm-note']);

      // convierte primitives a array (por comas)
      const primitives = nsm_prims_raw
        ? nsm_prims_raw.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      // salta filas totalmente vacías
      const hasBase = [english,spanish,domain,syntax].some(v => v !== '');
      const hasNSM  = [nsm_gloss,nsm_prims_raw,nsm_frame,nsm_role,nsm_note].some(v => v !== '');
      if (!hasBase && !hasNSM) continue;

      phrases.push({
        english,
        spanish,
        domain,
        syntax,
        nsm: {
          gloss: nsm_gloss,
          primitives,
          frame: nsm_frame,
          role: nsm_role,
          note: nsm_note
        }
      });
    }

    const obj = { function: sheetName, phrases };
    const fname = `${baseName}-${zeroPad(idx+1,2)}-${slugify(sheetName)}.json`;
    writeJsonFile(outFolder, fname, obj);
  });

  SpreadsheetApp.getActiveSpreadsheet().toast(`Export completo: ${outFolder.getName()}`, 'VCSCI (NSM)', 8);
  Logger.log('Carpeta salida: %s', outFolder.getUrl());
}

/* =========================
   Helpers
   ========================= */

function writeJsonFile(folder, filename, obj) {
  const json = JSON.stringify(obj, null, 2);
  folder.createFile(filename, json, MimeType.JSON);
}

function mapHeaderIndexes(actualHeaders, expectedHeaders) {
  const idx = {};
  expectedHeaders.forEach(h => {
    const i = actualHeaders.indexOf(h);
    idx[h] = (i >= 0 ? i : -1);
  });
  return idx;
}

function pickCell(row, idx) {
  if (idx < 0 || idx >= row.length) return '';
  const v = row[idx];
  return (v === null || v === undefined) ? '' : String(v).trim();
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80) || 'sheet';
}

function zeroPad(n, width) {
  const s = String(Math.floor(Math.max(0, n)));
  return s.length >= width ? s : '0'.repeat(width - s.length) + s;
}
