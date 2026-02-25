/**
 * Root Layout
 *
 * This layout wraps all pages in the application.
 * It provides consistent styling and metadata.
 */

import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Resend Examples - TanStack Start + JavaScript' },
    ],
  }),
});

function RootLayout() {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, minHeight: '100vh' }}>
        <Outlet />
      </body>
    </html>
  );
}
