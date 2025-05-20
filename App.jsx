import { useEffect, useState } from 'react';
import ConclusionSection from './src/components/ConclusionSection';
import Header from './src/components/Header'; // Import Header component
import ImplicationsSection from './src/components/ImplicationsSection';
import IntroSection from './src/components/IntroSection';
import TgdCoreSection from './src/components/TgdCoreSection';
import TgdMemorySection from './src/components/TgdMemorySection';

export default function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false); // State for Back to Top button
  const sections = ['intro', 'tgd-core', 'tgd-memory', 'implications', 'conclusion'];
  const headerHeight = 64;

  const scrollToSection = (index) => {
    const section = document.getElementById(sections[index]);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - headerHeight,
        behavior: 'smooth',
      });
      setActiveSection(index);
    }
  };

  // Scroll listener to update active section and show/hide Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      let index = 0;
      for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        if (
          section &&
          window.scrollY >= section.offsetTop - headerHeight - 150
        ) {
          index = i;
        }
      }
      setActiveSection(index);

      // Show Back to Top button if scrolled down enough
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement !== document.body) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeSection < sections.length - 1) {
          scrollToSection(activeSection + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeSection > 0) {
          scrollToSection(activeSection - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="bg-sky-50 text-gray-800 font-sans">
      <Header sections={sections} activeSection={activeSection} scrollToSection={scrollToSection} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <IntroSection />
        <TgdCoreSection />
        <TgdMemorySection />
        <ImplicationsSection />
        <ConclusionSection />
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-500 text-sm bg-white border-t border-gray-200">
        <p>Presentation based on concepts from Topological Geometrodynamics by Matti Pitkänen.</p>
      </footer>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-full shadow-lg transition-opacity duration-300 ease-in-out z-50"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          </svg>
        </button>
      )}
    </div>
  );
}