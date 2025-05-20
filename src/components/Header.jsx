// src/components/Header.jsx
export default function Header({ sections, activeSection, scrollToSection }) {
  return (
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
  );
}
