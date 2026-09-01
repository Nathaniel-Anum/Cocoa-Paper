import { capitalize } from '../../../../utils/typography';

function normalizeItemName(item) {
  return (item?.item ?? item?.name ?? '').trim().toLowerCase();
}

export function compareBudgetVersions(budgetA, budgetB) {
  const itemsA = budgetA?.budgetItems ?? [];
  const itemsB = budgetB?.budgetItems ?? [];

  const mapA = new Map(itemsA.map((item) => [normalizeItemName(item), item]));
  const mapB = new Map(itemsB.map((item) => [normalizeItemName(item), item]));
  const keys = new Set([...mapA.keys(), ...mapB.keys()].filter(Boolean));

  const rows = [];
  const summary = { new: 0, increased: 0, reduced: 0, removed: 0, unchanged: 0 };

  keys.forEach((key) => {
    const a = mapA.get(key);
    const b = mapB.get(key);
    const amountA = a?.amount ?? null;
    const amountB = b?.amount ?? null;

    let type = 'unchanged';
    if (a && !b) type = 'removed';
    else if (!a && b) type = 'new';
    else if ((amountB ?? 0) > (amountA ?? 0)) type = 'increased';
    else if ((amountB ?? 0) < (amountA ?? 0)) type = 'reduced';

    summary[type] += 1;

    const diff =
      amountA === null || amountB === null ? amountB ?? -amountA ?? 0 : amountB - amountA;
    const pctChange =
      amountA && amountA !== 0 && amountB !== null ? ((amountB - amountA) / amountA) * 100 : null;

    rows.push({
      key,
      item: b?.item ?? a?.item ?? key,
      amountA,
      amountB,
      diff,
      pctChange,
      type,
    });
  });

  const totalA = itemsA.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const totalB = itemsB.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const diff = totalB - totalA;

  return {
    rows,
    summary,
    totals: {
      amountA: totalA,
      amountB: totalB,
      diff,
      pctChange: totalA ? (diff / totalA) * 100 : null,
    },
    versionA: {
      label: budgetA?.version ? `v${budgetA.version}` : budgetA?.status ?? 'Base',
      budget: budgetA,
    },
    versionB: {
      label: budgetB?.version ? `v${budgetB.version}` : budgetB?.status ?? 'Compare',
      budget: budgetB,
    },
    department: budgetA?.department ?? budgetB?.department,
  };
}

export function versionLabel(budget) {
  if (!budget) return '?';
  const status = capitalize(budget.status ?? 'Draft');
  const updated = budget.updatedAt
    ? new Date(budget.updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : '';
  return `${budget.version ? `v${budget.version}` : status}${updated ? ` (${updated})` : ''}`;
}
