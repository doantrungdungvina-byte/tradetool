```javascript
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value) {
  if (value == null) return null;

  let s = String(value)
    .trim()
    .replace(/\u00a0/g, "")
    .replace(/\s/g, "");

  if (!s || ["-", "--", "—", "–"].includes(s)) {
    return null;
  }

  // These columns are expected to contain integer values.
  // Remove common thousands separators.
  s = s.replace(/[.,]/g, "");

  if (!/^-?\d+$/.test(s)) {
    return null;
  }

  const number = Number(s);

  return Number.isSafeInteger(number) ? number : null;
}

function parseDate(value) {
  const s = String(value ?? "").trim();
  const match = s.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCDate() !== day ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCFullYear() !== year
  ) {
    return null;
  }

  return {
    text: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
    time: date.getTime()
  };
}

function findHeader(headers, patterns) {
  return headers.findIndex((header) =>
    patterns.some((pattern) => pattern.test(norm(header)))
  );
}

function getTableHeaders($, table) {
  const headers = [];

  const headerRow = $(table)
    .find("tr")
    .filter((_, tr) => $(tr).find("th").length > 0)
    .first();

  headerRow.find("th, td").each((_, cell) => {
    headers.push($(cell).text().trim());
  });

  if (headers.length > 0) {
    return headers;
  }

  $(table)
    .find("tr")
    .first()
    .find("th, td")
    .each((_, cell) => {
      headers.push($(cell).text().trim());
    });

  return headers;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const symbol = (
    searchParams.get("symbol") || "FPT"
  )
    .trim()
    .toUpperCase();

  if (!/^[A-Z0-9]{2,12}$/.test(symbol)) {
    return NextResponse.json(
      {
        success: false,
        error: "Vui lòng nhập mã cổ phiếu hợp lệ."
      },
      { status: 400 }
    );
  }

  // CafeF HTML source. This is best-effort scraping,
  // not a guaranteed public API.
  const sourceUrl =
    `https://cafef.vn/du-lieu/lich-su-giao-dich-${symbol.toLowerCase()}-3.chn`;

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `CafeF trả về HTTP ${response.status}. Nguồn có thể chặn truy vấn tự động hoặc URL không khả dụng.`,
          symbol,
          sourceUrl
        },
        { status: 502 }
      );
    }

    const html = await response.text();

    if (!html || html.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "CafeF trả về nội dung trống hoặc không đầy đủ.",
          symbol,
          sourceUrl
        },
        { status: 502 }
      );
    }

    const $ = cheerio.load(html);
    let best = null;

    $("table").each((_, table) => {
      const headers = getTableHeaders($, table);

      if (!headers.length) return;

      const dateIndex = findHeader(headers, [
        /^ngay$/,
        /ngay giao dich/,
        /^date$/,
        /thoi gian/
      ]);

      const buyVolumeIndex = findHeader(headers, [
        /khoi luong mua/,
        /kl mua/,
        /mua.*khoi luong/,
        /buy volume/,
        /buy vol/
      ]);

      const sellVolumeIndex = findHeader(headers, [
        /khoi luong ban/,
        /kl ban/,
        /ban.*khoi luong/,
        /sell volume/,
        /sell vol/
      ]);

      const netVolumeIndex = findHeader(headers, [
        /khoi luong rong/,
        /kl rong/,
        /net volume/,
        /mua ban rong.*khoi luong/
      ]);

      const buyValueIndex = findHeader(headers, [
        /gia tri mua/,
        /mua.*gia tri/,
        /buy value/
      ]);

      const sellValueIndex = findHeader(headers, [
        /gia tri ban/,
        /ban.*gia tri/,
        /sell value/
      ]);

      const netValueIndex = findHeader(headers, [
        /gia tri rong/,
        /gia tri mua.*ban rong/,
        /net value/
      ]);

      // Do not mistake an ordinary price-history table
      // for a foreign-investor transaction table.
      if (
        dateIndex < 0 ||
        buyVolumeIndex < 0 ||
        sellVolumeIndex < 0
      ) {
        return;
      }

      const rows = [];

      $(table)
        .find("tr")
        .each((__, tr) => {
          const cells = $(tr)
            .children("td")
            .map((___, td) => $(td).text().trim())
            .get();

          const date = parseDate(cells[dateIndex]);

          if (!date) return;

          const buyVolume = parseNumber(
            cells[buyVolumeIndex]
          );

          const sellVolume = parseNumber(
            cells[sellVolumeIndex]
          );

          if (
            buyVolume === null ||
            sellVolume === null
          ) {
            return;
          }

          const netVolume =
            netVolumeIndex >= 0
              ? parseNumber(cells[netVolumeIndex])
              : buyVolume - sellVolume;

          if (netVolume === null) return;

          rows.push({
            date: date.text,
            dateValue: date.time,
            buyVolume,
            sellVolume,
            netVolume,
            buyValue:
              buyValueIndex >= 0
                ? parseNumber(cells[buyValueIndex])
                : null,
            sellValue:
              sellValueIndex >= 0
                ? parseNumber(cells[sellValueIndex])
                : null,
            netValue:
              netValueIndex >= 0
                ? parseNumber(cells[netValueIndex])
                : null
          });
        });

      if (
        rows.length > 0 &&
        (!best || rows.length > best.rows.length)
      ) {
        best = { rows, headers };
      }
    });

    if (!best?.rows?.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Không tìm thấy bảng CafeF có cột ngày và khối lượng mua/bán phù hợp. Trang có thể đã đổi cấu trúc HTML hoặc tải dữ liệu bằng JavaScript. Không có số liệu thay thế nào được tạo.",
          symbol,
          sourceUrl
        },
        { status: 502 }
      );
    }

    best.rows.sort(
      (a, b) => b.dateValue - a.dateValue
    );

    const latest = best.rows[0];

    return NextResponse.json(
      {
        success: true,
        symbol,
        date: latest.date,
        buyVolume: latest.buyVolume,
        sellVolume: latest.sellVolume,
        netVolume: latest.netVolume,
        buyValue: latest.buyValue,
        sellValue: latest.sellValue,
        netValue: latest.netValue,
        source: "CafeF HTML (best effort)",
        sourceUrl,
        sessionsReturned: 1,
        note:
          "Dữ liệu là phiên mới nhất đọc được từ bảng phù hợp. Cần đối chiếu với nguồn CafeF."
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error?.name === "TimeoutError"
            ? "CafeF phản hồi quá thời gian chờ."
            : "Không thể kết nối hoặc đọc dữ liệu CafeF.",
        symbol,
        sourceUrl
      },
      { status: 502 }
    );
  }
}
```
