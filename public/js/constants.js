export const ELECTIONS = ['1989-11', '1994-10', '1998-10', '2002-10', '2006-10', '2010-10', '2014-10', '2018-10', '2022-10', '2026-10'];
export const STEPS = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
export const MONTH_STEPS = [1, 3, 6, 12];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const percent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const MIN_GAP = 48; // px between time labels
export const LABEL_WIDTH = 1280; // px; wider screens show the same time labels as this width, spaced further apart
export const MIN_SPAN = 6; // months
export const HOLD = 300; // ms a finger must stay still before it scrubs instead of panning
export const TAP_SLOP = 8; // px a finger can drift and still count as still
export const DOUBLE_TAP = 300; // ms

// In tooltip order; drawn in reverse so IPCA stays on top.
export const LINES = [
  { key: 'ipca', label: 'IPCA', url: '/api/ipca' },
  { key: 'selic', label: 'Selic', url: '/api/selic' },
];

export const PALETTES = {
  light: { ipca: '#c08f03', selic: '#8b5dce', zero: '#cbcac4', election: '#e4e3dd', year: '#dcdbd5', month: '#ebeae5' },
  dark: { ipca: '#ffc53d', selic: '#b688ff', zero: '#4b4a45', election: '#34332f', year: '#3a3934', month: '#2f2e2a' },
};
