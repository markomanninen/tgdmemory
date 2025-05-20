// src/components/TgdMemorySection.jsx
import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function TgdMemorySection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });

  // Refs for Subsection 1: 4D Brain
  const [subTitle1Ref, subTitle1Visible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [content1Ref, content1Visible] = useIntersectionObserver({ threshold: 0.1, delay: 200 });
  const [diagram1Ref, diagram1Visible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  // Refs for Subsection 2: Magnetic Bodies and Holography
  const [subTitle2Ref, subTitle2Visible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [content2Ref, content2Visible] = useIntersectionObserver({ threshold: 0.1, delay: 200 });
  const [diagram2Ref, diagram2Visible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  // Refs for Subsection 3: SFRs & Subjective Time
  const [subTitle3Ref, subTitle3Visible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [content3Ref, content3Visible] = useIntersectionObserver({ threshold: 0.1, delay: 200 });
  const [diagram3Ref, diagram3Visible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  // Refs for Subsection 4: p-Adic Physics
  const [subTitle4Ref, subTitle4Visible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [content4TextRef, content4TextVisible] = useIntersectionObserver({ threshold: 0.1, delay: 200 }); // Renamed for clarity
  const [diagram4Ref, diagram4Visible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  return (
    <section id="tgd-memory" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center" aria-labelledby="tgd-memory-title">
      <h2 id="tgd-memory-title" ref={titleRef} className={`slide-title ${titleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}>The TGD Model of Memory: A 4D, Conscious Process</h2>
      
      {/* Subsection 1: Memory as a 4-Dimensional Construct in ZEO */}
      <div className="pt-8 content-text">
        <h3 
            ref={subTitle1Ref} 
            className={`text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-4 text-center ${subTitle1Visible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
            1. Memory as a 4-Dimensional Construct in ZEO – The "4D Brain"
        </h3>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div ref={content1Ref} className={`${content1Visible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <p>
              In ZEO, quantum states are superpositions of entire 4D spacetime surfaces. Memory is proposed to be fundamentally encoded in the 4D history (the spacetime surface) of the "self" (conscious entity), rather than solely in the present 3D brain state. This "4D brain" concept implies past experiences are part of the self's extended spacetime reality. Information about conscious quantum jumps is encoded into this 4D surface, facilitated by the proposed non-determinism of TGD's classical field equations.
            </p>
          </div>
          <div ref={diagram1Ref} className={`diagram-card ${diagram1Visible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <img
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram :+Self%27s+4D+Spacetime+History+(Memory+Encoded+in+Geometry)"
              alt="Diagram of 4D Brain in TGD"
              className="diagram-placeholder"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
              Self’s 4D Spacetime History (Memory Encoded in Geometry)
            </p>
          </div>
        </div>
      </div>

      {/* Subsection 2: Role of Magnetic Bodies (MB) and Holographic Principles */}
      <div className="mt-12 pt-10 border-t border-sky-100 content-text">
        <h3 
            ref={subTitle2Ref} 
            className={`text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-4 text-center ${subTitle2Visible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
            2. Role of Magnetic Bodies (MB) and Holographic Principles
        </h3>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div ref={diagram2Ref} className={`diagram-card order-last md:order-first ${diagram2Visible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <img
              src="https://placehold.co/600x450/e2e8f0/38bdf8?text=Diagram :+Magnetic+Body+Mediated+Memory+Encoding+%28Hologram+Formation%29+Recall+%28Phase+Conjugation%29"
              alt="Diagram of MB and Holographic Memory"
              className="diagram-placeholder"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
              Magnetic Body Mediated Memory Encoding (Hologram Formation), Recall (Phase Conjugation)
            </p>
          </div>
          <div ref={content2Ref} className={`${content2Visible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <p>The MB is hypothesized to actively participate in memory processes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Encoding:</strong> The MB may send "reference beams" (e.g., dark photons) that interfere with "object beams" (sensory input) to create holographic memory traces on biological structures.</li>
              <li><strong>Recall:</strong> The MB might send phase-conjugate beams to the geometric past, interacting with the hologram to generate a time-reversed mental image, which is then communicated to present consciousness. (Potential correlate: coupled ripple oscillations).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Subsection 3: State Function Reductions (SFRs) & Subjective Time */}
      <div className="mt-12 pt-10 border-t border-sky-100 content-text">
        <h3 
            ref={subTitle3Ref} 
            className={`text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-4 text-center ${subTitle3Visible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
            3. State Function Reductions (SFRs) & Subjective Time
        </h3>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div ref={content3Ref} className={`${content3Visible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>SSFRs (Small SFRs):</strong> Occur repeatedly, preserve the arrow of geometric time, constitute the "self's" subjective time flow and are associated with sensory perception.</li>
              <li><strong>BSRs (Big SFRs):</strong> More significant events potentially involving a change in the arrow of geometric time for a self or sub-self. Hypothesized as fundamental for motor action and conscious memory recall (accessing the geometric past).</li>
            </ul>
            <p className="mt-2">
              TGD thus views memory as an active re-experiencing of the 4D past, linked to consciousness (quantum jumps) and orchestrated by the MB.
            </p>
          </div>
          <div ref={diagram3Ref} className={`diagram-card ${diagram3Visible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <img
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram :+Subjective+Time+Flow+SSFRs+vs.+BSRs+in+Memory+Recall"
              alt="Diagram of SFRs and Subjective Time"
              className="diagram-placeholder"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
              Subjective Time Flow SSFRs vs BSRs in Memory Recall
            </p>
          </div>
        </div>
      </div>

      {/* Subsection 4: Cognitive Correlates: p-Adic Physics */}
      <div className="mt-12 pt-10 border-t border-sky-100 content-text">
        <h3 
            ref={subTitle4Ref} 
            className={`text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-4 text-center ${subTitle4Visible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
            4. Cognitive Correlates: p-Adic Physics
        </h3>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div 
            ref={diagram4Ref} 
            className={`diagram-card ${diagram4Visible ? 'animate-fadeInLeft' : 'opacity-0'} animation-delay-200`}
          >
            <img
              src="https://placehold.co/600x300/e2e8f0/38bdf8?text=Diagram :+Interface+of+p-Adic+%28Cognition%29+and+Real+%28Physical%29+Domains"
              alt="Diagram of p-Adic Physics in Cognition"
              className="diagram-placeholder"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
              Interface of p-Adic (Cognition) and Real (Physical) Domains
            </p>
          </div>
          <div ref={content4TextRef} className={`text-left ${content4TextVisible ? 'animate-fadeInRight' : 'opacity-0'} animation-delay-100`}> 
            <p className="mb-4">
              p-Adic spacetime regions are proposed as correlates of cognition and intention. Intentions (p-adic) may transform into actions (real) via p-adic-to-real phase transitions. Cognitive aspects of memory could involve interactions between real (sensory/memory traces) and p-adic (cognitive processing) sectors of the TGD universe.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
