# Trading Tools — GitHub + Vercel

## What's included in this update
- New `📈 LÃI KÉP` tab: initial capital, periodic contributions (monthly/quarterly), expected annual return, investment horizon, year-by-year projection, and an illustrative financial-independence target using the 4% rule.
- Existing VN stock, FX, funds, DCA tools and donation section are retained.
- TypeScript development dependencies are declared to prevent Next.js build from failing when the project contains `tsconfig.json` or `.tsx` components.
- Donation QR images are copied to `public/` so the component can load them in Next.js.

## Run locally
```bash
npm install
npm run build
npm run dev
```

## Push to GitHub
Create an empty repository on GitHub, then from this project folder run:
```bash
git init
git add .
git commit -m "Add compound interest planner"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```
Replace the URL with your repository URL. If Git is already initialized, skip `git init` and add/update the remote as needed.

## Deploy on Vercel
1. Open https://vercel.com/dashboard and choose **Add New → Project**.
2. Import the GitHub repository.
3. Keep the framework as Next.js and use the default build command `npm run build`.
4. Deploy. Later pushes to the connected branch trigger deployments automatically.

## Notes
- The compounding planner is a scenario estimate, not a guarantee. It assumes a constant annual return converted to monthly/quarterly periods and contributions at the end of each period. It excludes inflation, fees and taxes.
- Market API data may be delayed or unavailable depending on upstream providers.


## Nguồn dữ liệu dự phòng HNX/UPCoM

Khi Yahoo Finance không có mã, `/api/market` và `/api/stock-volume` sẽ gọi hàm Python `/api/vnstock` (VCI, sau đó KBS). Vercel cần cài các phụ thuộc trong `requirements.txt`. Sau khi deploy, thử `/api/vnstock?symbol=IDC` để kiểm tra riêng nguồn Python.
