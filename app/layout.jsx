import "./globals.css";

export const metadata = {
  title: "Trading Tools",
  description: "VN Stock, Forex/XAUUSD, DCA và chứng chỉ quỹ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
