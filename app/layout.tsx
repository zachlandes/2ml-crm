import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { ActionCounter } from '@/components/ActionTracker';
import { NotificationProvider } from '@/components/ActionNotification';
import NotificationInitializer from '@/components/NotificationInitializer';

// Load Inter font - clean, geometric typeface perfect for Bauhaus style
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '2ML CRM - Manage Your Connections',
  description: 'A modern CRM for managing your consulting business connections',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    shortcut: '/favicon-16x16.png',
    apple: '/favicon-96x96.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <NotificationProvider>
          <NotificationInitializer />
          <div className="min-h-screen bg-background bauhaus-grid relative">
            {/* Bauhaus-inspired geometric elements */}
            <div className="bauhaus-circle w-32 h-32 bg-primary/10 -top-10 -right-10"></div>
            <div className="bauhaus-circle w-48 h-48 bg-accent/10 bottom-40 -left-20"></div>
            <div className="bauhaus-line w-12 rotate-45 top-20 right-40"></div>
            
            <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
              <div className="container mx-auto py-4 px-4 flex justify-between items-center">
                <Link href="/" className="transition-colors hover:text-primary">
                  <h1 className="text-2xl font-bold flex items-center">
                    <span className="inline-block bg-primary text-primary-foreground px-2 py-1 mr-2">2ML</span>
                    <span className="text-foreground">CRM</span>
                  </h1>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <ActionCounter />
                  <div className="h-6 w-1 bg-accent"></div>
                  <div className="h-6 w-1 bg-secondary"></div>
                  <div className="h-6 w-1 bg-primary"></div>
                </div>
              </div>
            </header>
            
            <main className="container mx-auto py-6 px-4 relative">{children}</main>
            
            <footer className="border-t py-4 mt-12 text-center text-sm text-muted-foreground">
              <div className="container mx-auto px-4">
                <div className="flex justify-center items-center space-x-2">
                  <div className="h-3 w-3 bg-primary"></div>
                  <div className="h-3 w-3 bg-secondary"></div>
                  <div className="h-3 w-3 bg-accent"></div>
                </div>
                <p className="mt-2">© 2025 2ML CRM</p>
              </div>
            </footer>
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
} 