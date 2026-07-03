import '../index.css';
import React from 'react';
import type { Metadata } from 'next';
import { SettingsInitializer } from '@/components/layout/SettingsInitializer';
import { DeveloperBadge } from '@/features/developer-badge';

export const metadata: Metadata = {
  title: 'Next Billionaire Path',
  description: 'Next Billionaire Path application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SettingsInitializer />
        {children}
        <DeveloperBadge />
      </body>
    </html>
  );
}
