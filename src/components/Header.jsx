// src/components/Header.jsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import Navigation from './Navigation';

export default function Header({ sections, activeSection, scrollToSection, isPagesView, clearMenuFocus }) {
  const menuButtonsRef = useRef([]);

  // Clear focus from all menu buttons when keyboard navigation is used
  useEffect(() => {
    if (clearMenuFocus) {
      menuButtonsRef.current.forEach(button => {
        if (button) button.blur();
      });
    }
  }, [clearMenuFocus]);
  return (
    <header className="fixed w-full top-0 z-50 backdrop-blur-xl border-b border-white/10">
      {/* Enhanced background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 to-transparent"></div>
      
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-sky-400 rounded-full blur-3xl animate-enhanced-pulse"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-blue-400 rounded-full blur-2xl animate-enhanced-pulse animation-delay-1000"></div>
      </div>
      
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative z-10">
        <Link to="/" className="group flex items-center space-x-3 text-white hover:text-sky-200 transition-all duration-300"> 
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-sky-500/25 transition-all duration-300 group-hover:scale-110">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold tracking-tight">Open Science</span>
            <span className="text-xs text-sky-300 tracking-wide">Research Center</span>
          </div>
        </Link>
        
        {/* Center navigation for main page sections */}
        {!isPagesView && (
          <div className="hidden md:flex space-x-2">
            {sections.map((id, idx) => (
              <button
                key={id}
                ref={el => menuButtonsRef.current[idx] = el}
                onClick={() => {
                  scrollToSection(idx);
                  // Blur the button after click to prevent focus state lingering
                  setTimeout(() => {
                    if (menuButtonsRef.current[idx]) {
                      menuButtonsRef.current[idx].blur();
                    }
                  }, 100);
                }}
                className={`group relative px-5 py-3 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden focus:outline-none ${
                  activeSection === idx
                    ? 'text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25'
                    : 'text-sky-100 hover:text-white hover:bg-white/10 focus:bg-white/10 backdrop-blur-sm'
                }`}
                aria-current={activeSection === idx ? 'page' : undefined}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                <span className="relative z-10">
                  {id === 'tgd-core' && 'TGD Core'}
                  {id === 'tgd-memory' && 'TGD Memory Model'}
                  {id === 'intro' && 'Introduction'}
                  {id === 'implications' && 'Implications'}
                  {id === 'conclusion' && 'Conclusion'}
                  {id === 'contact' && 'Contacts & Resources'}
                </span>
                
                {/* Active indicator */}
                {activeSection === idx && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Right side navigation */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/pages" 
            className="group flex items-center space-x-2 text-white hover:text-sky-200 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
            </svg>
            <span>Pages</span>
          </Link>
          <Link 
            to="/contact" 
            className="group flex items-center space-x-2 text-white hover:text-sky-200 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <span>Contact</span>
          </Link>
          <Navigation />
        </div>
      </nav>
    </header>
  );
}
