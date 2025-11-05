import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AutoMarketing Pro',
  description: 'AI-driven global marketing automation system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                AutoMarketing Pro
              </h1>
              <p className="text-gray-500">
                AI-driven marketing automation platform
              </p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
