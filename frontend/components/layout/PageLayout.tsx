import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHero?: boolean;
}

export function PageLayout({ 
  children, 
  title, 
  subtitle,
  showHero = false 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {showHero && title && (
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-16 md:py-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}