import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
import { QueryProvider } from '@/lib/query-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DisasterEye AI — AI-Powered Disaster Detection & Emergency Coordination',
  description: 'AI-powered emergency management platform for governments, NGOs, rescue teams, and citizens. Detect disasters, assess severity, coordinate rescue operations, and provide real-time assistance.',
  keywords: ['disaster management', 'AI disaster detection', 'emergency response', 'relief management', 'rescue coordination'],
  openGraph: {
    title: 'DisasterEye AI',
    description: 'AI That Saves Lives During Disasters',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
