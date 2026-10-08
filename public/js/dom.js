const $ = (id) => document.getElementById(id);

export const chart = $('chart');
export const canvas = chart.querySelector('canvas');
export const ctx = canvas.getContext('2d');
export const labels = $('labels');
export const crosshair = $('crosshair');
export const vline = $('vline');
export const hline = $('hline');
export const dot = $('dot');
export const selection = $('selection');
export const tooltip = $('tooltip');
export const controls = $('controls');
export const rangeButtons = document.querySelectorAll('#ranges button');
export const themeButton = $('theme');
