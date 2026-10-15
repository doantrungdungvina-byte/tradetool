import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const numberFrom = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
};

const firstFrom = (obj, keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null && obj?.[key] !== "") return obj[key];
  }
  return null;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "").trim().toUpperCase();

  if (!/^[A-Z0-9.-]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Vui lòng nhập mã cổ phiếu hợp lệ." }, { status: 400 });
  }

  // A real upstream must be configured; this route intentionally does not invent data.
  const endpoint = process.env.FOREIGN_FLOW_API_URL;
  if (!endpoint) {
    return NextResponse.json({
      error: "Chưa cấu hình nguồn API khối ngoại có quyền truy cập. Thêm FOREIGN_FLOW_API_URL trỏ tới nhà cung cấp thực tế; API chỉ yêu cầu 1 phiên gần nhất.",
      symbol,
      sourceLinks: [
        { label: "CafeF", url: `https://cafef.vn/du-lieu/${symbol.toLowerCase()}.chn` },
        { label: "Vietstock", url: `https://finance.vietstock.vn/${symbol.toLowerCase()}/thong-ke-giao-dich.htm` }
      ]
    }, { status: 503 });
  }

  try {
    const url = new URL(endpoint);
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("limit", "1");

    const headers = { Accept: "application/json" };
    if (process.env.FOREIGN_FLOW_API_TOKEN) {
      headers.Authorization = `Bearer ${process.env.FOREIGN_FLOW_API_TOKEN}`;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      return NextResponse.json({
        error: `Nguồn dữ liệu khối ngoại trả HTTP ${response.status}. Kiểm tra quyền truy cập hoặc hạn mức nhà cung cấp.`,
        symbol
      }, { status: 502 });
    }

    const payload = await response.json();
    const rawRows = Array.isArray(payload)
      ? payload
      : (Array.isArray(payload?.data) ? payload.data
        : Array.isArray(payload?.items) ? payload.items
        : Array.isArray(payload?.results) ? payload.results : []);

    if (!rawRows.length) {
      return NextResponse.json({ error: `Nguồn không trả dữ liệu khối ngoại cho ${symbol}.`, symbol }, { status: 404 });
    }

    const rows = rawRows.filter((row) => !row.symbol || String(row.symbol).toUpperCase() === symbol);
    if (!rows.length) {
      return NextResponse.json({ error: `Nguồn trả dữ liệu nhưng không khớp mã ${symbol}.`, symbol }, { status: 404 });
    }

    const latest = rows.reduce((a, b) => {
      const dateA = new Date(firstFrom(a, ["date", "time", "tradingDate", "trading_date"]) || 0).getTime();
      const dateB = new Date(firstFrom(b, ["date", "time", "tradingDate", "trading_date"]) || 0).getTime();
      return dateB > dateA ? b : a;
    });

    const buyVolume = numberFrom(latest, ["buyVolume", "buy_vol", "foreignBuyVolume", "buy_volume"]);
    const sellVolume = numberFrom(latest, ["sellVolume", "sell_vol", "foreignSellVolume", "sell_volume"]);
    const netVolume = numberFrom(latest, ["netVolume", "net_vol", "net_volume"])
      ?? (buyVolume !== null && sellVolume !== null ? buyVolume - sellVolume : null);
    const buyValue = numberFrom(latest, ["buyValue", "buy_val", "buy_value"]);
    const sellValue = numberFrom(latest, ["sellValue", "sell_val", "sell_value"]);
    const netValue = numberFrom(latest, ["netValue", "net_val", "net_value"])
      ?? (buyValue !== null && sellValue !== null ? buyValue - sellValue : null);

    if (buyVolume === null || sellVolume === null) {
      return NextResponse.json({
        error: "Nguồn đã phản hồi nhưng schema không có trường khối lượng mua/bán được nhận diện. Cần ánh xạ đúng trường của nhà cung cấp.",
        symbol
      }, { status: 502 });
    }

    return NextResponse.json({
      symbol,
      date: firstFrom(latest, ["date", "time", "tradingDate", "trading_date"]),
      buyVolume,
      sellVolume,
      netVolume,
      buyValue,
      sellValue,
      netValue,
      source: firstFrom(payload, ["source", "provider"]) || "Configured foreign-flow provider",
      note: "Chỉ hiển thị phiên mới nhất có trong phản hồi nguồn. Đối chiếu với công bố của sở giao dịch.",
      sessionsReturned: 1
    });
  } catch (error) {
    return NextResponse.json({
      error: error?.name === "TimeoutError"
        ? "Nguồn dữ liệu khối ngoại phản hồi quá chậm (timeout)."
        : "Không thể kết nối nguồn dữ liệu khối ngoại. Kiểm tra endpoint và cấu hình mạng.",
      symbol
    }, { status: 502 });
  }
}
