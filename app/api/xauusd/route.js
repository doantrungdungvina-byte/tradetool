import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_INTERVALS = new Set(["5min", "15min", "30min", "1h", "4h", "1day"]);

function average(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

function sma(values, period) {
  if (values.length < period) return null;
  return average(values.slice(-period));
}

function rsi(values, period = 14) {
  if (values.length <= period) return null;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(change, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-change, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

const round = (value) => Number.isFinite(value) ? Number(value.toFixed(4)) : null;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const interval = searchParams.get("interval") || "5min";
  if (!ALLOWED_INTERVALS.has(interval)) {
    return NextResponse.json({ error: "Khung thời gian không hợp lệ." }, { status: 400 });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Thiếu TWELVE_DATA_API_KEY. Hãy thêm key trong Vercel → Settings → Environment Variables và deploy lại." }, { status: 503 });
  }

  const url = new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol", "XAU/USD");
  url.searchParams.set("interval", interval);
  url.searchParams.set("outputsize", "250");
  url.searchParams.set("apikey", apiKey);

  try {
    const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok || payload.status === "error" || payload.code || !Array.isArray(payload.values)) {
      const detail = payload.message || payload.code || `HTTP ${response.status}`;
      return NextResponse.json({ error: `Twelve Data không trả được dữ liệu XAU/USD: ${detail}` }, { status: 502 });
    }

    const rows = payload.values.map((item) => ({
      date: item.datetime,
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
      volume: item.volume == null ? 0 : Number(item.volume),
    })).filter((row) => [row.open, row.high, row.low, row.close].every(Number.isFinite)).reverse();

    if (rows.length < 15) {
      return NextResponse.json({ error: "Twelve Data trả về quá ít nến để tính chỉ báo." }, { status: 502 });
    }

    const closes = rows.map((row) => row.close);
    const last = rows.at(-1);
    const previous = rows.at(-2);
    const ma20 = sma(closes, 20);
    const ma50 = sma(closes, 50);
    const ma200 = sma(closes, 200);
    const changePct = previous?.close ? ((last.close / previous.close) - 1) * 100 : null;

    return NextResponse.json({
      symbol: "XAUUSD",
      providerSymbol: "XAU/USD",
      interval,
      currency: "USD",
      price: round(last.close),
      changePct: round(changePct),
      indicators: { rsi14: round(rsi(closes)), ma20: round(ma20), ma50: round(ma50), ma200: round(ma200) },
      history: rows.slice(-220).map((row) => ({ date: row.date, open: row.open, high: row.high, low: row.low, close: row.close })),
      source: "Twelve Data",
      updatedAt: last.date,
      note: "Giá XAU/USD từ Twelve Data; không phải giá khớp lệnh của một broker cụ thể.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Không thể kết nối Twelve Data lúc này. Vui lòng thử lại sau." }, { status: 502 });
  }
}
