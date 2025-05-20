import { useEffect, useState } from 'react';
import ConclusionSection from './src/components/ConclusionSection';
import ImplicationsSection from './src/components/ImplicationsSection';
import IntroSection from './src/components/IntroSection';
import TgdCoreSection from './src/components/TgdCoreSection';
import TgdMemorySection from './src/components/TgdMemorySection';

export default function App() {
  const [activeSection, setActiveSection] = useState(0);
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

  // Scroll listener to update active section
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

  return (
    <div className="bg-sky-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white shadow-lg">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-xl md:text-2xl font-bold text-sky-700">TGD & Memory</div>
          <div className="flex space-x-4">
            {sections.map((id, idx) => (
              <button
                key={id}
                onClick={() => scrollToSection(idx)}
                className={`px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  activeSection === idx
                    ? 'text-sky-700 bg-sky-100 border-b-2 border-sky-600 font-semibold'
                    : 'text-gray-600 hover:text-sky-600'
                }`}
                aria-current={activeSection === idx ? 'page' : undefined}
              >
                {id === 'tgd-core' && 'TGD Core'}
                {id === 'tgd-memory' && 'TGD Memory Model'}
                {id === 'intro' && 'Introduction'}
                {id === 'implications' && 'Implications'}
                {id === 'conclusion' && 'Conclusion'}
              </button>
            ))}
          </div>
        </nav>
      </header>

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
    </div>
  );
}