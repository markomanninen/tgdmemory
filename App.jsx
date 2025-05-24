import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import CommentableContent from './src/components/CommentableContent';
import ConclusionSection from './src/components/ConclusionSection';
import ContactSection from './src/components/ContactSection';
import Header from './src/components/Header';
import ImplicationsSection from './src/components/ImplicationsSection';
import IntroSection from './src/components/IntroSection';
import PagesMenu from './src/components/PagesMenu';
import ProtectedRoute from './src/components/ProtectedRoute';
import TgdCoreSection from './src/components/TgdCoreSection';
import TgdMemorySection from './src/components/TgdMemorySection';
import AdminDashboard from './src/pages/AdminDashboard';
import AdminDebug from './src/pages/AdminDebug';
import ContactPage from './src/pages/ContactPage';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';

// Main content component for the home page
const MainContent = ({ sections, activeSection, scrollToSection, headerHeight }) => (
  // The Header is now rendered by the App component directly for all routes
  <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
    <div className="enhanced-card mb-12 backdrop-blur-xl bg-white/40 border border-white/30">
      <IntroSection />
    </div>
    <div className="enhanced-card mb-12 backdrop-blur-xl bg-white/40 border border-white/30">
      <TgdCoreSection />
    </div>
    <div className="enhanced-card mb-12 backdrop-blur-xl bg-white/40 border border-white/30">
      <TgdMemorySection />
    </div>
    <div className="enhanced-card mb-12 backdrop-blur-xl bg-white/40 border border-white/30">
      <ImplicationsSection />
    </div>
    <div className="enhanced-card mb-12 backdrop-blur-xl bg-white/40 border border-white/30">
      <ConclusionSection />
    </div>
    <div className="enhanced-card backdrop-blur-xl bg-white/40 border border-white/30">
      <ContactSection />
    </div>
  </main>
);

export default function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const [clearMenuFocus, setClearMenuFocus] = useState(false);
  const sections = ['intro', 'tgd-core', 'tgd-memory', 'implications', 'conclusion', 'contact'];
  const headerHeight = 64; // Assuming a fixed header height
  const location = useLocation();

  // Check for mobile device for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToSection = (index, isKeyboardNav = false) => {
    const sectionId = sections[index];
    
    const sectionElement = document.getElementById(sectionId);
    
    if (sectionElement) {
      // Always set flag to prevent scroll handler interference during any navigation
      setIsKeyboardNavigating(true);
      
      // Use manual calculation to account for fixed header
      const rect = sectionElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop - headerHeight - 20; // Extra padding for better UX
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
      
      setActiveSection(index);
      
      // Clear the navigation flag after scroll animation completes
      setTimeout(() => {
        setIsKeyboardNavigating(false);
      }, 800); // Slightly longer than typical smooth scroll duration
    }
  };

  // Simplified useEffect for scroll listener - only for main page
  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        // Skip scroll-based active section detection during keyboard navigation
        if (isKeyboardNavigating) {
          return;
        }
        
        let currentIndex = 0;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        for (let i = 0; i < sections.length; i++) {
          const section = document.getElementById(sections[i]);
          if (section) {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const threshold = sectionTop - headerHeight - 100; // Smaller threshold for better UX
            
            if (scrollY >= threshold) {
              currentIndex = i;
            }
          }
        }
        
        setActiveSection(currentIndex);
        setShowBackToTop(scrollY > 300);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setShowBackToTop(false); // Hide back to top button on other pages
      setActiveSection(0); // Reset active section
    }
  }, [location.pathname, sections, headerHeight, isKeyboardNavigating]);

  // Keyboard navigation for menu items - left/right arrow keys
  useEffect(() => {
    if (location.pathname === '/') {
      const handleKeyDown = (event) => {
        // Only handle keyboard navigation when not focused on input elements
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
          return;
        }

        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            // Clear focus from menu buttons and trigger keyboard navigation
            setClearMenuFocus(prev => !prev); // Toggle to trigger useEffect
            const prevIndex = activeSection > 0 ? activeSection - 1 : sections.length - 1;
            scrollToSection(prevIndex, true); // true indicates keyboard navigation
            break;
          case 'ArrowRight':
            event.preventDefault();
            // Clear focus from menu buttons and trigger keyboard navigation
            setClearMenuFocus(prev => !prev); // Toggle to trigger useEffect
            const nextIndex = activeSection < sections.length - 1 ? activeSection + 1 : 0;
            scrollToSection(nextIndex, true); // true indicates keyboard navigation
            break;
          default:
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [location.pathname, activeSection, sections, scrollToSection]);

  // Hash navigation support for anchor links
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      // Remove the # from the hash to get the section id
      const sectionId = location.hash.substring(1);
      const sectionIndex = sections.indexOf(sectionId);
      
      if (sectionIndex !== -1) {
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          scrollToSection(sectionIndex);
        }, 100);
      }
    }
  }, [location.pathname, location.hash, sections, scrollToSection]);

  // Ensure non-main pages scroll to top
  useEffect(() => {
    if (location.pathname !== '/') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative min-h-screen">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-sky-50/50 to-blue-100/70 pointer-events-none z-[-1]"></div>
      
      {/* TGD-Themed Geometric Spacetime Animation System */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        {/* Spacetime Tessellation Grid */}
        <div className="absolute inset-0 spacetime-grid opacity-20"></div>
        
        {/* Wormhole Portals */}
        {!isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 wormhole-portal animate-wormhole-rotate animation-delay-0"></div>
            <div className="absolute top-3/4 right-1/3 w-48 h-48 wormhole-portal animate-wormhole-rotate animation-delay-2000"></div>
            <div className="absolute top-1/2 right-1/4 w-32 h-32 wormhole-portal animate-wormhole-rotate animation-delay-4000"></div>
          </>
        )}
        
        {/* Many-Sheeted Spacetime Layers */}
        <div className="absolute top-20 left-20 spacetime-sheet animate-sheet-drift animation-delay-1000"></div>
        <div className="absolute bottom-32 right-20 spacetime-sheet animate-sheet-drift animation-delay-3000"></div>
        {!isMobile && (
          <>
            <div className="absolute top-1/3 right-1/2 spacetime-sheet animate-sheet-drift animation-delay-1500"></div>
            <div className="absolute bottom-1/4 left-1/3 spacetime-sheet animate-sheet-drift animation-delay-2500"></div>
          </>
        )}
        
        {/* Topological Defects (strings/monopoles) */}
        {!isMobile && (
          <>
            <div className="absolute top-1/6 left-1/2 topological-string animate-string-vibrate animation-delay-500"></div>
            <div className="absolute bottom-1/6 right-1/2 topological-string animate-string-vibrate animation-delay-1500"></div>
            <div className="absolute top-2/3 left-1/6 topological-string animate-string-vibrate animation-delay-2500"></div>
          </>
        )}
        
        {/* Quantum Coherence Regions */}
        <div className="absolute top-1/2 left-1/3 coherence-region animate-coherence-pulse animation-delay-800"></div>
        <div className="absolute bottom-1/3 right-1/4 coherence-region animate-coherence-pulse animation-delay-1800"></div>
        {!isMobile && (
          <>
            <div className="absolute top-1/4 right-1/6 coherence-region animate-coherence-pulse animation-delay-1200"></div>
            <div className="absolute bottom-1/2 left-1/6 coherence-region animate-coherence-pulse animation-delay-2200"></div>
          </>
        )}
        
        {/* Flux Tubes (TGD characteristic structures) */}
        {!isMobile && (
          <>
            <div className="absolute top-10 left-1/3 flux-tube animate-flux-flow animation-delay-600"></div>
            <div className="absolute bottom-10 right-1/3 flux-tube animate-flux-flow animation-delay-1600"></div>
            <div className="absolute top-1/2 left-10 flux-tube vertical animate-flux-flow animation-delay-2600"></div>
            <div className="absolute top-1/2 right-10 flux-tube vertical animate-flux-flow animation-delay-3600"></div>
          </>
        )}
        
        {/* Mobile-optimized geometric elements */}
        {isMobile && (
          <>
            <div className="absolute top-1/3 right-1/4 w-32 h-32 wormhole-portal animate-wormhole-rotate animation-delay-1000"></div>
            <div className="absolute bottom-1/3 left-1/4 spacetime-sheet animate-sheet-drift animation-delay-2000"></div>
          </>
        )}
      </div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-[-1]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.3) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Render Header for all routes, passing necessary props */}
      <Header
        sections={sections}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        clearMenuFocus={clearMenuFocus}
        // Pass a flag or modify sections prop if header content needs to change for /pages
        isPagesView={location.pathname === '/pages'}
      />
      <Routes>
        <Route path="/" element={
          <CommentableContent pageUrl="/">
            <MainContent
              sections={sections}
              activeSection={activeSection}
              scrollToSection={scrollToSection}
              headerHeight={headerHeight}
            />
          </CommentableContent>
        } />
        <Route path="/pages" element={
          // PagesMenu will be rendered below the global Header
          <PagesMenu />
        } />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/debug" element={
          <ProtectedRoute requiredRoles={["admin"]}>
            <AdminDebug />
          </ProtectedRoute>
        } />
      </Routes>

      {/* Enhanced Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-20 border-t border-slate-700/50 overflow-hidden">
        {/* Footer Background Effects */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-sky-500/10 to-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-sky-600/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TGD & Memory Research
              </h3>
              <p className="text-slate-300 max-w-3xl mx-auto text-lg leading-relaxed">
                Exploring the frontiers of consciousness and memory through Topological Geometrodynamics
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-white/10 hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span className="block font-semibold text-white mb-2 text-lg">Research</span>
                <span className="text-slate-300">Quantum Consciousness</span>
              </div>
              <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-white/10 hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="block font-semibold text-white mb-2 text-lg">Theory</span>
                <span className="text-slate-300">TGD Framework</span>
              </div>
              <div className="backdrop-blur-sm bg-white/5 p-6 rounded-xl border border-white/10 hover-lift">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="block font-semibold text-white mb-2 text-lg">Applications</span>
                <span className="text-slate-300">Memory Models</span>
              </div>
            </div>
            
            <div className="border-t border-slate-700/50 pt-8">
              <p className="text-slate-400 text-sm">
                Copyright &copy; {new Date().getFullYear()} - Open Science Center. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced Back to Top Button */}
      {showBackToTop && location.pathname === '/' && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 group z-50"
          aria-label="Scroll to top"
        >
          <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:via-sky-700 hover:to-blue-700 text-white font-bold p-4 rounded-full shadow-2xl transition-all duration-300 ease-in-out backdrop-blur-sm border border-white/20 hover:scale-110 relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform duration-300 relative z-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}