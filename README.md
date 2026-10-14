# Trading Tools — Next.js + Vercel

Dự án này chuyển giao diện Streamlit sang Next.js để triển khai trên Vercel.

## Các mục trong giao diện

- VN Stock: giá lịch sử Yahoo Finance, RSI/MA và các mức DCA tham khảo.
- Forex/XAUUSD: giá lịch sử Yahoo Finance. XAUUSD dùng GC=F (hợp đồng vàng tương lai), không phải giá spot của broker.
- Khối ngoại: tab đã giữ lại. API hiện báo rõ khi chưa có nguồn miễn phí ổn định đã xác minh, không tạo số liệu giả.
- Chứng chỉ quỹ: danh sách mã quỹ và thử đọc NAV từ CafeF; có liên kết Fmarket để đối chiếu.

## Chạy thử trên máy

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
npm run dev
```

Mở http://localhost:3000

Kiểm tra bản production:

```bash
npm run build
npm start
```

## Triển khai lên Vercel

1. Giải nén ZIP.
2. Tải toàn bộ thư mục `trading-tools-vercel` lên một repository GitHub mới.
3. Mở https://vercel.com/new và đăng nhập bằng GitHub.
4. Chọn repository vừa tạo.
5. Framework preset: Next.js (Vercel tự nhận diện). Không cần đổi Build Command (`npm run build`) hoặc Output Directory.
6. Bấm Deploy. Vercel cấp một URL `*.vercel.app`.
7. Muốn tên cụ thể như `trading-tools-abc.vercel.app`, vào Project → Settings → Domains và chọn tên còn trống.

Không cần API key cho Yahoo Finance trong mẫu này. Nguồn dữ liệu công khai có thể giới hạn truy cập, chặn tự động hoặc thay đổi cấu trúc.

## Giới hạn cần biết

- Đây là bản chuyển đổi giao diện và các chức năng chính sang Next.js; không phải bản dịch từng dòng Python.
- Nguồn Yahoo Finance là dữ liệu tham khảo, có thể trễ/thiếu và không phù hợp cho lệnh giao dịch tự động.
- Khối ngoại hiện chưa kết nối nguồn lịch sử miễn phí đã được xác minh. API trả thông báo rõ, không hiển thị số liệu giả.
- Bộ đọc NAV CafeF là best-effort; nếu không đọc được NAV, hãy đối chiếu Fmarket. Cần tích hợp API/nguồn dữ liệu được phép sử dụng để bảo đảm độ ổn định.
- Mức DCA là phép tính kỹ thuật tham khảo, không phải khuyến nghị mua bán.


## XAU/USD spot data

The Forex tab now requests the XAU/USD spot quote from GoldPrice.dev (`XAU-USD-SPOT`) rather than Yahoo Finance COMEX gold futures (`GC=F`). Its free/anonymous quote may be delayed by about 15 minutes. Daily spot bars are used for RSI and price-based analysis; consolidated spot volume is not available, so volume/RVOL signals are intentionally omitted for spot gold. The quote and daily-bar endpoints are provider-dependent and can return errors or rate limits.
