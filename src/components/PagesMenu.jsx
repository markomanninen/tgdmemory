import { Link } from 'react-router-dom';

const PagesMenu = () => {
  const diracLink = `${import.meta.env.BASE_URL}src/pages/dirac_propagator/index.html`;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 pt-24 sm:pt-32 pb-12 sm:pb-16">
      <div className="container mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Research Pages</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Explore detailed mathematical derivations, interactive content, and comprehensive analyses 
            of TGD (Topological Geometrodynamics) concepts and their applications.
          </p>
        </div>

        {/* Enhanced Pages Grid */}
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Dirac Propagator Page */}
          <div className="group bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 sm:p-8 text-white"> {/* Adjusted padding */}
              <div className="flex items-center justify-between mb-4 sm:mb-5"> {/* Adjusted margin */}
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Mathematical</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Dirac Propagator</h2>
              <p className="text-sky-100 text-sm sm:text-base">
                A comprehensive exploration of the Dirac propagator within the TGD framework.
              </p>
            </div>
            
            <div className="p-6 sm:p-8"> {/* Adjusted padding */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"> {/* Adjusted margin and spacing */}
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                  Mathematical derivations and proofs
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                  Mathematical derivations and proofs
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 3a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                  Interactive visualizations
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Code implementations
                </div>
              </div>
              
              <a 
                href={diracLink} 
                className="group/btn w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-base sm:text-lg"
              >
                <span>Explore Dirac Propagator</span>
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Placeholder for future pages */}
          <div className="group bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 overflow-hidden opacity-60">
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-6 sm:p-8 text-white"> {/* Adjusted padding */}
              <div className="flex items-center justify-between mb-4 sm:mb-5"> {/* Adjusted margin */}
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Coming Soon</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">TGD Many-Sheeted Space-time</h2>
              <p className="text-gray-200 text-sm sm:text-base">
                Detailed analysis of the many-sheeted space-time structure in TGD.
              </p>
            </div>
            
            <div className="p-6 sm:p-8"> {/* Adjusted padding */}
              <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 italic"> {/* Adjusted margin */}
                This comprehensive page will explore the fundamental concept of many-sheeted space-time, 
                including mathematical formulations, physical interpretations, and practical applications.
              </p>
              
              <button 
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center space-x-2 text-base sm:text-lg"
              >
                <span>In Development</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="group bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 overflow-hidden opacity-60">
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-6 sm:p-8 text-white"> {/* Adjusted padding */}
              <div className="flex items-center justify-between mb-4 sm:mb-5"> {/* Adjusted margin */}
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Coming Soon</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Quantum Memory Models</h2>
              <p className="text-gray-200 text-sm sm:text-base">
                Interactive comparison of classical and quantum memory models.
              </p>
            </div>
            
            <div className="p-6 sm:p-8"> {/* Adjusted padding */}
              <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 italic"> {/* Adjusted margin */}
                This page will provide an interactive exploration of different memory models, 
                from classical neural networks to quantum consciousness theories.
              </p>
              
              <button 
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center space-x-2 text-base sm:text-lg"
              >
                <span>In Development</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Contribute to TGD Research</h3> {/* Adjusted margin */}
            <p className="text-gray-600 mb-8 sm:text-lg"> {/* Adjusted margin */}
              Have ideas for new research pages or mathematical content? We welcome contributions 
              from researchers, students, and enthusiasts in the TGD community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact" 
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-base sm:text-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span>Contact Us</span>
              </Link>
              <Link 
                to="/" 
                className="bg-white text-sky-600 py-3 px-6 rounded-lg font-semibold hover:bg-sky-50 transition-all duration-200 shadow-md hover:shadow-lg border border-sky-200 flex items-center justify-center space-x-2 text-base sm:text-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
                <span>Back to Main</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesMenu;
