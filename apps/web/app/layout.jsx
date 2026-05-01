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
