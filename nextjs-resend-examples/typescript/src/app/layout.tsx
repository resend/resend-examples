import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resend Examples - Next.js + TypeScript',
  description:
    'Comprehensive examples for sending emails with Resend and Next.js',
};

/**
 * Root Layout
 *
 * This layout wraps all pages in the application.
 * It provides consistent styling and metadata.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
