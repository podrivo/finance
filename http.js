const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class HttpError extends Error {
  constructor(url, res) {
    super(`${url} -> HTTP ${res.status}`);
    this.status = res.status;
    const retryAfter = Number(res.headers.get('retry-after'));
    this.retryAfterMs = retryAfter > 0 ? retryAfter * 1000 : null;
  }
}

// How long to wait before the next attempt, or null when retrying won't help.
function retryDelay(err, attempt) {
  if (err instanceof HttpError) {
    if (err.retryAfterMs && (err.status === 429 || err.status === 503)) return Math.min(err.retryAfterMs, 10 * 60_000);
    if (err.status === 429) return 60_000 * (attempt + 1);
    if (err.status === 408 || err.status >= 500) return 5000 * 3 ** attempt;
    return null;
  }
  if (err.name === 'TimeoutError' || err.name === 'TypeError') return 2000 * 2 ** attempt;
  // A 200 with an HTML error page instead of JSON.
  if (err.name === 'SyntaxError') return 5000 * 3 ** attempt;
  return null;
}

export async function getJSON(url, retries) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new HttpError(url, res);
      return await res.json();
    } catch (err) {
      const delay = retryDelay(err, attempt);
      if (delay === null || attempt >= retries) throw err;
      console.error(`${url} failed (${err.message}), retrying in ${delay / 1000}s`);
      await sleep(delay);
    }
  }
}
