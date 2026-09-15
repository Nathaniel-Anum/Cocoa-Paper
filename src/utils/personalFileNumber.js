export const PERSONAL_FILE_PREFIX = 'PRS';

export function normalizeVolume(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return '';
  const volume = /^\d+$/.test(raw) ? `V${raw}` : raw;
  return /^V\d+$/.test(volume) ? volume : '';
}

export function formatPersonalFileNumber(
  departmentCode,
  personalFileNumber,
  sequence,
  volume,
) {
  const code = String(departmentCode || '').trim().toUpperCase();
  const person = String(personalFileNumber || '').trim();
  const seq = Number(sequence);
  const vol = normalizeVolume(volume);
  if (!code || !person || !vol || !Number.isFinite(seq) || seq < 1) return '';
  return `${PERSONAL_FILE_PREFIX}/${code}/${person}/${vol}/${seq}`;
}

export function staffFileLabel(person) {
  const name = person?.name || 'Unknown';
  const emp = person?.staff?.staffNumber || '—';
  const code = String(person?.department?.departmentCode || '').trim();
  const pf = String(person?.staff?.personalFileNumber || '').trim();
  const next = person?.staff?.nextDocumentNo ?? 1;
  return [
    name,
    `staff ID ${emp}`,
    code ? `dept ${code}` : 'dept code missing',
    pf ? `file ${pf}` : 'no personal file number',
    `next letter ${next}`,
  ].join(' — ');
}

export function staffFileIssueHint(person) {
  const missing = [];
  if (!String(person?.staff?.personalFileNumber || '').trim()) {
    missing.push('personal file number on the staff record');
  }
  if (!String(person?.department?.departmentCode || '').trim()) {
    missing.push('department code in Back Office → Department');
  }
  if (!missing.length) return '';
  return `Cannot issue a file number yet. Add ${missing.join(' and ')}.`;
}

export function previewPersonalFileNumber(person, volume) {
  return formatPersonalFileNumber(
    person?.department?.departmentCode,
    person?.staff?.personalFileNumber,
    person?.staff?.nextDocumentNo ?? 1,
    volume,
  );
}

export function canIssuePersonalFile(person) {
  return Boolean(
    person?.staff?.personalFileNumber && person?.department?.departmentCode,
  );
}
