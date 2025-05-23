import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function TgdCoreSection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [subtitleRef, subtitleVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const [subSection1TitleRef, subSection1TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection1ContentRef, subSection1ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection2TitleRef, subSection2TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection2ContentRef, subSection2ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  return (
    <section id="tgd-core" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center" aria-labelledby="tgd-core-title">
      <h2 
        id="tgd-core-title" 
        ref={titleRef} 
        className={`slide-title ${titleVisible ? 'animate-fadeIn' : 'opacity-0'}`}
      >
        Core Concepts of Topological Geometrodynamics (TGD)
      </h2>

      {/* Subsection 1: Fundamental Spacetime and Quantum Concepts */}
      <div className="subsection-divider">
        <h4 
          ref={subSection1TitleRef} 
          className={`subsection-title ${subSection1TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Fundamental Spacetime and Quantum Concepts
        </h4>
        <div 
          ref={subSection1ContentRef} 
          className={`diagram-adjacent-text-container unified-content ${subSection1ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-adjacent-text md:col-span-1 ${subSection1ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <dl>
              <dt>Many-Sheeted Spacetime:</dt>
              <dd>TGD posits a hierarchical structure of spacetime sheets, allowing for a complex interplay of physical systems at different scales. This contrasts with the single, monolithic spacetime of General Relativity.</dd>
              <dt>Zero Energy Ontology (ZEO):</dt>
              <dd>In ZEO, physical states are superpositions of histories, and quantum jumps recreate these histories. This provides a basis for understanding the flow of subjective time and intentional action.</dd>
              <dt>Hierarchy of Planck Constants:</dt>
              <dd>TGD proposes a hierarchy of effective Planck constants (h_eff = n * h), suggesting that macroscopic quantum coherence can occur at larger scales than predicted by standard quantum mechanics. This is crucial for biological systems.</dd>
            </dl>
          </div>
          <div className={`diagram-card md:col-span-1 ${subSection1ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <img 
              src="manysheeted_spacetime.png"
              alt="Diagram of TGD Spacetime and Quantum Concepts"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: Spacetime & Quantum Concepts</p>
          </div>
        </div>
      </div>

      {/* Subsection 2: Field Bodies and Cognitive Correlates */}
      <div className="subsection-divider">
        <h4 
          ref={subSection2TitleRef} 
          className={`subsection-title ${subSection2TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Field Bodies and Cognitive Correlates
        </h4>
        <div 
          ref={subSection2ContentRef} 
          className={`diagram-adjacent-text-container unified-content ${subSection2ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-card md:col-span-1 order-first ${subSection2ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <img 
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Field+Bodies+%26+Cognition"
              alt="Diagram of TGD Field Bodies and Cognitive Correlates"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: Field Bodies & Cognitive Correlates</p>
          </div>
          <div className={`diagram-adjacent-text md:col-span-1 order-last ${subSection2ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <dl>
              <dt>Magnetic Bodies (MB):</dt>
              <dd>Each physical system is proposed to have an associated magnetic body, an onion-like structure of magnetic flux sheets. MBs are carriers of dark matter (as h_eff phases) and serve as a higher-level controller of the biological body.</dd>
              <dt>p-Adic Physics as Correlate of Cognition:</dt>
              <dd>TGD introduces p-adic number fields as correlates of cognition and intention. This mathematical framework allows for a description of cognitive representations and processes that are distinct from, yet interact with, real (sensory) physics.</dd>
              <dt>Negentropic Entanglement (NE):</dt>
              <dd>A key concept related to h_eff, NE is proposed to be a correlate of conscious information, attention, and understanding. It is stable under quantum jumps and provides a basis for the formation of coherent conscious experiences.</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
