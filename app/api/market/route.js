import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300;

const FX = {
  XAUUSD: "GC=F",
  BTCUSD: "BTC-USD",
  EURUSD: "EURUSD=X",
  GBPUSD: "GBPUSD=X",
  USDJPY: "JPY=X",
  AUDUSD: "AUDUSD=X",
  USDCAD: "CAD=X",
  USDCHF: "CHF=X",
  NZDUSD: "NZDUSD=X",
};

function average(values) {
  const good = values.filter(Number.isFinite);
  return good.length ? good.reduce((a, b) => a + b, 0) / good.length : null;
}
function sma(values, period) {
  return values.map((_, i) => i + 1 < period ? null : average(values.slice(i + 1 - period, i + 1)));
}
function rsi(values, period = 14) {
  if (values.length <= period) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}
function round(n) { return Number.isFinite(n) ? Number(n.toFixed(4)) : null; }

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "FPT").trim().toUpperCase();
  const kind = searchParams.get("kind") || "stock";
  if (!/^[A-Z0-9^=.-]{1,20}$/.test(symbol)) {
    return NextResponse.json({ error: "Mã tài sản không hợp lệ." }, { status: 400 });
  }
  const yahooSymbol = kind === "forex" ? (FX[symbol] || symbol) : `${symbol}.VN`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=2y&interval=1d&events=history`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 TradingTools/1.0", "Accept": "application/json" },
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`Yahoo Finance trả HTTP ${response.status} cho ${yahooSymbol}.`);
    const payload = await response.json();
    const result = payload?.chart?.result?.[0];
    if (!result?.timestamp?.length) throw new Error(`Không có lịch sử giá cho ${symbol}. Thử kiểm tra mã hoặc nguồn dữ liệu.`);
    const q = result.indicators?.quote?.[0] || {};
    const rows = result.timestamp.map((time, i) => ({
      date: new Date(time * 1000).toISOString().slice(0, 10),
      open: q.open?.[i],
      high: q.high?.[i],
      low: q.low?.[i],
      close: q.close?.[i],
      volume: q.volume?.[i] || 0,
    })).filter(r => [r.open, r.high, r.low, r.close].every(v => Number.isFinite(v)));
    if (rows.length < 20) throw new Error(`Dữ liệu lịch sử của ${symbol} quá ít để phân tích.`);
    const closes = rows.map(r => r.close);
    const last = rows.at(-1), prev = rows.at(-2);
    const ma20 = average(closes.slice(-20));
    const ma50 = closes.length >= 50 ? average(closes.slice(-50)) : null;
    const ma200 = closes.length >= 200 ? average(closes.slice(-200)) : null;
    const stdVals = closes.slice(-20);
    const stdMean = average(stdVals);
    const std = Math.sqrt(average(stdVals.map(v => (v - stdMean) ** 2)));
    const trueRanges = rows.slice(-15).map((r, i, arr) => {
      const prevClose = rows[rows.length - 15 + i - 1]?.close ?? r.close;
      return Math.max(r.high - r.low, Math.abs(r.high - prevClose), Math.abs(r.low - prevClose));
    });
    const atr = average(trueRanges.slice(1));
    const lowN = n => Math.min(...rows.slice(-n).map(r => r.low));
    const candidates = [
      { label: "Mua thăm dò", price: ma20, basis: "MA20" },
      { label: "DCA 1", price: ma50, basis: "MA50" },
      { label: "Bollinger Lower", price: ma20 - 2 * std, basis: "Bollinger Lower" },
      { label: "DCA 3", price: ma200, basis: "MA200" },
      { label: "Hỗ trợ 20D", price: lowN(20), basis: "Low 20D" },
      { label: "Hỗ trợ 50D", price: lowN(Math.min(50, rows.length)), basis: "Low 50D" },
      { label: "ATR 1", price: last.close - .75 * atr, basis: "0.75 ATR" },
      { label: "ATR 2", price: last.close - 1.5 * atr, basis: "1.50 ATR" },
      { label: "ATR 3", price: last.close - 2.5 * atr, basis: "2.50 ATR" },
    ].filter(x => Number.isFinite(x.price) && x.price > 0 && x.price < last.close * 1.005)
      .sort((a, b) => b.price - a.price);
    const levels = [];
    for (const item of candidates) {
      if (!levels.some(x => Math.abs(x.price - item.price) / last.close < .012)) {
        levels.push({ ...item, price: round(item.price), dropPct: round((1 - item.price / last.close) * 100) });
      }
    }
    const prices = rows.map(r => r.close);
    const currency = kind === "stock" ? "VND" : (symbol === "BTCUSD" ? "USD" : "USD");
    return NextResponse.json({
      symbol, yahooSymbol, currency,
      price: round(last.close),
      changePct: round((last.close / prev.close - 1) * 100),
      indicators: { ma20: round(ma20), ma50: round(ma50), ma200: round(ma200), rsi14: round(rsi(prices)) },
      levels,
      history: rows.slice(-220).map(r => ({ date: r.date, close: r.close })),
      source: "Yahoo Finance",
      updatedAt: last.date,
    }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Không lấy được dữ liệu." }, { status: 502 });
  }
}
