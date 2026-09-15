/** Encodes category onto BudgetItem.item without a schema change. */
export const CATEGORY_DELIM = ' — ';

export function encodeBudgetItemName(category, item) {
  const cat = String(category ?? '').trim();
  const name = String(item ?? '').trim();
  if (!cat) return name;
  if (!name) return cat;
  return `${cat}${CATEGORY_DELIM}${name}`;
}

export function decodeBudgetItemName(raw) {
  const value = String(raw ?? '');
  const idx = value.indexOf(CATEGORY_DELIM);
  if (idx === -1) return { category: '', item: value };
  return {
    category: value.slice(0, idx).trim(),
    item: value.slice(idx + CATEGORY_DELIM.length).trim(),
  };
}

export function flattenCategoriesToItems(categories) {
  return (categories ?? []).flatMap((cat) =>
    (cat?.items ?? [])
      .filter((row) => row && String(row.item ?? '').trim() && row.amount != null && row.amount !== '')
      .map((row) => {
        const quantityRaw = row.quantity;
        const quantity =
          quantityRaw == null || quantityRaw === ''
            ? undefined
            : parseInt(quantityRaw, 10);
        return {
          ...(row.id ? { id: row.id } : {}),
          item: encodeBudgetItemName(cat?.name, row.item),
          amount: Number(row.amount),
          ...(Number.isFinite(quantity) ? { quantity } : {}),
          ...(row.dollarAmount != null && row.dollarAmount !== ''
            ? { dollarAmount: Number(row.dollarAmount) }
            : {}),
        };
      }),
  );
}

export function groupItemsToCategories(items) {
  const map = new Map();
  (items ?? []).forEach((row) => {
    const { category, item } = decodeBudgetItemName(row.item);
    const key = category || '__uncategorized__';
    if (!map.has(key)) {
      map.set(key, { name: category, items: [] });
    }
    map.get(key).items.push({
      id: row.id,
      item,
      quantity: row.quantity ?? 1,
      amount: row.amount,
      dollarAmount: row.dollarAmount,
    });
  });
  const grouped = Array.from(map.values());
  return grouped.length ? grouped : [{ name: '', items: [{ quantity: 1 }] }];
}

export function displayItemLabel(raw) {
  return decodeBudgetItemName(raw).item || raw || '';
}

export function displayItemCategory(raw, fallback) {
  return decodeBudgetItemName(raw).category || fallback || '';
}

export function toBudgetWritePayload(values, { isGlobal, fallbackDepartmentId } = {}) {
  const { divisionId, categories, ...rest } = values ?? {};
  return {
    name: rest.name,
    departmentId: isGlobal ? rest.departmentId : fallbackDepartmentId,
    ...(rest.financialYearId ? { financialYearId: rest.financialYearId } : {}),
    budgetItems: flattenCategoriesToItems(categories),
  };
}
