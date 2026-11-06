// Vercel serverless function: forwards allowed requests to TMDB and adds the secret key server-side.
// Set TMDB_KEY (no VITE_ prefix) in Vercel > Project Settings > Environment Variables.

const ALLOWED = [
  /^\/trending\/movie\/week$/,
  /^\/movie\/top_rated$/,
  /^\/discover\/movie$/,
  /^\/search\/movie$/,
  /^\/movie\/\d+$/,
];

export default async function handler(req, res) {
  const key = process.env.TMDB_KEY;
  if (!key) {
    return res.status(500).json({ error: "TMDB_KEY is not set on the server" });
  }

  const { path, ...rest } = req.query;
  if (typeof path !== "string" || !ALLOWED.some((re) => re.test(path))) {
    return res.status(400).json({ error: "Path not allowed" });
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(rest)) {
    if (k === "api_key") continue; // never accept a key from the client
    params.set(k, Array.isArray(v) ? v[0] : v);
  }
  params.set("api_key", key);

  try {
    const upstream = await fetch(`https://api.themoviedb.org/3${path}?${params}`);
    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(upstream.status).json(data);
  } catch {
    return res.status(502).json({ error: "Upstream request failed" });
  }
}
