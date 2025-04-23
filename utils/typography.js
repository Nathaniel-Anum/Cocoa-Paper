export const formatMoney = (str) =>
  new Intl.NumberFormat('en-us', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(str);

export const capitalize = (str) => {
  if (str) {
    const arr = str.toLowerCase().split(' ');

    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }

    return arr.join(' ');
  }
};
