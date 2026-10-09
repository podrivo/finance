export const PLANO_REAL = '1994-07';
// Presidential elections, by the month of the deciding round. Also shown as events.
export const ELECTIONS = [
  { date: '1994-10', label: 'Eleição de FHC' },
  { date: '1998-10', label: 'Reeleição de FHC' },
  { date: '2002-10', label: 'Eleição de Lula' },
  { date: '2006-10', label: 'Reeleição de Lula' },
  { date: '2010-10', label: 'Eleição de Dilma' },
  { date: '2014-10', label: 'Reeleição de Dilma' },
  { date: '2018-10', label: 'Eleição de Bolsonaro' },
  { date: '2022-10', label: 'Eleição de Lula' },
  { date: '2026-10', label: 'Eleição presidencial' },
];
// Events that moved inflation or the Selic, by the month they happened.
export const EVENTS = [
  { date: '1994-07', label: 'Plano Real' },
  { date: '1994-12', label: 'Crise do México' },
  { date: '1997-10', label: 'Crise asiática' },
  { date: '1998-08', label: 'Moratória russa' },
  { date: '1999-01', label: 'Câmbio flutuante' },
  { date: '1999-06', label: 'Metas de inflação' },
  { date: '2001-06', label: 'Racionamento de energia' },
  { date: '2005-06', label: 'Mensalão' },
  { date: '2008-09', label: 'Quebra do Lehman Brothers' },
  { date: '2016-08', label: 'Impeachment de Dilma' },
  { date: '2016-12', label: 'Teto de gastos' },
  { date: '2017-05', label: 'Joesley Day' },
  { date: '2018-05', label: 'Greve dos caminhoneiros' },
  { date: '2020-03', label: 'Pandemia de covid-19' },
  { date: '2021-02', label: 'Autonomia do Banco Central' },
  { date: '2022-02', label: 'Invasão da Ucrânia' },
  { date: '2023-08', label: 'Arcabouço fiscal' },
];
export const EVENT_SNAP = 8; // px within which the crosshair jumps to an event's month
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
  light: { ipca: '#f0541f', selic: '#6665ff', selicTarget: '#6665ff', zero: '#cbcbd2', election: '#e6e6eb', event: '#a3a2ab', year: '#dddde3', month: '#ededf1' },
  dark: { ipca: '#ff6534', selic: '#6665ff', selicTarget: '#6665ff', zero: '#34343d', election: '#141419', event: '#5e5d66', year: '#1c1c23', month: '#0f0f13' },
};
