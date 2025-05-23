// src/components/Header.jsx
import { Link } from 'react-router-dom'; // Import Link
import Navigation from './Navigation';

export default function Header({ sections, activeSection, scrollToSection, isPagesView }) {
  return (
    <header className="fixed w-full top-0 z-50 bg-sky-600 shadow-lg">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl md:text-2xl font-bold text-white hover:text-sky-200"> {/* Link to home */}
          TGD & Memory
        </Link>
        
        {/* Center navigation for main page sections */}
        {!isPagesView && (
          <div className="flex space-x-4">
            {sections.map((id, idx) => (
              <button
                key={id}
                onClick={() => scrollToSection(idx)}
                className={`px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  activeSection === idx
                    ? 'text-sky-100 bg-sky-700 border-b-2 border-sky-200 font-semibold'
                    : 'text-sky-100 hover:text-white'
                }`}
                aria-current={activeSection === idx ? 'page' : undefined}
              >
                {id === 'tgd-core' && 'TGD Core'}
                {id === 'tgd-memory' && 'TGD Memory Model'}
                {id === 'intro' && 'Introduction'}
                {id === 'implications' && 'Implications'}
                {id === 'conclusion' && 'Conclusion'}
                {id === 'contact' && 'Contacts & Resources'}
              </button>
            ))}
          </div>
        )}
        
        {/* Right side navigation */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/pages" 
            className="text-white hover:text-sky-200 transition-colors duration-200"
          >
            Pages
          </Link>
          <Navigation />
        </div>
      </nav>
    </header>
  );
}
