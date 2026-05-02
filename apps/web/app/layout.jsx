import './globals.css';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '../components/ThemeProvider';

export const metadata = {
  title: 'FredoFlow | Collaborative Workspace',
  description: 'The premium hub for teams to align, track, and succeed.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-zinc-900 dark:text-white dark:border dark:border-zinc-800',
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
