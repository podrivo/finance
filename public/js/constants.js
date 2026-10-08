export const ELECTIONS = ['1989-11', '1994-10', '1998-10', '2002-10', '2006-10', '2010-10', '2014-10', '2018-10', '2022-10', '2026-10'];
export const STEPS = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
export const MONTH_STEPS = [1, 3, 6, 12];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const percent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const MIN_GAP = 48; // px between time labels
export const LABEL_WIDTH = 1280; // px; wider screens show the same time labels as this width, spaced further apart
export const MIN_SPAN = 6; // months

export const PALETTES = {
  light: { line: '#171717', zero: '#ccc', election: '#e8e8e8', year: '#e0e0e0', month: '#efefef' },
  dark: { line: '#ededed', zero: '#444', election: '#262626', year: '#2e2e2e', month: '#1a1a1a' },
};
