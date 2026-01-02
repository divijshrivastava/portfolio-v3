import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portfolio | Senior Software Engineer',
  description: 'Portfolio of a Senior Software Engineer specializing in Java and Angular.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
