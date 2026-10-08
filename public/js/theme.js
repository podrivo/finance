import { PALETTES } from './constants.js';
import { themeButton } from './dom.js';
import { invalidate } from './render.js';
import { state } from './state.js';

// Two visible states over three stored ones: no override follows the OS, and toggling
// stores an override only when it differs from the OS, so toggling back clears it.
// An OS change never clears an override, even when they come to match.
// The stored override is applied by an inline script in index.html, before first paint.
const THEME_KEY = 'ipca:theme';
const root = document.documentElement;
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const systemTheme = () => (systemDark.matches ? 'dark' : 'light');
const currentTheme = () => root.dataset.theme ?? systemTheme();

function applyTheme() {
  const theme = currentTheme();
  state.palette = PALETTES[theme];
  const next = theme === 'dark' ? 'light' : 'dark';
  themeButton.title = `Switch to ${next} theme (M)`;
  themeButton.setAttribute('aria-label', `Switch to ${next} theme`);
  themeButton.querySelectorAll('svg').forEach((svg) => (svg.style.display = svg.dataset.icon === theme ? '' : 'none'));
  if (state.view) invalidate();
}

function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  if (next === systemTheme()) delete root.dataset.theme;
  else root.dataset.theme = next;
  try {
    if (root.dataset.theme) localStorage.setItem(THEME_KEY, next);
    else localStorage.removeItem(THEME_KEY);
  } catch {}
  applyTheme();
}

applyTheme();
systemDark.addEventListener('change', applyTheme);
themeButton.addEventListener('click', toggleTheme);
addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 'm' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
  toggleTheme();
});
