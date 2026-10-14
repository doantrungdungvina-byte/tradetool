# TradeTool — Next.js + Vnstock (VCI primary, KBS fallback)

Bản cập nhật giữ giao diện và các tab hiện có của TradeTool. Tab VN Stock gọi Python endpoint `/api/vnstock`, lấy OHLCV từ Vnstock: ưu tiên VCI, tự thử KBS nếu VCI lỗi hoặc không trả dữ liệu. Không tự tạo dữ liệu giá.

## Kiến trúc

- Next.js frontend: `app/`
- Existing Next.js routes: `app/api/market`, `app/api/foreign`, `app/api/funds`
- Python Vercel Function: `api/vnstock.py`
- Dependencies Python: `requirements.txt`

Vercel hiện hỗ trợ Python Functions; runtime Python đang ở trạng thái Beta theo tài liệu chính thức. Build/deploy và khả năng tương thích phiên bản Vnstock cần xác minh qua deployment logs.

## Chạy local

Yêu cầu Node.js 20.9+, Python 3.12, và Vercel CLI mới. Trong thư mục dự án:

```bash
npm install
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
npm run dev
```

Để test Python route đúng như môi trường Vercel, cài Vercel CLI rồi chạy `vercel dev` sau khi `vercel link` dự án. Mở `/api/vnstock?symbol=FPT`.

## Triển khai Vercel

1. Tải ZIP và giải nén.
2. Đẩy **toàn bộ nội dung** thư mục `trading-tools-vercel` lên repository GitHub đang dùng cho TradeTool (nên tạo nhánh mới trước để dễ rollback).
3. Vercel → Project `tradetool-delta` → Settings → General: kiểm tra Root Directory trỏ đúng thư mục Next.js.
4. Push nhánh hoặc merge vào nhánh Production đã cấu hình. Vercel sẽ tự build. Nếu dùng repo mới: Vercel → Add New → Project → Import repository.
5. Kiểm tra Build Logs. Python runtime hiện Beta; nếu build báo không nhận Python function, xem log và tài liệu Vercel Python Runtime/FastAPI để cập nhật cấu hình.
6. Sau deployment, mở `https://tradetool-delta.vercel.app/api/vnstock?symbol=FPT`. Kết quả hợp lệ có `symbol`, `history`, `indicators`, `source`, `asOf`.
7. Mở website → tab VN STOCK → nhập FPT/HPG/VCB → Phân tích.

## Kiểm tra lỗi

- `400`: mã không hợp lệ; dùng mã HOSE/HNX/UPCoM, chỉ chữ và số.
- `502`: VCI và KBS đều lỗi hoặc không trả dữ liệu. Xem trường `details`; không thay thế bằng giá giả.
- `500`: lỗi cài/nạp thư viện Vnstock; kiểm tra `requirements.txt` và Build Logs.
- Nếu VCI/KBS trả dữ liệu có mức giá điều chỉnh khác nhau, website hiển thị nguồn thực tế trong response.

## Ghi chú quan trọng

- Vnstock Community có thể giới hạn nguồn theo cấp sử dụng; nếu tài khoản không có quyền dùng KBS hoặc VCI, fallback không thể vượt qua giới hạn quyền.
- Vnstock trả OHLCV cổ phiếu theo nghìn đồng; API chuyển sang VND để giao diện và phép tính số lượng DCA nhất quán. VCI và KBS có thể khác nhau về giá điều chỉnh; không so sánh chuỗi từ hai nguồn như thể hoàn toàn đồng nhất.
- Đây là dữ liệu tham khảo/phân tích, có thể trễ hoặc không sẵn sàng. Không dùng riêng kết quả này để tự động đặt lệnh.
- Tab Forex/Khối ngoại/Chứng chỉ quỹ vẫn dùng route hiện có; thay đổi trong bản này tập trung vào tab VN Stock.
- Chưa thể xác nhận deployment production cho đến khi bạn push mã lên GitHub và kiểm tra API thực tế trên Vercel.
