import { ReactNode } from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import AssistantWidget from '@/components/AssistantWidget';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AssistantWidget />
    </div>
  );
}