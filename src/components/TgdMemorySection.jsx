// src/components/TgdMemorySection.jsx
import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function TgdMemorySection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [subtitleRef, subtitleVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const [subSection1TitleRef, subSection1TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection1ContentRef, subSection1ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection2TitleRef, subSection2TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection2ContentRef, subSection2ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection3TitleRef, subSection3TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection3ContentRef, subSection3ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection4TitleRef, subSection4TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection4ContentRef, subSection4ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  return (
    <section id="tgd-memory" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center" aria-labelledby="tgd-memory-title">
      <h2 
        id="tgd-memory-title" 
        ref={titleRef} 
        className={`slide-title ${titleVisible ? 'animate-fadeIn' : 'opacity-0'}`}
      >
        The TGD Model of Memory
      </h2>

      {/* Subsection 1: Memory in Zero Energy Ontology (ZEO) */}
      <div className="subsection-divider">
        <h4 
          ref={subSection1TitleRef} 
          className={`subsection-title ${subSection1TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Memory in Zero Energy Ontology (ZEO)
        </h4>
        <div 
          ref={subSection1ContentRef} 
          className={`diagram-adjacent-text-container content-text ${subSection1ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-adjacent-text md:col-span-1 ${subSection1ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <dl>
              <dt>Episodic Memories as Re-Experiences:</dt>
              <dd>In TGD, episodic memories are not stored representations but actual re-experiences of a past event. This is achieved by quantum jumping to a state where the sub-self (mental image) corresponding to the memory is briefly re-activated in the geometric past.</dd>
              <dt>Role of Magnetic Bodies:</dt>
              <dd>The magnetic body (MB) plays a crucial role. It can initiate memory recall by sending signals (e.g., dark photons) that resonate with specific brain circuits, effectively 'lighting up' a past experience. The MB acts as the 'experiencer' of these re-created mental images.</dd>
            </dl>
          </div>
          <div className={`diagram-card md:col-span-1 ${subSection1ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <img 
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+ZEO+Memory+Recall"
              alt="Diagram of TGD ZEO Memory Recall"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: Memory Recall in ZEO</p>
          </div>
        </div>
      </div>

      {/* Subsection 2: Time, Self, and the Hierarchy of Selves */}
      <div className="subsection-divider">
        <h4 
          ref={subSection2TitleRef} 
          className={`subsection-title ${subSection2TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Time, Self, and the Hierarchy of Selves
        </h4>
        <div 
          ref={subSection2ContentRef} 
          className={`diagram-adjacent-text-container content-text ${subSection2ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-card md:col-span-1 order-first ${subSection2ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <img 
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Hierarchy+of+Selves"
              alt="Diagram of TGD Hierarchy of Selves"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: Hierarchy of Selves & Time Perception</p>
          </div>
          <div className={`diagram-adjacent-text md:col-span-1 order-last ${subSection2ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <dl>
              <dt>Subjective vs. Geometric Time:</dt>
              <dd>TGD distinguishes between subjective time (sequence of quantum jumps) and geometric time (coordinate time of spacetime). Memories are located in geometric past, but re-experienced in the subjective present of the self.</dd>
              <dt>Hierarchy of Selves:</dt>
              <dd>Consciousness is organized into a hierarchy of selves, where selves at higher levels have longer-lasting conscious experiences and integrate information from lower-level selves. This hierarchy is reflected in the structure of magnetic bodies.</dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Subsection 3: Negentropic Entanglement and Memory Formation */}
      <div className="subsection-divider">
        <h4 
          ref={subSection3TitleRef} 
          className={`subsection-title ${subSection3TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Negentropic Entanglement and Memory Formation
        </h4>
        <div 
          ref={subSection3ContentRef} 
          className={`diagram-adjacent-text-container content-text ${subSection3ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-adjacent-text md:col-span-1 ${subSection3ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <dl>
              <dt>Negentropic Entanglement (NE):</dt>
              <dd>NE, possible in the intersection of real and p-adic worlds, is proposed as a correlate of conscious information, attention, and understanding. It is stable and can be preserved across quantum jumps, forming the basis of memory engrams as stable patterns of NE.</dd>
              <dt>Memory Engrams as NE Patterns:</dt>
              <dd>Instead of synaptic strengths, memory engrams could be fundamentally patterns of NE at the level of magnetic bodies, connecting different brain regions or even different selves in the hierarchy.</dd>
            </dl>
          </div>
          <div className={`diagram-card md:col-span-1 ${subSection3ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <img 
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Negentropic+Entanglement"
              alt="Diagram of TGD Negentropic Entanglement"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: Negentropic Entanglement & Memory</p>
          </div>
        </div>
      </div>

      {/* Subsection 4: Cognitive Correlates: p-Adic Physics */}
      <div className="subsection-divider">
        <h4 
          ref={subSection4TitleRef} 
          className={`subsection-title ${subSection4TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Cognitive Correlates: p-Adic Physics
        </h4>
        <div 
          ref={subSection4ContentRef} 
          className={`diagram-adjacent-text-container content-text ${subSection4ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-card md:col-span-1 order-first ${subSection4ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <img 
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+p-Adic+Cognition"
              alt="Diagram of TGD p-Adic Physics and Cognition"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: p-Adic Physics & Cognitive Representation</p>
          </div>
          <div className={`diagram-adjacent-text md:col-span-1 order-last ${subSection4ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <dl>
              <dt>p-Adic Spacetime Sheets as Cognitive Representations:</dt>
              <dd>p-Adic spacetime sheets are interpreted as geometric correlates of cognitive representations, intentions, and plans. They provide a mathematical framework for understanding the non-deterministic and information-rich nature of thought.</dd>
              <dt>Transformation of Intention to Action:</dt>
              <dd>Cognitive processes (p-adic) can transform into real physical actions (real physics) via quantum jumps that convert p-adic spacetime sheets to real ones. This is fundamental for understanding how intentions lead to actions.</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
