// src/components/ImplicationsSection.jsx
import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function ImplicationsSection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [subtitleRef, subtitleVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const [subSection1TitleRef, subSection1TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection1ContentRef, subSection1ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection2TitleRef, subSection2TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection2ContentRef, subSection2ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  return (
    <section id="implications" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center" aria-labelledby="implications-title">
      <h2 
        id="implications-title" 
        ref={titleRef} 
        className={`slide-title ${titleVisible ? 'animate-fadeIn' : 'opacity-0'}`}
      >
        Implications and Predictions of the TGD Model
      </h2>

      {/* Subsection 1: Predictions of Novel Physical Phenomena */}
      <div className="subsection-divider">
        <h4 
          ref={subSection1TitleRef} 
          className={`subsection-title ${subSection1TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Predictions of Novel Physical Phenomena
        </h4>
        <div 
          ref={subSection1ContentRef} 
          className={`diagram-adjacent-text-container content-text ${subSection1ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          {/* Text on the left */}
          <div className={`diagram-adjacent-text md:col-span-1 order-first ${subSection1ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <dl>
              <dt>Hierarchy of Planck Constants (h_eff):</dt>
              <dd>Predicts macroscopic quantum coherence in biological systems, potentially observable as novel bio-electromagnetic effects.</dd>
              <dt>Zero Energy Ontology (ZEO):</dt>
              <dd>Suggests that the arrow of time might not be fixed, allowing for phenomena like retrocausality in certain contexts (e.g., memory recall as seeing into the geometric past).</dd>
              <dt>Many-Sheeted Spacetime:</dt>
              <dd>Implies the existence of new forms of matter and energy (e.g., dark matter as h_eff phases, exotic particles confined to specific spacetime sheets).</dd>
              <dt>p-Adic Physics:</dt>
              <dd>Could lead to a physical basis for understanding intentionality and cognitive processes, potentially testable through their influence on physical systems.</dd>
            </dl>
          </div>
          {/* Diagram on the right */}
          <div className={`diagram-card md:col-span-1 order-last ${subSection1ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <img 
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Novel+Physics"
              alt="Diagram of Novel Physical Phenomena in TGD"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: Novel Physical Phenomena</p>
          </div>
        </div>
      </div>

      {/* Subsection 2: Implications for Understanding Consciousness and Biology */}
      <div className="subsection-divider">
        <h4 
          ref={subSection2TitleRef} 
          className={`subsection-title ${subSection2TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Implications for Understanding Consciousness and Biology
        </h4>
        <div 
          ref={subSection2ContentRef} 
          className={`diagram-adjacent-text-container content-text ${subSection2ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          {/* Diagram on the left */}
          <div className={`diagram-card md:col-span-1 order-first ${subSection2ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <img 
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Consciousness+%26+Biology"
              alt="Diagram of TGD Implications for Consciousness and Biology"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: Consciousness & Biology</p>
          </div>
          {/* Text on the right */}
          <div className={`diagram-adjacent-text md:col-span-1 order-last ${subSection2ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <dl>
              <dt>Nature of Subjective Experience:</dt>
              <dd>TGD offers a framework where subjective experience is primary, linked to quantum jumps and the hierarchy of selves.</dd>
              <dt>Biological Self-Organization:</dt>
              <dd>Magnetic bodies and the hierarchy of h_eff provide mechanisms for the coordinated behavior of complex biological systems, beyond standard biochemical explanations.</dd>
              <dt>New Approaches to Healing:</dt>
              <dd>Understanding the role of magnetic bodies and dark photons could lead to novel therapeutic interventions based on electromagnetic fields.</dd>
              <dt>Evolution of Consciousness:</dt>
              <dd>The TGD framework suggests that evolution involves not just biological adaptation but also an increase in the complexity and levels of consciousness, driven by the expansion of the h_eff hierarchy.</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
