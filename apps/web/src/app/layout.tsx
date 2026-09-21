import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CareLoad - Caregiver Burnout Early-Warning System',
  description: 'AI & automated voice check-in platform to detect early signs of caregiver burnout and monitor senior wellbeing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="ambient-bg"></div>
        <div className="app-wrapper">
          <main className="flex-1">{children}</main>

          <footer className="footer">
            <div className="footer-container">
              <div className="disclaimer-box">
                <div className="disclaimer-title">⚠️ Medical &amp; Emergency Disclaimer</div>
                CareLoad is an early-warning communication and caregiver burnout monitoring tool. It is not a medical device, diagnostic system, or emergency dispatch service. In an emergency, always dial 911 or your local emergency services immediately.
              </div>

              <div className="footer-bottom">
                <div>&copy; {new Date().getFullYear()} CareLoad Systems. All rights reserved.</div>
                <div>Caregiver Burnout Early-Warning System (Phase 1)</div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
