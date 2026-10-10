const reportsByIp = new Map();
const REPORT_WINDOW_MS = 60_000;
const MAX_REPORTS_PER_WINDOW = 5;

function redact(value, limit) {
  return String(value || "")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [redacted]")
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[token]")
    .replace(/(password|access[_-]?token|refresh[_-]?token|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]")
    .slice(0, limit);
}

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const origin = req.headers.origin;
  if (origin !== "https://fullygoverned.co.uk" && origin !== "https://www.fullygoverned.co.uk") {
    return res.status(403).end();
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > 12_000) return res.status(413).end();

  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = typeof forwardedFor === "string" ? forwardedFor.split(",")[0] : "unknown";
  const now = Date.now();
  if (reportsByIp.size > 256) {
    for (const [key, value] of reportsByIp) {
      if (value.startedAt + REPORT_WINDOW_MS <= now) reportsByIp.delete(key);
    }
  }
  const bucket = reportsByIp.get(ip);
  if (bucket && bucket.startedAt + REPORT_WINDOW_MS > now && bucket.count >= MAX_REPORTS_PER_WINDOW) {
    return res.status(429).end();
  }
  if (!bucket || bucket.startedAt + REPORT_WINDOW_MS <= now) {
    reportsByIp.set(ip, { startedAt: now, count: 1 });
  } else {
    bucket.count += 1;
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const report = {
    route: typeof body.route === "string" && body.route.startsWith("/") ? body.route.split("?")[0].slice(0, 200) : "/unknown",
    name: redact(body.name, 100),
    message: redact(body.message, 500),
    stack: redact(body.stack, 5000),
    componentStack: redact(body.componentStack, 5000),
    timestamp: new Date(now).toISOString(),
  };

  console.error("[client-error-report]", JSON.stringify(report));
  return res.status(204).end();
}
