export const formatMoney = (str) =>
  new Intl.NumberFormat('en-us', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(str);
