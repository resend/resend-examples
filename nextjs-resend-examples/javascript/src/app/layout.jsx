import './globals.css';

export const metadata = {
  title: 'Resend Examples - Next.js + JavaScript',
  description:
    'Comprehensive examples for sending emails with Resend and Next.js',
};

/**
 * Root Layout
 *
 * This layout wraps all pages in the application.
 * It provides consistent styling and metadata.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
