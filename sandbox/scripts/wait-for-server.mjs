// Waits until the sandbox server answers /api/health so Vite's proxy doesn't log
// ECONNREFUSED while the server is still starting. Gives up after 60s and lets Vite start anyway.

const url = `http://127.0.0.1:${process.env.PORT ?? 3100}/api/health`;
const deadline = Date.now() + 60_000;

while (Date.now() < deadline) {
  try {
    const res = await fetch(url);
    if (res.ok) process.exit(0);
  } catch {
    // server not listening yet
  }
  await new Promise((resolve) => setTimeout(resolve, 300));
}

console.warn(`[web] ${url} did not respond within 60s; starting the UI anyway.`);
