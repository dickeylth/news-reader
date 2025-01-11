import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#f5f5f5',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Hacker News Reader',
  description: 'A modern Hacker News reader with AI Copilot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={inter.className}>
      <body>
        <header className="bg-orange-500 p-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-white">Hacker News Reader</h1>
        </header>
        {children}
      </body>
    </html>
  );
} 