# Uptime Keeper

Module riêng tại `/uptime`, theo dõi 12 website Vercel.

## Lịch chạy
GitHub Actions chạy mỗi ngày lúc 19:00 UTC (02:00 sáng ngày kế tiếp, giờ Việt Nam). Có thể chạy thử thủ công trong tab Actions bằng `workflow_dispatch`.

## Cấu hình bắt buộc

1. Deploy phiên bản source này lên repository GitHub đang kết nối với dự án Vercel `tradetool-delta`.
2. Trong Vercel → Project Settings → Environment Variables, thêm:
   - `CRON_SECRET`: chuỗi bí mật ngẫu nhiên dài (ít nhất 32 ký tự).
   Sau đó redeploy.
3. Trong GitHub repository → Settings → Secrets and variables → Actions, thêm:
   - `UPTIME_APP_URL` = `https://tradetool-delta.vercel.app`
   - `CRON_SECRET` = cùng giá trị `CRON_SECRET` trên Vercel.
4. GitHub → Actions, bật workflow nếu GitHub yêu cầu Enable workflows.

## API
`POST /api/uptime` với header `Authorization: Bearer <CRON_SECRET>`.

API kiểm tra 12 URL song song, timeout 20 giây mỗi URL và trả JSON gồm trạng thái HTTP, thời gian phản hồi và thời điểm kiểm tra. Kết quả xuất hiện trong log của GitHub Actions.

## Lưu ý
Đây là HTTP availability check một lần mỗi ngày, không phải cam kết giữ ấm ứng dụng. Nó không ngăn Vercel pause do vượt quota, giới hạn tài nguyên hoặc chính sách nền tảng. Lịch GitHub Actions có thể chạy trễ khi hệ thống tải cao.
