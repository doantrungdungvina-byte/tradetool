export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGETS = [
  ["GA Excel Dashboard", "https://ga-excel-dashboard.vercel.app/"],
  ["TradeTool Delta", "https://tradetool-delta.vercel.app/"],
  ["Ra Quyết Định", "https://raquyetdinh-sooty.vercel.app/"],
  ["XAUUSD", "https://xauusd-c9qb.vercel.app/"],
  ["Đố Vui", "https://dovui-nu.vercel.app/"],
  ["Quay Số", "https://quayso-three.vercel.app/"],
  ["Phúc Thọa", "https://phucthoa.vercel.app/"],
  ["Vigo", "https://vigo-psi-red.vercel.app/"],
  ["CLB Dinh Dưỡng", "https://clbdinhduong.vercel.app/"],
  ["Nhà Đất", "https://nhadat-delta.vercel.app/"],
  ["Nhà Trọ BH", "https://nhatrobh.vercel.app/"],
  ["Thúy Nga", "https://thuynga-seven.vercel.app/"],
];

async function checkTarget([name, url]) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": "TradeTool-Uptime-Keeper/1.0" },
    });
    return {
      name, url, ok: response.ok, status: response.status,
      responseMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name, url, ok: false, status: null,
      error: error?.name === "AbortError" ? "Timeout after 20 seconds" : (error?.message || "Request failed"),
      responseMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.all(TARGETS.map(checkTarget));
  const summary = {
    checkedAt: new Date().toISOString(),
    total: results.length,
    online: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
  console.log("[uptime-keeper]", JSON.stringify(summary));
  return Response.json(summary, {
    status: summary.failed ? 207 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
