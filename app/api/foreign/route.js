import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function norm(s) {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value) {
  if (value == null) return null;
  let s = String(value).trim().replace(/\u00a0/g, "").replace(/\s/g, "");
  if (!s || s === "-" || s === "--" || s === "—") return null;
  // CafeF commonly uses dot as thousands separator. Avoid guessing decimals:
  // values in these volume/value columns are expected to be integers.
  s = s.replace(/[.,]/g, "");
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}

function parseDate(value) {
  const s = String(value ?? "").trim();
  let m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return null;
  const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCDate() !== d || date.getUTCMonth() + 1 !== mo || date.getUTCFullYear() !== y) return null;
  return { text: `${String(d).padStart(2,"0")}/${String(mo).padStart(2,"0")}/${y}`, time: date.getTime() };
}

function findHeader(headers, patterns) {
  return headers.findIndex((h) => patterns.some((p) => p.test(norm(h))));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "FPT").trim().toUpperCase();

  if (!/^[A-Z0-9]{2,12}$/.test(symbol)) {
    return NextResponse.json({ error: "Vui lòng nhập mã cổ phiếu hợp lệ." }, { status: 400 });
  }

  // CafeF pages are public HTML, not a guaranteed public API. This is best-effort scraping.
  const sourceUrl = `https://cafef.vn/du-lieu/lich-su-giao-dich-${symbol.toLowerCase()}-3.chn`;

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      return NextResponse.json({
        error: `CafeF trả về HTTP ${response.status}. Có thể nguồn chặn truy vấn tự động hoặc URL không khả dụng.`,
        symbol, sourceUrl
      }, { status: 502 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    let best = null;

    $("table").each((_, table) => {
      const headers = [];
      const headerRow = $(table).find("tr").filter((__, tr) => $(tr).find("th").length > 0).first();
      headerRow.find("th,td").each((__, cell) => headers.push($(cell).text().trim()));
      if (!headers.length) {
        const firstRow = $(table).find("tr").first();
        firstRow.find("th,td").each((__, cell) => headers.push($(cell).text().trim()));
      }
      const buyVolIdx = findHeader(headers, [/khoi luong mua/, /kl mua/, /mua.*khoi luong/, /buy volume/, /buy vol/]);
      const sellVolIdx = findHeader(headers, [/khoi luong ban/, /kl ban/, /ban.*khoi luong/, /sell volume/, /sell vol/]);
      const netVolIdx = findHeader(headers, [/khoi luong rong/, /khoi luong mua.*ban rong/, /kl rong/, /net volume/, /mua ban rong.*khoi luong/]);
      const dateIdx = findHeader(headers, [/^ngay$/, /ngay giao dich/, /^date$/, /thoi gian/]);
      const buyValIdx = findHeader(headers, [/gia tri mua/, /buy value/]);
      const sellValIdx = findHeader(headers, [/gia tri ban/, /sell value/]);
      const netValIdx = findHeader(headers, [/gia tri rong/, /gia tri mua.*ban rong/, /net value/]);

      if (buyVolIdx < 0 || sellVolIdx < 0 || dateIdx < 0) return;

      const rows = [];
      $(table).find("tr").each((__, tr) => {
        const cells = [];
        $(tr).find("td").each((___, td) => cells.push($(td).text().trim()));
        const date = parseDate(cells[dateIdx]);
        if (!date) return;
        const buyVolume = parseNumber(cells[buyVolIdx]);
        const sellVolume = parseNumber(cells[sellVolIdx]);
        if (buyVolume === null || sellVolume === null) return;
        const netVolume = netVolIdx >= 0 ? parseNumber(cells[netVolIdx]) : buyVolume - sellVolume;
        if (netVolume === null) return;
        rows.push({
          date: date.text,
          dateValue: date.time,
          buyVolume,
          sellVolume,
          netVolume,
          buyValue: buyValIdx >= 0 ? parseNumber(cells[buyValIdx]) : null,
          sellValue: sellValIdx >= 0 ? parseNumber(cells[sellValIdx]) : null,
          netValue: netValIdx >= 0 ? parseNumber(cells[netValIdx]) : null
        });
      });
      if (rows.length && (!best || rows.length > best.rows.length)) best = { rows, headers };
    });

    if (!best?.rows?.length) {
      return NextResponse.json({
        error: "Không tìm thấy bảng CafeF có cột ngày và khối lượng mua/bán nhận diện được. CafeF có thể đã đổi cấu trúc HTML hoặc tải dữ liệu bằng JavaScript; không có số liệu nào được tạo thay thế.",
        symbol, sourceUrl
      }, { status: 502 });
    }

    best.rows.sort((a, b) => b.dateValue - a.dateValue);
    const latest = best.rows[0];

    return NextResponse.json({
      success: true,
      symbol,
      date: latest.date,
      buyVolume: latest.buyVolume,
      sellVolume: latest.sellVolume,
      netVolume: latest.netVolume,
      buyValue: latest.buyValue,
      sellValue: latest.sellValue,
      netValue: latest.netValue,
      source: "CafeF (HTML best-effort)",
      sourceUrl,
      sessionsReturned: 1,
      note: "Chỉ trả phiên mới nhất tìm thấy trong bảng đọc được. Đối chiếu với CafeF; nguồn có thể trễ hoặc thay đổi cấu trúc."
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({
      error: error?.name === "TimeoutError"
        ? "CafeF phản hồi quá thời gian chờ."
        : "Không thể kết nối hoặc đọc dữ liệu CafeF.",
      symbol, sourceUrl
    }, { status: 502 });
  }
}
