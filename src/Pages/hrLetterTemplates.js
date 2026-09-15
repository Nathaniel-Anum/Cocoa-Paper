import { jsPDF } from 'jspdf';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import cocoaLetterheadUrl from '../assets/letterheads/cocoa-letterhead.pdf?url';
import memoFormUrl from '../assets/letterheads/memo-form.pdf?url';

const BROWN = [88, 47, 8];
const SECONDARY = [157, 77, 1];
const INK = [32, 27, 23];
const MUTED = [122, 104, 89];

export function formatHrMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'GHS 0.00';
  return `GHS ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLetterDate(date = new Date()) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function drawLetterhead(doc, subtitle) {
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BROWN);
  doc.rect(0, 0, width, 28, 'F');
  doc.setTextColor(255, 244, 232);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GHANA COCOA BOARD', width / 2, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, width / 2, 20, { align: 'center' });
  doc.setDrawColor(...SECONDARY);
  doc.setLineWidth(1.1);
  doc.line(18, 34, width - 18, 34);
}

function drawMemoLetterhead(doc) {
  const width = doc.internal.pageSize.getWidth();
  const left = 12;
  const right = width - 12;
  const top = 10;
  const drop = 9;

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(1.5);
  doc.line(left, top, right, top);
  doc.line(left, top, left, top + drop);
  doc.line(right, top, right, top + drop);

  doc.setLineWidth(0.45);
  doc.line(left + 2.4, top + 2.3, right - 2.4, top + 2.3);
  doc.line(left + 2.4, top + 2.3, left + 2.4, top + drop);
  doc.line(right - 2.4, top + 2.3, right - 2.4, top + drop);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BROWN);
  doc.text('GHANA COCOA BOARD', width / 2, 28, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('HUMAN RESOURCE DEPARTMENT', width / 2, 34, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text('INTERNAL MEMORANDUM', width / 2, 42, { align: 'center' });

  doc.setDrawColor(...BROWN);
  doc.setLineWidth(1.5);
  doc.line(left, 47, right, 47);
  doc.setLineWidth(0.45);
  doc.line(left, 49.4, right, 49.4);
}

function writeWrapped(doc, text, x, y, maxWidth, lineHeight = 6) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSignOff(doc, y, senderName) {
  const width = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('Yours faithfully,', 18, y);
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.text(senderName || 'Human Resource Department', 18, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Human Resource Operations', 18, y);
  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.4);
  doc.line(18, 285, width - 18, 285);
  doc.setFontSize(8);
  doc.text('Generated from Cocoa Papers · HR Operations', width / 2, 291, {
    align: 'center',
  });
}

function addMemoSignOff(doc, y, senderName) {
  const width = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('Thank you.', 18, y);
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.text(senderName || 'Human Resource Department', 18, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Human Resource Operations', 18, y);
  doc.setDrawColor(...BROWN);
  doc.setLineWidth(0.4);
  doc.line(18, 285, width - 18, 285);
  doc.setFontSize(8);
  doc.text('Generated from Cocoa Papers · HR Operations', width / 2, 291, {
    align: 'center',
  });
}

function toPdfFile(doc, filename) {
  const blob = doc.output('blob');
  return {
    blob,
    filename,
    file: new File([blob], filename, { type: 'application/pdf' }),
  };
}

export function buildCarLoanLetter({
  recipientName,
  employeeName,
  amount,
  senderName,
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  drawLetterhead(doc, 'Human Resource Operations');

  let y = 46;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(formatLetterDate(), width - 18, y, { align: 'right' });
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(recipientName || 'Recipient', 18, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Recipient', 18, y);
  y += 12;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.text('Dear Sir / Madam,', 18, y);
  y += 10;
  doc.setFontSize(12);
  doc.text('RE: CAR LOAN', 18, y);
  doc.setDrawColor(...SECONDARY);
  doc.line(18, y + 2, 52, y + 2);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  y = writeWrapped(
    doc,
    `This letter confirms that a car loan has been processed for ${employeeName || 'the named staff member'} in the sum of ${formatHrMoney(amount)}.`,
    18,
    y,
    width - 36,
  );
  y += 4;
  y = writeWrapped(
    doc,
    'Kindly treat this correspondence as the official Human Resource record of the approved facility. Any variation to the amount or beneficiary named herein must be authorised in writing by Human Resource Operations.',
    18,
    y,
    width - 36,
  );
  y += 10;
  doc.setFillColor(253, 241, 235);
  doc.roundedRect(18, y, width - 36, 28, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...SECONDARY);
  doc.text('LOAN SUMMARY', 24, y + 8);
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(`Staff: ${employeeName || '—'}`, 24, y + 16);
  doc.text(`Amount: ${formatHrMoney(amount)}`, 24, y + 23);
  y += 42;
  addSignOff(doc, y, senderName);
  const safeName = (employeeName || 'staff').replace(/[^\w.-]+/g, '_');
  return toPdfFile(doc, `HR_Car_Loan_${safeName}.pdf`);
}

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

export function formatHrPeriod(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (unit === 'years' || unit === 'year') {
    return `${n} ${pluralize(n, 'year', 'years')}`;
  }
  return `${n} ${pluralize(n, 'month', 'months')}`;
}

export function formatHrPeriodSummary(value, unit) {
  const primary = formatHrPeriod(value, unit);
  if (primary === '—') return '—';
  const n = Number(value);
  if (unit === 'years' || unit === 'year') {
    const months = n * 12;
    return `${primary} (${months} ${pluralize(months, 'month', 'months')})`;
  }
  if (n % 12 === 0) {
    const years = n / 12;
    return `${primary} (${years} ${pluralize(years, 'year', 'years')})`;
  }
  return primary;
}

export function buildContractLetter({
  recipientName,
  parties,
  partyOne,
  partyTwo,
  amount,
  periodValue,
  periodUnit,
  senderName,
}) {
  const named = String(
    recipientName || parties?.[0] || partyOne || partyTwo || '',
  ).trim();
  const periodText = formatHrPeriod(periodValue, periodUnit);
  const periodSummary = formatHrPeriodSummary(periodValue, periodUnit);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  drawLetterhead(doc, 'Human Resource Operations');

  let y = 46;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(formatLetterDate(), width - 18, y, { align: 'right' });
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(named || 'Recipient', 18, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Recipient', 18, y);
  y += 12;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.text('Dear Sir / Madam,', 18, y);
  y += 10;
  doc.setFontSize(12);
  doc.text('RE: CONTRACT', 18, y);
  doc.setDrawColor(...SECONDARY);
  doc.line(18, y + 2, 58, y + 2);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const periodClause =
    periodText === '—' ? '' : `, for a period of ${periodText}`;
  y = writeWrapped(
    doc,
    `This contract is made with ${named || 'the named party'} for the agreed amount of ${formatHrMoney(amount)}${periodClause}.`,
    18,
    y,
    width - 36,
  );
  y += 4;
  y = writeWrapped(
    doc,
    'The party named in this letter acknowledges the amount and period stated below as the terms of this engagement. This document may be used as the Human Resource record of the engagement until a further instrument is issued.',
    18,
    y,
    width - 36,
  );
  y += 10;
  const boxHeight = 36;
  doc.setFillColor(253, 241, 235);
  doc.roundedRect(18, y, width - 36, boxHeight, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...SECONDARY);
  doc.text('CONTRACT SUMMARY', 24, y + 8);
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(`Name: ${named || '—'}`, 24, y + 16);
  doc.text(`Amount: ${formatHrMoney(amount)}`, 24, y + 23);
  doc.text(`Period: ${periodSummary}`, 24, y + 30);
  y += boxHeight + 14;
  addSignOff(doc, y, senderName);
  const safe = (named || 'party').replace(/[^\w.-]+/g, '_');
  return toPdfFile(doc, `HR_Contract_${safe}.pdf`);
}

export function buildHrLetterPdf(values) {
  if (values.letterType === 'carLoan') {
    return buildCarLoanLetter(values);
  }
  return buildContractLetter(values);
}

export function fillPlaceholderBody(body, values = {}) {
  return String(body ?? '').replace(
    /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*\}\}/g,
    (_, key) => {
      const value = values[key];
      if (value == null || String(value).trim() === '') return '—';
      return String(value);
    },
  );
}

const INK_RGB = rgb(0.12, 0.08, 0.06);
const LETTER_PAGE = { width: 595.32, height: 841.92 };
const LETTERHEAD = {
  quoteX: 140,
  dateX: 456,
  fieldY: 646,
  fieldHeight: 13,
  quoteWipeX: 138,
  quoteWipeW: 132,
  dateWipeX: 454,
  dateWipeW: 122,
  bodyX: 54,
  bodyMaxWidth: 487,
  firstBodyY: 580,
  nextBodyY: 780,
  minY: 72,
};
const MEMOHEAD = {
  bodyX: 54,
  bodyMaxWidth: 470,
  toY: 680,
  fromY: 662,
  dateY: 644,
  subjectY: 626,
  firstBodyY: 600,
  nextBodyY: 760,
  minY: 72,
  valueX: 110,
};

function printable(text) {
  return String(text ?? '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, ' ');
}

function wrapPdfText(text, font, size, maxWidth) {
  const words = printable(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
      return;
    }
    if (line) lines.push(line);
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      line = word;
      return;
    }
    let chunk = '';
    Array.from(word).forEach((char) => {
      const trial = chunk + char;
      if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
        chunk = trial;
      } else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    });
    line = chunk;
  });
  if (line) lines.push(line);
  return lines;
}

async function loadStationery(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not load the official letterhead');
  }
  return PDFDocument.load(await response.arrayBuffer(), { ignoreEncryption: true });
}

export async function buildHrMergeLetter({
  title,
  body,
  values,
  senderName,
  filename,
  kind = 'letter',
  fileNumber,
}) {
  const isMemo = kind === 'memo';
  const filled = fillPlaceholderBody(body, {
    ...values,
    file_number: fileNumber || values.file_number,
  });
  const recipient = values.staff_name || values.name || values.recipient;
  const letterDate = formatLetterDate();
  const template = await loadStationery(isMemo ? memoFormUrl : cocoaLetterheadUrl);
  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.TimesRoman);
  const bold = await out.embedFont(StandardFonts.TimesRomanBold);
  const italic = await out.embedFont(StandardFonts.TimesRomanItalic);

  const copyTemplatePage = async (index = 0) => {
    const pageIndex = Math.min(index, template.getPageCount() - 1);
    const [copied] = await out.copyPages(template, [pageIndex]);
    out.addPage(copied);
    return copied;
  };

  let page = await copyTemplatePage(0);
  const size = 12;
  const lineHeight = 16;
  const layout = isMemo ? MEMOHEAD : LETTERHEAD;
  let y = isMemo ? MEMOHEAD.firstBodyY : LETTERHEAD.firstBodyY;

  const newPage = async () => {
    if (isMemo && template.getPageCount() > 1) {
      page = await copyTemplatePage(1);
      y = MEMOHEAD.nextBodyY;
    } else if (isMemo) {
      page = await copyTemplatePage(0);
      y = MEMOHEAD.nextBodyY;
    } else {
      page = out.addPage([LETTER_PAGE.width, LETTER_PAGE.height]);
      y = LETTERHEAD.nextBodyY;
    }
  };

  const ensureSpace = async (needed = lineHeight) => {
    if (y < layout.minY + needed) {
      await newPage();
    }
  };

  const drawLines = async (lines, { x = layout.bodyX, font: usedFont = font, size: usedSize = size } = {}) => {
    for (const line of lines) {
      await ensureSpace();
      page.drawText(line, {
        x,
        y,
        size: usedSize,
        font: usedFont,
        color: INK_RGB,
      });
      y -= lineHeight;
    }
  };

  if (isMemo) {
    const valueX = MEMOHEAD.valueX;
    page.drawText('To:', { x: MEMOHEAD.bodyX, y: MEMOHEAD.toY, size, font: bold, color: INK_RGB });
    page.drawText(printable(recipient || '—'), { x: valueX, y: MEMOHEAD.toY, size, font, color: INK_RGB });
    page.drawText('From:', { x: MEMOHEAD.bodyX, y: MEMOHEAD.fromY, size, font: bold, color: INK_RGB });
    page.drawText(printable(senderName || 'Human Resource Department'), {
      x: valueX,
      y: MEMOHEAD.fromY,
      size,
      font,
      color: INK_RGB,
    });
    page.drawText('Date:', { x: MEMOHEAD.bodyX, y: MEMOHEAD.dateY, size, font: bold, color: INK_RGB });
    page.drawText(letterDate, { x: valueX, y: MEMOHEAD.dateY, size, font, color: INK_RGB });
    page.drawText('Subject:', { x: MEMOHEAD.bodyX, y: MEMOHEAD.subjectY, size, font: bold, color: INK_RGB });
    const subjectLines = wrapPdfText(title || '—', font, size, MEMOHEAD.bodyMaxWidth - (valueX - MEMOHEAD.bodyX));
    page.drawText(subjectLines[0] || '—', { x: valueX, y: MEMOHEAD.subjectY, size, font, color: INK_RGB });
    y = MEMOHEAD.subjectY - lineHeight;
    if (subjectLines.length > 1) {
      await drawLines(subjectLines.slice(1), { x: valueX });
    }
    y -= 8;
  } else {
    page.drawRectangle({
      x: LETTERHEAD.quoteWipeX,
      y: LETTERHEAD.fieldY - 4,
      width: LETTERHEAD.quoteWipeW,
      height: LETTERHEAD.fieldHeight,
      color: rgb(1, 1, 1),
    });
    page.drawRectangle({
      x: LETTERHEAD.dateWipeX,
      y: LETTERHEAD.fieldY - 4,
      width: LETTERHEAD.dateWipeW,
      height: LETTERHEAD.fieldHeight,
      color: rgb(1, 1, 1),
    });
    if (fileNumber) {
      const quote = printable(fileNumber);
      const quoteSize = bold.widthOfTextAtSize(quote, 10) <= 128 ? 10 : 8;
      page.drawText(quote, {
        x: LETTERHEAD.quoteX,
        y: LETTERHEAD.fieldY,
        size: quoteSize,
        font: bold,
        color: INK_RGB,
      });
    }
    page.drawText(letterDate, {
      x: LETTERHEAD.dateX,
      y: LETTERHEAD.fieldY,
      size: 10,
      font,
      color: INK_RGB,
    });
    if (recipient) {
      await drawLines([printable(recipient)], { font: bold });
      y -= 4;
    }
    await drawLines(['Dear Sir / Madam,'], { font: italic });
    y -= 4;
    if (title) {
      await drawLines([`RE: ${printable(title)}`], { font: bold });
      y -= 6;
    }
  }

  const paragraphs = filled
    .split(/\n{2,}/)
    .map((part) => part.replace(/\n/g, ' ').trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    const lines = wrapPdfText(paragraph, font, size, layout.bodyMaxWidth);
    await drawLines(lines);
    y -= 6;
  }

  y -= 8;
  await ensureSpace(lineHeight * 4);
  if (isMemo) {
    await drawLines(['Thank you.']);
  } else {
    await drawLines(['Yours faithfully,']);
  }
  y -= 18;
  await drawLines([printable(senderName || 'Human Resource Department')], { font: bold });
  await drawLines(['Human Resource Operations'], { size: 11 });

  const label = recipient || title || (isMemo ? 'memo' : 'letter');
  const safe = String(label).replace(/[^\w.-]+/g, '_');
  const prefix = isMemo ? 'HR_Memo' : 'HR';
  const numberSafe = fileNumber ? `_${String(fileNumber).replace(/[^\w.-]+/g, '_')}` : '';
  const outName = filename || `${prefix}_${safe}${numberSafe}.pdf`;
  const bytes = await out.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  return {
    blob,
    filename: outName,
    file: new File([bytes], outName, { type: 'application/pdf' }),
  };
}
