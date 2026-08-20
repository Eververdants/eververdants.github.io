import type { Lang } from "./i18n";

const EN_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const EN_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export const fmtMonthYearShort = (d: string, lang: Lang): string => {
  if (!d) return "";
  const [y, m] = d.split("-");
  if (lang === "zh" && m && EN_SHORT[Number(m) - 1]) return `${y}.${m}`;
  if (m && EN_SHORT[Number(m) - 1]) return `${EN_SHORT[Number(m) - 1]} ${y}`;
  return y || d;
};

export const fmtMonthYearLong = (d: string, lang: Lang): string => {
  if (!d) return "";
  const [y, m] = d.split("-");
  if (lang === "zh" && m && EN_LONG[Number(m) - 1])
    return `${y} 年 ${Number(m)} 月`;
  if (m && EN_LONG[Number(m) - 1]) return `${EN_LONG[Number(m) - 1]} ${y}`;
  return y || d;
};
