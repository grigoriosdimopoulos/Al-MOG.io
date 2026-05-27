import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Al-MOG.io — Political Influencer Finder',
  description: 'AI-powered platform to find and rank social media influencers for political campaigns',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a1628] text-slate-200">
        {children}
      </body>
    </html>
  );
}
