const STORAGE_KEY = 'cocoa-papers.hr-letter-templates';

export const TEMPLATE_KINDS = [
  { value: 'memo', label: 'Memo' },
  { value: 'letter', label: 'Any type' },
];

export const PLACEHOLDER_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'staff', label: 'Staff name' },
  { value: 'money', label: 'Amount' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

export const QUICK_PLACEHOLDERS = [
  { key: 'staff_name', label: 'Staff name', type: 'staff' },
  { key: 'amount', label: 'Amount', type: 'money' },
  { key: 'period', label: 'Period', type: 'text' },
  { key: 'start_date', label: 'Start date', type: 'date' },
  { key: 'department', label: 'Department', type: 'text' },
  { key: 'position', label: 'Position', type: 'text' },
];

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g;

function readAll() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(templates) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function guessPlaceholderType(key) {
  const name = String(key || '').toLowerCase();
  if (name.includes('amount') || name.includes('salary') || name.includes('fee')) {
    return 'money';
  }
  if (name.includes('staff') || name.endsWith('_name') || name === 'name') {
    return 'staff';
  }
  if (name.includes('date')) return 'date';
  if (name.includes('period') || name.includes('month') || name.includes('year')) {
    return 'number';
  }
  return 'text';
}

export function labelFromKey(key) {
  return String(key || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function parsePlaceholderKeys(body) {
  const keys = [];
  const seen = new Set();
  const text = String(body ?? '');
  PLACEHOLDER_RE.lastIndex = 0;
  let match = PLACEHOLDER_RE.exec(text);
  while (match) {
    const key = match[1];
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
    match = PLACEHOLDER_RE.exec(text);
  }
  return keys;
}

export function syncPlaceholders(body, previous = []) {
  const prior = new Map((previous ?? []).map((item) => [item.key, item]));
  return parsePlaceholderKeys(body).map((key) => {
    const existing = prior.get(key);
    return {
      key,
      label: existing?.label || labelFromKey(key),
      type: existing?.type || guessPlaceholderType(key),
    };
  });
}

export function listHrTemplates() {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
  );
}

export function getHrTemplate(id) {
  return readAll().find((item) => item.id === id) || null;
}

export function saveHrTemplate(template) {
  const templates = readAll();
  const now = new Date().toISOString();
  const id = template.id || crypto.randomUUID();
  const next = {
    ...template,
    id,
    kind: template.kind === 'memo' ? 'memo' : 'letter',
    placeholders:
      template.kind === 'memo'
        ? []
        : syncPlaceholders(template.body, template.placeholders),
    createdAt: template.createdAt || now,
    updatedAt: now,
  };
  const index = templates.findIndex((item) => item.id === id);
  if (index >= 0) templates[index] = next;
  else templates.unshift(next);
  writeAll(templates);
  return next;
}

export function deleteHrTemplate(id) {
  writeAll(readAll().filter((item) => item.id !== id));
}

export function insertPlaceholder(body, key) {
  const token = `{{${key}}}`;
  const current = String(body ?? '');
  if (!current.trim()) return token;
  const needsSpace = !/\s$/.test(current);
  return `${current}${needsSpace ? ' ' : ''}${token}`;
}
