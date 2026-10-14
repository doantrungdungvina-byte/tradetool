import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "").trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Vui lòng nhập mã cổ phiếu hợp lệ." }, { status: 400 });
  }

  // The previous Vnstock provider returned 403/guest-tier and exhausted request quota.
  // Do not fabricate foreign buy/sell data. A verified public API should be wired here.
  return NextResponse.json({
    available: false,
    symbol,
    error: `Chưa có nguồn miễn phí ổn định được xác minh cho dữ liệu khối ngoại của ${symbol}. Vnstock foreign_flow yêu cầu quyền truy cập phù hợp; các nguồn công khai có thể chặn truy vấn tự động.`,
    sourceLinks: [
      { label: "CafeF", url: `https://cafef.vn/du-lieu/${symbol.toLowerCase()}.chn` },
      { label: "Vietstock", url: `https://finance.vietstock.vn/${symbol.toLowerCase()}/thong-ke-giao-dich.htm` }
    ]
  }, { status: 503 });
}
