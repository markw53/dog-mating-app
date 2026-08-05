import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'DogMate - Find the Perfect Match',
    template: '%s | DogMate',
  },
  description: 'Connect with verified dog breeders for responsible breeding',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DogMate',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
