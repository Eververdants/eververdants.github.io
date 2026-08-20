export interface CategoryDef {
  id: string;
  label: string;
  labelZh: string;
}

export const categories: CategoryDef[] = [
  { id: "LANDSCAPE", label: "Landscape", labelZh: "山岳" },
  { id: "ARCHITECTURE", label: "Architecture", labelZh: "建筑" },
  { id: "MEMORIAL", label: "Memorial", labelZh: "纪念" },
  { id: "TRAVEL", label: "Travel", labelZh: "行旅" },
  { id: "STREET", label: "Street", labelZh: "街巷" },
  { id: "PORTRAIT", label: "Portrait", labelZh: "人像" },
  { id: "MACRO", label: "Macro", labelZh: "微距" },
  { id: "MONOCHROME", label: "Monochrome", labelZh: "黑白" },
];

export const categoryById: Record<string, CategoryDef> = Object.fromEntries(
  categories.map((c) => [c.id, c])
);
