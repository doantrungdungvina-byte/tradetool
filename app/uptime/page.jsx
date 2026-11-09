"use client";

const SITES = [
  ["GA Excel Dashboard", "https://ga-excel-dashboard.vercel.app/"],
  ["TradeTool Delta", "https://tradetool-delta.vercel.app/"],
  ["Ra Quyết Định", "https://raquyetdinh-sooty.vercel.app/"],
  ["XAUUSD", "https://xauusd-c9qb.vercel.app/"],
  ["Đố Vui", "https://dovui-nu.vercel.app/"],
  ["Quay Số", "https://quayso-three.vercel.app/"],
  ["Phúc Thọa", "https://phucthoa.vercel.app/"],
  ["Vigo", "https://vigo-psi-red.vercel.app/"],
  ["CLB Dinh Dưỡng", "https://clbdinhduong.vercel.app/"],
  ["Nhà Đất", "https://nhadat-delta.vercel.app/"],
  ["Nhà Trọ BH", "https://nhatrobh.vercel.app/"],
  ["Thúy Nga", "https://thuynga-seven.vercel.app/"],
];

export default function UptimePage() {
  return (
    <main className="uptime-page">
      <div className="uptime-wrap">
        <a className="back" href="/">← Quay lại TradeTool Delta</a>
        <header className="hero">
          <div><div className="eyebrow">TRADETOOL DELTA / UTILITIES</div><h1>Uptime Keeper</h1><p>Theo dõi định kỳ 12 website Vercel của bạn.</p></div>
          <div className="schedule"><small>LỊCH TỰ ĐỘNG</small><strong>02:00 mỗi ngày</strong><span>Giờ Việt Nam (UTC+7)</span></div>
        </header>
        <section className="stats">
          <div className="stat"><span>Website theo dõi</span><strong>12</strong></div>
          <div className="stat"><span>Tần suất</span><strong>1 lần/ngày</strong></div>
          <div className="stat"><span>Phương thức</span><strong>HTTP GET</strong></div>
        </section>
        <section className="panel">
          <div className="panel-head"><h2>Danh sách website</h2><span>12 URL đã cấu hình</span></div>
          <div className="site-list">{SITES.map(([name,url],i)=><div className="site" key={url}><b>{String(i+1).padStart(2,"0")}</b><div className="site-info"><strong>{name}</strong><a href={url} target="_blank" rel="noreferrer">{url}</a></div><em>Đang theo dõi</em></div>)}</div>
        </section>
        <section className="notice"><h2>Cần hoàn tất cấu hình GitHub Actions</h2><p>Sau khi cập nhật source code lên repository GitHub đang liên kết với Vercel, thêm hai GitHub Actions Secrets <code>UPTIME_APP_URL</code> và <code>CRON_SECRET</code>. Workflow sẽ gọi API kiểm tra lúc 02:00 mỗi ngày theo giờ Việt Nam.</p><div className="cron">Lịch UTC: <code>0 19 * * *</code></div><p className="muted">19:00 UTC tương ứng 02:00 sáng hôm sau tại Việt Nam. GitHub Actions có thể chạy trễ khi hệ thống tải cao.</p></section>
        <p className="footnote">HTTP check chỉ xác nhận website có phản hồi tại thời điểm chạy; không đảm bảo website không bị Vercel tạm dừng do vượt hạn mức hoặc chính sách nền tảng.</p>
      </div>
      <style jsx>{`
        .uptime-page{min-height:100vh;background:#0b1220;color:#e8eef8;padding:34px 18px;font-family:Inter,system-ui,sans-serif}.uptime-wrap{max-width:980px;margin:auto}.back{color:#75d8ee;text-decoration:none;font-size:13px}.hero{display:flex;justify-content:space-between;align-items:end;gap:20px;margin:30px 0 24px}.eyebrow{font-size:11px;letter-spacing:2px;color:#75d8ee;font-weight:700}h1{font-size:clamp(32px,5vw,46px);margin:8px 0;font-weight:800;letter-spacing:-1px}.hero p{margin:0;color:#9baac0;font-size:14px}.schedule{border:1px solid #236b65;background:#10332f;padding:15px 18px;border-radius:13px;min-width:190px}.schedule small,.schedule span{display:block;color:#9bd6c9;font-size:11px}.schedule strong{display:block;font-size:20px;margin:5px 0}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}.stat,.panel{background:#111c2e;border:1px solid #27364d;border-radius:15px}.stat{padding:17px}.stat span{display:block;color:#93a2b8;font-size:12px}.stat strong{display:block;font-size:26px;margin-top:7px}.panel{padding:20px}.panel-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.panel h2,.notice h2{font-size:18px;margin:0}.panel-head span{font-size:11px;color:#9be1ee;background:#173443;padding:6px 10px;border-radius:20px}.site-list{margin-top:12px}.site{display:flex;align-items:center;gap:13px;padding:12px 0;border-top:1px solid #243148}.site>b{width:30px;height:30px;display:grid;place-items:center;border-radius:8px;background:#202d42;color:#aab9ce;font-size:11px}.site-info{min-width:0;flex:1}.site-info strong,.site-info a{display:block}.site-info strong{font-size:13px}.site-info a{font-size:11px;color:#8da3bf;overflow-wrap:anywhere;margin-top:4px}.site em{font-style:normal;color:#8bd3b1;font-size:11px;white-space:nowrap}.notice{margin-top:18px;border:1px solid #80642e;background:#2c2518;padding:19px;border-radius:15px}.notice h2{color:#f5d28a}.notice p{font-size:13px;line-height:1.7;color:#d1d5dc}.notice code,.cron code{background:#111827;border:1px solid #3b4658;padding:3px 7px;border-radius:6px;color:#e6edf7}.cron{font-size:13px;color:#f5d28a}.notice .muted{font-size:11px;color:#a7a9ae;margin-bottom:0}.footnote{font-size:11px;line-height:1.6;color:#7f8da3;margin-top:17px}@media(max-width:650px){.hero{align-items:stretch;flex-direction:column}.schedule{width:auto}.stats{grid-template-columns:1fr}.site em{display:none}.panel{padding:15px}}
      `}</style>
    </main>
  );
}
