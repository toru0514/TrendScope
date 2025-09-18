
import "./globals.css";

export const metadata = { title: "Accessory Trends Dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-dvh">
        <div className="container py-6">{children}</div>
      </body>
    </html>
  );
}
