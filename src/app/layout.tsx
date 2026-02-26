/**
 * Root Layout
 * 
 * Next.js App Router root layout.
 * Applies global fonts, meta, and the Redux + Theme providers.
 */

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/shared/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'AppBuilder — Low-Code Application Builder',
  description:
    'Design, configure, and build production-ready Android, iOS, and Web applications with a high-fidelity drag-and-drop GUI.',
  keywords: ['app builder', 'low-code', 'no-code', 'drag and drop', 'react', 'flutter'],
  authors: [{ name: 'AppBuilder Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
