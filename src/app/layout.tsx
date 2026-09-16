import type { Metadata } from 'next';
import './globals.css';
import { Github } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Sprint Derby',
  description: 'Pick a random person with a horse race. Add your team, run the race, the winner takes the task.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
          <a
            href="https://github.com/tomek-i/sprint-derby"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
            tomek-i/sprint-derby
          </a>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
