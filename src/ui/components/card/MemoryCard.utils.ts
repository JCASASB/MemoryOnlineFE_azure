export const getBackColor = (value: number): string => {
  if (value <= 3) return "#e8f5e9"; // verde claro
  if (value <= 6) return "#fff3e0"; // naranja claro
  if (value <= 9) return "#e3f2fd"; // azul claro
  return "#f3e5f5"; // morado claro
};

export const getSquareColor = (value: number): string => {
  if (value <= 3) return "#2e7d32";
  if (value <= 6) return "#ef6c00";
  if (value <= 9) return "#1565c0";
  return "#6a1b9a";
};
