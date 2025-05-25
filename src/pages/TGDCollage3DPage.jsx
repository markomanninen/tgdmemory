import { Link } from 'react-router-dom';
import TGDCollage3D from '../components/TGDCollage3D';

const TGDCollage3DPage = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Back navigation */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <Link
          to="/pages"
          className="group flex items-center space-x-2 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white px-4 py-2 rounded-lg transition-all duration-300 border border-white/20"
        >
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          <span>Back to Pages</span>
        </Link>
      </div>
      
      {/* Title overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-center">
        <div className="bg-black/30 backdrop-blur-md rounded-lg px-6 py-3 text-white">
          <h1 className="text-2xl font-bold mb-1">TGD Memory Lattice</h1>
          <p className="text-sm text-gray-300">Interactive 3D Visualization of Quantum Memory Structures</p>
        </div>
      </div>
      
      {/* 3D Collage Component */}
      <TGDCollage3D />
    </div>
  );
};

export default TGDCollage3DPage;
