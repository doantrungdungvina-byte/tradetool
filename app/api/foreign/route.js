
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseNumber(value) {
  if (value == null) return null;

  const text = String(value)
    .trim()
    .replace(/\u00a0/g, "")
    .replace(/\s/g, "")
    .replace(/,/g, "");

  if (!text || text === "-" || text === "--") return null;
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function parseDate(value) {
  const match = String(value || "").match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );

  if (
    date.getUTCDate() !== Number(day) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCFullYear() !== Number(year)
  ) {
    return null;
  }

  return date;
}

function errorResponse(message, status, extra = {}) {
  return NextResponse.json(
    { success: false, error: message, ...extra },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "FPT")
    .trim()
    .toUpperCase();

  if (!/^[A-Z0-9]{3,10}$/.test(symbol)) {
    return errorResponse("Mã cổ phiếu không hợp lệ.", 400);
  }

  const sourceUrl =
    `https://cafef.vn/du-lieu/lich-su-giao-dich-${symbol.toLowerCase()}-4.chn`;

  try {
    const response = await fetch(sourceUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return errorResponse(
        `CafeF trả về HTTP ${response.status}.`,
        502,
        { sourceUrl }
      );
    }

    const html = await response.text();

    if (!html || html.length < 100) {
      return errorResponse(
        "CafeF trả về nội dung trống hoặc không đầy đủ.",
        502,
        { sourceUrl }
      );
    }

    const $ = cheerio.load(html);
    const rows = [];

    $("tr").each((_, element) => {
      const cells = $(element)
        .find("th, td")
        .map((__, cell) => $(cell).text().trim())
        .get();

      // Không tự suy đoán cột: chỉ nhận dạng dòng có mã,
      // ngày giao dịch và đủ các cột số theo cấu trúc dự kiến.
      if (
        cells.length >= 8 &&
        cells[0].toUpperCase() === symbol &&
        parseDate(cells[1])
      ) {
        rows.push({
          date: cells[1],
          dateValue: parseDate(cells[1]).getTime(),
          cells,
        });
      }
    });

    if (rows.length === 0) {
      return errorResponse(
        "Không tìm thấy bảng dữ liệu trong HTML CafeF. " +
          "Trang có thể tải dữ liệu bằng JavaScript, đổi cấu trúc " +
          "hoặc chặn truy vấn tự động. Chưa có số liệu được xác minh.",
        502,
        { sourceUrl }
      );
    }

    rows.sort((a, b) => b.dateValue - a.dateValue);
    const latest = rows[0];
    const cells = latest.cells;

    // Cần đối chiếu thứ tự cột này với HTML thực tế của CafeF.
    // Nếu chưa xác minh đúng cấu trúc, không trả số liệu mua/bán.
    const buyVolume = parseNumber(cells[2]);
    const buyValueBillionVnd = parseNumber(cells[3]);
    const sellVolume = parseNumber(cells[4]);
    const sellValueBillionVnd = parseNumber(cells[5]);
    const netVolume = parseNumber(cells[6]);
    const netValueBillionVnd = parseNumber(cells[7]);

    if (
      buyVolume === null ||
      sellVolume === null ||
      netVolume === null
    ) {
      return errorResponse(
        "Không xác minh được các cột khối lượng mua, bán và ròng " +
          "từ dữ liệu CafeF. Không trả về số liệu suy đoán.",
        502,
        { sourceUrl, date: latest.date }
      );
    }

    return NextResponse.json(
      {
        success: true,
        symbol,
        date: latest.date,
        buyVolume,
        sellVolume,
        netVolume,
        buyValueBillionVnd,
        sellValueBillionVnd,
        netValueBillionVnd,
        source: "CafeF",
        sourceUrl,
        sessionsReturned: 1,
        note:
          "Dữ liệu được trích xuất từ trang công khai; " +
          "hãy đối chiếu với trang nguồn trước khi sử dụng.",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    const timedOut = error?.name === "TimeoutError";

    return errorResponse(
      timedOut
        ? "Truy vấn CafeF quá thời gian chờ."
        : "Không thể truy cập hoặc phân tích dữ liệu CafeF.",
      502,
      { sourceUrl }
    );
  }
}
