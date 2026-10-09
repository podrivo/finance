const $ = (id) => document.getElementById(id);

export const chart = $('chart');
export const canvas = chart.querySelector('canvas');
export const ctx = canvas.getContext('2d');
export const labels = $('labels');
export const crosshair = $('crosshair');
export const vline = $('vline');
export const legend = $('legend');
export const selection = $('selection');
export const tooltip = $('tooltip');
export const controls = $('controls');
export const rangeButtons = document.querySelectorAll('#ranges button');
export const themeButton = $('theme');
export const modeButton = $('mode');
export const infoButton = $('info');
