const SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export const fmtMonthYearShort = (d: string): string => {
  if (!d) return "";
  const [y, m] = d.split("-");
  if (m && SHORT[Number(m) - 1]) return `${SHORT[Number(m) - 1]} ${y}`;
  return y || d;
};

export const fmtMonthYearLong = (d: string): string => {
  if (!d) return "";
  const [y, m] = d.split("-");
  if (m && LONG[Number(m) - 1]) return `${LONG[Number(m) - 1]} ${y}`;
  return y || d;
};
