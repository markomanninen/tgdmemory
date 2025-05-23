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
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';

// Main content component for the home page
const MainContent = ({ sections, activeSection, scrollToSection, headerHeight }) => (
  // The Header is now rendered by the App component directly for all routes
  <main className="container mx-auto px-4 pt-24 pb-12">
    <IntroSection />
    <TgdCoreSection />
    <TgdMemorySection />
    <ImplicationsSection />
    <ConclusionSection />
    <ContactSection />
  </main>
);

export default function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sections = ['intro', 'tgd-core', 'tgd-memory', 'implications', 'conclusion', 'contact'];
  const headerHeight = 64; // Assuming a fixed header height
  const location = useLocation();

  const scrollToSection = (index) => {
    const sectionId = sections[index];
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      window.scrollTo({
        top: sectionElement.offsetTop - headerHeight,
        behavior: 'smooth',
      });
      setActiveSection(index);
    }
  };

  // Simplified useEffect for scroll listener - only for main page
  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        let currentIndex = 0;
        for (let i = 0; i < sections.length; i++) {
          const section = document.getElementById(sections[i]);
          if (section && window.scrollY >= section.offsetTop - headerHeight - 150) {
            currentIndex = i;
          }
        }
        setActiveSection(currentIndex);
        setShowBackToTop(window.scrollY > 300);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setShowBackToTop(false); // Hide back to top button on other pages
      setActiveSection(0); // Reset active section
    }
  }, [location.pathname, sections, headerHeight]);


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="bg-sky-50 text-gray-800 font-sans">
      {/* Render Header for all routes, passing necessary props */}
      <Header
        sections={sections}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
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

      {/* Footer */}
      <footer className="text-center py-10 text-gray-500 text-sm bg-white border-t border-gray-200">
        <p>Copyright &copy; {new Date().getFullYear()} - Marko T. Manninen</p>
      </footer>

      {/* Back to Top Button - only show if not on /pages and showBackToTop is true */}
      {showBackToTop && location.pathname === '/' && (
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