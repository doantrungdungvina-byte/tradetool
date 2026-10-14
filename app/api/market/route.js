import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 300;

const FX = {
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
function rsiSeries(values, period = 14) {
  const out = Array(values.length).fill(null);
  if (values.length <= period) return out;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}
function round(n) { return Number.isFinite(n) ? Number(n.toFixed(4)) : null; }

async function getSpotGoldRows() {
  // Spot XAU/USD source. Anonymous/free data may be delayed; expose provider metadata.
  const headers = { Accept: "application/json", "User-Agent": "TradingTools/1.0" };
  const priceResponse = await fetch("https://api.goldprice.dev/v1/prices?symbol=XAU-USD-SPOT", {
    headers, cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!priceResponse.ok) throw new Error(`Nguồn giá vàng spot trả HTTP ${priceResponse.status}.`);
  const pricePayload = await priceResponse.json();
  const spot = pricePayload?.symbols?.find(x => x.symbol === "XAU" && x.quote_currency === "USD") || pricePayload?.symbols?.[0];
  const spotPrice = Number(spot?.price);
  if (!Number.isFinite(spotPrice) || spotPrice <= 0) throw new Error("Nguồn giá vàng spot không trả về giá hợp lệ.");

  const now = new Date();
  // Free tier allows only the most recent 30 days; request 30 calendar days, not 35.
  const fromDate = new Date(now.getTime() - 29 * 86400000).toISOString().slice(0, 10);
  const toDate = now.toISOString().slice(0, 10);
  const barsUrl = `https://api.goldprice.dev/v1/bars?symbol=XAU-USD-SPOT&interval=1d&from=${fromDate}&to=${toDate}&limit=30`;
  const barsResponse = await fetch(barsUrl, { headers, cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!barsResponse.ok) throw new Error(`Đã lấy được giá spot nhưng lịch sử kỹ thuật trả HTTP ${barsResponse.status}.`);
  const barsPayload = await barsResponse.json();
  const rows = (barsPayload?.bars || []).map(bar => ({
    date: String(bar.bar_start || "").slice(0, 10),
    open: Number(bar.open), high: Number(bar.high), low: Number(bar.low), close: Number(bar.close),
    volume: null, // No consolidated exchange volume exists for spot XAU/USD.
  })).filter(r => r.date && [r.open, r.high, r.low, r.close].every(Number.isFinite))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (rows.length < 15) throw new Error("Lịch sử XAU/USD spot chưa đủ để tính RSI. Vui lòng thử lại sau.");
  const last = rows.at(-1);
  last.close = spotPrice;
  last.high = Math.max(last.high, spotPrice);
  last.low = Math.min(last.low, spotPrice);
  return {
    rows, spotPrice, providerDate: spot?.computed_at || null, isStale: spot?.is_stale ?? null,
    yahooSymbol: "XAU-USD-SPOT", source: "GoldPrice.dev — XAU/USD spot",
    sourceNote: spot?.is_stale
      ? "Nhà cung cấp đánh dấu dữ liệu cũ; hãy kiểm tra thời điểm cập nhật trước khi giao dịch."
      : "Giá vàng giao ngay XAU/USD; dữ liệu miễn phí có thể trễ khoảng 15 phút. Volume tập trung không có sẵn cho thị trường spot.",
  };
}
function swingPoints(rows, field, start, end, radius = 2, type = 'low') {
  const found = [];
  for (let i = Math.max(radius, start); i < Math.min(end, rows.length - radius); i++) {
    const value = rows[i][field];
    const neighbors = rows.slice(i - radius, i + radius + 1).map(r => r[field]);
    const extreme = type === 'low' ? Math.min(...neighbors) : Math.max(...neighbors);
    if (value === extreme && neighbors.filter(v => v === value).length === 1) found.push({ index: i, value });
  }
  return found;
}
function detectDivergence(rows, rsiValues) {
  const from = Math.max(0, rows.length - 45);
  const lows = swingPoints(rows, 'low', from, rows.length, 2, 'low').filter(p => rsiValues[p.index] != null);
  const highs = swingPoints(rows, 'high', from, rows.length, 2, 'high').filter(p => rsiValues[p.index] != null);
  const a = lows.at(-2), b = lows.at(-1), c = highs.at(-2), d = highs.at(-1);
  if (a && b && b.index - a.index >= 3 && b.value < a.value && rsiValues[b.index] > rsiValues[a.index]) {
    return { type: 'bullish', label: 'Có dấu hiệu phân kỳ tăng', detail: 'Giá tạo đáy thấp hơn nhưng RSI tạo đáy cao hơn. Cần nến xác nhận; phân kỳ có thể kéo dài.' };
  }
  if (c && d && d.index - c.index >= 3 && d.value > c.value && rsiValues[d.index] < rsiValues[c.index]) {
    return { type: 'bearish', label: 'Có dấu hiệu phân kỳ giảm', detail: 'Giá tạo đỉnh cao hơn nhưng RSI tạo đỉnh thấp hơn. Cần nến xác nhận; phân kỳ có thể kéo dài.' };
  }
  return { type: 'none', label: 'Chưa phát hiện phân kỳ rõ', detail: 'Thuật toán tìm swing trong khoảng 45 phiên gần nhất; không phát hiện không có nghĩa là không thể đảo chiều.' };
}
function reversalAnalysis(rows, rsiValues, volumeAvgValues) {
  const i = rows.length - 1, last = rows[i], prev = rows[i - 1];
  const range = Math.max(last.high - last.low, 0.0000001);
  const body = Math.abs(last.close - last.open);
  const lowerWick = Math.min(last.open, last.close) - last.low;
  const upperWick = last.high - Math.max(last.open, last.close);
  const rsiNow = rsiValues[i];
  const volAvg = volumeAvgValues[i];
  const rvol = volAvg > 0 ? last.volume / volAvg : null;
  const nearLow = last.close <= Math.min(...rows.slice(-20).map(r => r.low)) * 1.025;
  const nearHigh = last.close >= Math.max(...rows.slice(-20).map(r => r.high)) * 0.975;
  const bullishCandle = last.close > last.open && last.close >= (last.low + range * 0.65);
  const bearishCandle = last.close < last.open && last.close <= (last.low + range * 0.35);
  const parts = {
    candle: 0, rsi: 0, volume: 0, location: 0, confirmation: 0,
  };
  if (lowerWick / range >= 0.35 && lowerWick > body) parts.candle = 20;
  else if (upperWick / range >= 0.35 && upperWick > body) parts.candle = 20;
  if (rsiNow != null && rsiNow < 30) parts.rsi = 20;
  else if (rsiNow != null && rsiNow < 40) parts.rsi = 12;
  else if (rsiNow != null && rsiNow > 70) parts.rsi = 20;
  else if (rsiNow != null && rsiNow > 60) parts.rsi = 12;
  if (rvol != null && rvol >= 2) parts.volume = 20;
  else if (rvol != null && rvol >= 1.5) parts.volume = 14;
  else if (rvol != null && rvol >= 1.2) parts.volume = 8;
  if (nearLow || nearHigh) parts.location = 20;
  if (bullishCandle || bearishCandle) parts.confirmation = 20;
  const score = Object.values(parts).reduce((a, b) => a + b, 0);
  let signal = 'Chưa có tín hiệu rõ';
  if (score >= 70 && bullishCandle && (nearLow || (rsiNow != null && rsiNow < 40))) signal = 'Có dấu hiệu đảo chiều tăng — chờ xác nhận';
  else if (score >= 70 && bearishCandle && (nearHigh || (rsiNow != null && rsiNow > 60))) signal = 'Có dấu hiệu đảo chiều giảm — chờ xác nhận';
  else if (score >= 50) signal = 'Có dấu hiệu cần theo dõi';
  const notes = [];
  if (lowerWick / range >= 0.35 && lowerWick > body) notes.push('Râu nến dưới dài: có thể xuất hiện lực mua đỡ giá.');
  if (upperWick / range >= 0.35 && upperWick > body) notes.push('Râu nến trên dài: có thể xuất hiện áp lực bán tại vùng cao.');
  if (nearLow) notes.push('Giá đóng cửa gần vùng đáy thấp nhất 20 phiên.');
  if (nearHigh) notes.push('Giá đóng cửa gần vùng đỉnh cao nhất 20 phiên.');
  if (rvol != null && rvol >= 1.5) notes.push(`Khối lượng cao hơn trung bình 20 phiên ${rvol.toFixed(2)} lần.`);
  if (!notes.length) notes.push('Chưa có tổ hợp nến/động lượng/vị trí đủ nổi bật theo các ngưỡng hiện tại.');
  return { score, signal, parts, candle: { bodyPct: round(body / range * 100), lowerWickPct: round(lowerWick / range * 100), upperWickPct: round(upperWick / range * 100), bullish: bullishCandle, bearish: bearishCandle }, nearLow, nearHigh, notes };
}
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "FPT").trim().toUpperCase();
  const kind = searchParams.get("kind") || "stock";
  if (!/^[A-Z0-9^=.-]{1,20}$/.test(symbol)) {
    return NextResponse.json({ error: "Mã tài sản không hợp lệ." }, { status: 400 });
  }
  const isSpotGold = kind === "forex" && symbol === "XAUUSD";
  const yahooSymbol = kind === "forex" ? (FX[symbol] || symbol) : `${symbol}.VN`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=2y&interval=1d&events=history`;
  try {
    let spotMeta = null;
    let rows;
    if (isSpotGold) {
      spotMeta = await getSpotGoldRows();
      rows = spotMeta.rows;
    } else {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 TradingTools/1.0", "Accept": "application/json" },
        next: { revalidate: 300 },
      });
      if (!response.ok) throw new Error(`Yahoo Finance trả HTTP ${response.status} cho ${yahooSymbol}.`);
      const payload = await response.json();
      const result = payload?.chart?.result?.[0];
      if (!result?.timestamp?.length) throw new Error(`Không có lịch sử giá cho ${symbol}. Thử kiểm tra mã hoặc nguồn dữ liệu.`);
      const q = result.indicators?.quote?.[0] || {};
      rows = result.timestamp.map((time, i) => ({
        date: new Date(time * 1000).toISOString().slice(0, 10),
        open: q.open?.[i], high: q.high?.[i], low: q.low?.[i], close: q.close?.[i],
        volume: q.volume?.[i] ?? null,
      })).filter(r => [r.open, r.high, r.low, r.close].every(v => Number.isFinite(v)));
    }
    if (rows.length < (isSpotGold ? 15 : 20)) throw new Error(`Dữ liệu lịch sử của ${symbol} quá ít để phân tích.`);
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
    const rsiValues = rsiSeries(prices, 14);
    const hasVolume = rows.some(r => Number.isFinite(r.volume) && r.volume > 0);
    const volumeValues = rows.map(r => Number.isFinite(r.volume) ? r.volume : 0);
    const volumeMA20 = hasVolume ? sma(volumeValues, 20) : Array(rows.length).fill(null);
    const rsiNow = rsiValues.at(-1);
    const rsiPrev = rsiValues.at(-2);
    const volAvg = volumeMA20.at(-1);
    const rvol = volAvg > 0 ? last.volume / volAvg : null;
    const divergence = detectDivergence(rows, rsiValues);
    const reversal = reversalAnalysis(rows, rsiValues, volumeMA20);
    const recentHistory = rows.slice(-220).map((r, idx, arr) => {
      const absoluteIndex = rows.length - arr.length + idx;
      return { date: r.date, open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume, rsi14: round(rsiValues[absoluteIndex]), volumeMA20: round(volumeMA20[absoluteIndex]) };
    });
    const currency = kind === "stock" ? "VND" : "USD";
    return NextResponse.json({
      symbol, yahooSymbol: spotMeta?.yahooSymbol || yahooSymbol, currency,
      price: round(isSpotGold ? spotMeta.spotPrice : last.close),
      changePct: round(((isSpotGold ? spotMeta.spotPrice : last.close) / prev.close - 1) * 100),
      indicators: {
        ma20: round(ma20), ma50: round(ma50), ma200: round(ma200), rsi14: round(rsiNow),
        rsiPrevious: round(rsiPrev), rsiChange: round(rsiNow != null && rsiPrev != null ? rsiNow - rsiPrev : null),
        rsiState: rsiNow == null ? 'Chưa đủ dữ liệu' : rsiNow < 30 ? 'Quá bán' : rsiNow > 70 ? 'Quá mua' : rsiNow >= 50 ? 'Động lượng nghiêng tăng' : 'Động lượng nghiêng giảm',
        divergence,
        volume: hasVolume ? round(last.volume) : null, volumeMA20: round(volAvg), rvol: rvol == null || !hasVolume ? null : round(rvol),
        volumeState: !hasVolume ? 'Không có volume tập trung cho thị trường spot' : rvol == null ? 'Chưa đủ dữ liệu' : rvol >= 2 ? 'Đột biến ≥ 2 lần' : rvol >= 1.5 ? 'Cao hơn bình thường' : rvol >= 1.2 ? 'Nhỉnh hơn trung bình' : 'Bình thường/thấp',
      },
      reversal,
      levels,
      history: recentHistory,
      source: spotMeta?.source || "Yahoo Finance",
      sourceNote: spotMeta?.sourceNote || "Dữ liệu lịch sử Yahoo Finance có thể trễ và khác báo giá tại broker.",
      quoteTimestamp: spotMeta?.providerDate || null,
      isStale: spotMeta?.isStale ?? null,
      updatedAt: last.date,
    }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Không lấy được dữ liệu." }, { status: 502 });
  }
}
