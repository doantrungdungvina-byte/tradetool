import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "FPT").trim().toUpperCase();
  const range = searchParams.get("range") || "3mo";
  const allowedRanges = new Set(["1mo", "3mo", "6mo", "1y"]);
  if (!/^[A-Z0-9]{2,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Mã cổ phiếu không hợp lệ." }, { status: 400 });
  }
  if (!allowedRanges.has(range)) {
    return NextResponse.json({ error: "Khoảng thời gian không hợp lệ." }, { status: 400 });
  }

  const yahooSymbol = `${symbol}.VN`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=1d&events=history`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 TradingTools/1.0", Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`Nguồn dữ liệu trả HTTP ${response.status}.`);
    const payload = await response.json();
    const result = payload?.chart?.result?.[0];
    const quote = result?.indicators?.quote?.[0];
    if (!result?.timestamp?.length || !quote) {
      throw new Error(`Không tìm thấy dữ liệu khối lượng cho mã ${symbol}.`);
    }
    const rows = result.timestamp.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().slice(0, 10),
      open: quote.open?.[i] ?? null,
      high: quote.high?.[i] ?? null,
      low: quote.low?.[i] ?? null,
      close: quote.close?.[i] ?? null,
      volume: quote.volume?.[i] ?? null,
    })).filter(r => Number.isFinite(r.close) && Number.isFinite(r.volume) && r.volume >= 0)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!rows.length) throw new Error(`Nguồn không trả khối lượng hợp lệ cho ${symbol}.`);

    const last = rows.at(-1);
    const prev = rows.length > 1 ? rows.at(-2) : null;
    const avg20Rows = rows.slice(-20);
    const avgVolume20 = avg20Rows.reduce((sum, r) => sum + r.volume, 0) / avg20Rows.length;
    const volumeChangePct = prev && prev.volume > 0 ? (last.volume / prev.volume - 1) * 100 : null;
    const volumeVsAvgPct = avgVolume20 > 0 ? (last.volume / avgVolume20 - 1) * 100 : null;
    const round = n => Number.isFinite(n) ? Number(n.toFixed(2)) : null;

    return NextResponse.json({
      symbol,
      source: "Yahoo Finance",
      yahooSymbol,
      updatedAt: last.date,
      latest: { ...last, volume: Math.round(last.volume) },
      previous: prev ? { date: prev.date, volume: Math.round(prev.volume) } : null,
      avgVolume20: Math.round(avgVolume20),
      volumeChangePct: round(volumeChangePct),
      volumeVsAvgPct: round(volumeVsAvgPct),
      history: rows.slice(-180),
    }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Không thể lấy dữ liệu khối lượng." }, { status: 502 });
  }
}
