import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '2ML CRM - Manage Your Connections',
  description: 'A simple CRM for managing your consulting business connections',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto py-4">
              <Link href="/" className="transition-colors hover:text-primary/80">
                <h1 className="text-2xl font-bold flex items-center">
                  <span className="text-primary">2ML</span>
                  <span className="ml-2">CRM</span>
                </h1>
              </Link>
            </div>
          </header>
          <main className="container mx-auto py-6">{children}</main>
        </div>
      </body>
    </html>
  );
} 