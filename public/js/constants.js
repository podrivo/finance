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
// Every line is plotted from its `monthly` field; `tooltip` names the field the tooltip shows instead.
// `step` lines only change at discrete decisions, so they're drawn as steps instead of curves.
export const LINES = [
  { key: 'ipca', label: 'IPCA', url: '/api/ipca' },
  { key: 'selic', label: 'Selic', url: '/api/selic' },
  { key: 'selicTarget', label: 'Meta Selic', url: '/api/selic-target', tooltip: 'target', step: true, dash: [4, 4] },
];

export const PALETTES = {
  light: { ipca: '#f0541f', selic: '#6665ff', selicTarget: '#6665ff', zero: '#cbcbd2', election: '#e6e6eb', year: '#dddde3', month: '#ededf1' },
  dark: { ipca: '#ff6534', selic: '#6665ff', selicTarget: '#6665ff', zero: '#34343d', election: '#141419', year: '#1c1c23', month: '#0f0f13' },
};
