import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function TgdCoreSection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [subtitleRef, subtitleVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const [subSection1TitleRef, subSection1TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection1ContentRef, subSection1ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection2TitleRef, subSection2TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection2ContentRef, subSection2ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  return (
    <section id="tgd-core" className="section py-20 md:py-32 relative min-h-screen flex flex-col justify-center" aria-labelledby="tgd-core-title">
      <div className="relative z-10">
        <h2 
          id="tgd-core-title" 
          ref={titleRef} 
          className={`text-4xl md:text-5xl lg:text-6xl font-black text-center mb-6 md:mb-8 ${titleVisible ? 'animate-fadeIn' : 'opacity-0'} gradient-text`}
        >
          Core Concepts of Topological Geometrodynamics (TGD)
        </h2>

        {/* Subsection 1: Fundamental Spacetime and Quantum Concepts */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4 
            ref={subSection1TitleRef} 
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection1TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Fundamental Spacetime and Quantum Concepts
          </h4>
          <div 
            ref={subSection1ContentRef} 
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection1ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`space-y-6 ${subSection1ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">Many-Sheeted Spacetime:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">TGD posits a hierarchical structure of spacetime sheets, allowing for a complex interplay of physical systems at different scales. This contrasts with the single, monolithic spacetime of General Relativity.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Zero Energy Ontology (ZEO):</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">In ZEO, physical states are superpositions of histories, and quantum jumps recreate these histories. This provides a basis for understanding the flow of subjective time and intentional action.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Hierarchy of Planck Constants:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">TGD proposes a hierarchy of effective Planck constants (h_eff = n * h), suggesting that macroscopic quantum coherence can occur at larger scales than predicted by standard quantum mechanics. This is crucial for biological systems.</dd>
              </dl>
            </div>
            <div className={`enhanced-card hover-lift ${subSection1ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <img 
                src="manysheeted_spacetime.png"
                alt="Diagram of TGD Spacetime and Quantum Concepts"
                className="w-full h-auto object-contain rounded-lg shadow-md border border-gray-300 bg-gray-50"
              />
              <p className="text-center text-sm text-gray-500 mt-4 italic">TGD: Spacetime & Quantum Concepts</p>
            </div>
          </div>
        </div>

        {/* Subsection 2: Field Bodies and Cognitive Correlates */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4 
            ref={subSection2TitleRef} 
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection2TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Field Bodies and Cognitive Correlates
          </h4>
          <div 
            ref={subSection2ContentRef} 
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection2ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`enhanced-card hover-lift ${subSection2ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <img 
                src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Field+Bodies+%26+Cognition"
                alt="Diagram of TGD Field Bodies and Cognitive Correlates"
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md border border-gray-300 bg-gray-50"
              />
              <p className="text-center text-sm text-gray-500 mt-4 italic">TGD: Field Bodies & Cognitive Correlates</p>
            </div>
            <div className={`space-y-6 ${subSection2ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">Magnetic Bodies (MB):</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Each physical system is proposed to have an associated magnetic body, an onion-like structure of magnetic flux sheets. MBs are carriers of dark matter (as h_eff phases) and serve as a higher-level controller of the biological body.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">p-Adic Physics as Correlate of Cognition:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">TGD introduces p-adic number fields as correlates of cognition and intention. This mathematical framework allows for a description of cognitive representations and processes that are distinct from, yet interact with, real (sensory) physics.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Negentropic Entanglement (NE):</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">A key concept related to h_eff, NE is proposed to be a correlate of conscious information, attention, and understanding. It is stable under quantum jumps and provides a basis for the formation of coherent conscious experiences.</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
