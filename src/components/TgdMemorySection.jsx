// src/components/TgdMemorySection.jsx
import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function TgdMemorySection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [subtitleRef, subtitleVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' }); // Assuming subtitleRef is still used or planned

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
      {/* Optional: Subtitle if you plan to use it
      <h3
        ref={subtitleRef}
        className={`slide-subtitle ${subtitleVisible ? 'animate-slideUp' : 'opacity-0'} animation-delay-200`}
      >
        Delving into the 4-Dimensional, Conscious Process
      </h3>
      */}

      {/* Subsection 1: Memory, the 4D Brain, and Magnetic Body Action in ZEO */}
      <div className="subsection-divider">
        <h4
          ref={subSection1TitleRef}
          className={`subsection-title ${subSection1TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Memory, the 4D Brain, and Magnetic Body Action in ZEO
        </h4>
        <div
          ref={subSection1ContentRef}
          className={`diagram-adjacent-text-container unified-content ${subSection1ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-adjacent-text md:col-span-1 ${subSection1ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <dl>
              <dt>The 4D Brain & Memory Encoding:</dt>
              <dd>In ZEO, memories are not just stored in 3D neural patterns. Instead, TGD proposes a "4D brain," where the conscious history of a self is encoded in the 4-dimensional spacetime surface associated with it. Past quantum jumps (conscious moments) embed information about themselves into the geometry and topology of this 4D surface. This is possible due to the slight non-determinism of TGD's fundamental field equations (Kähler action), allowing the 4D spacetime "Bohr orbit" to be rich enough to carry historical information.</dd>
              <dt>Episodic Memories as Re-Experiences:</dt>
              <dd>Thus, episodic memories are not passive playbacks but can be actual re-experiences or a re-illumination of a segment of this 4D past. This is achieved by quantum jumping to a state where the sub-self (mental image) corresponding to the memory is briefly re-activated in the geometric past.</dd>
              <dt>Role of Magnetic Bodies (MBs) & Holographic Recall:</dt>
              <dd>The Magnetic Body (MB) is the intentional agent orchestrating memory. TGD suggests a holographic mechanism: The MB encodes memories by sending "reference beams" (e.g., dark photons) which interfere with sensory input ("object beams," also transformed into dark photons) to create holographic memory traces, likely on biological structures. For recall, the MB sends phase-conjugate reference beams towards the geometric past to interact with these stored holograms. This interaction reconstructs the memory, which is then communicated to the present conscious experience of the self.</dd>
            </dl>
          </div>
          <div className={`diagram-card md:col-span-1 ${subSection1ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <img
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+4D+Brain+%26+Holographic+Recall"
              alt="Diagram illustrating the 4D Brain concept and Magnetic Body's holographic recall mechanism"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: 4D Brain, ZEO, and Holographic Memory Recall via Magnetic Body</p>
          </div>
        </div>
      </div>

      {/* Subsection 2: Time, Self, State Function Reductions, and Hierarchy */}
      <div className="subsection-divider">
        <h4
          ref={subSection2TitleRef}
          className={`subsection-title ${subSection2TitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Time, Self, State Function Reductions, and Hierarchy
        </h4>
        <div
          ref={subSection2ContentRef}
          className={`diagram-adjacent-text-container unified-content ${subSection2ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-card md:col-span-1 order-first ${subSection2ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <img
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+SFRs+%26+Time+Arrows"
              alt="Diagram illustrating SSFRs, BSRs, and the flow/reversal of time"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: State Function Reductions, Selves & Time Perception</p>
          </div>
          <div className={`diagram-adjacent-text md:col-span-1 order-last ${subSection2ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <dl>
              <dt>Subjective vs. Geometric Time:</dt>
              <dd>TGD distinguishes between subjective time (the experienced sequence of quantum jumps/conscious moments) and geometric time (the standard time coordinate of 4D spacetime). Memories are located in the geometric past but are re-experienced in the subjective present of the self.</dd>
              <dt>State Function Reductions (SFRs) & the Flow of Time:</dt>
              <dd>
                A "self" is a sequence of <strong>Small State Function Reductions (SSFRs)</strong>. During SSFRs, the conscious experience of the self evolves, the arrow of geometric time is preserved, and the "active" boundary of its associated Causal Diamond (CD) shifts towards the geometric future.
                For conscious memory recall, which involves accessing the geometric past, <strong>Big State Function Reductions (BSRs)</strong> are crucial. A BSR can change the arrow of geometric time for the self or a sub-self involved in the recall. This effectively allows the self to "look" into its geometric past, re-activating a past mental image.
              </dd>
              <dt>Hierarchy of Selves:</dt>
              <dd>Consciousness is organized into a fractal-like hierarchy of selves. Selves at higher levels experience longer durations of subjective time and integrate information from lower-level selves (sub-selves). This hierarchy is associated with the Magnetic Bodies and the hierarchy of Planck constants.</dd>
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
          className={`diagram-adjacent-text-container unified-content ${subSection3ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-adjacent-text md:col-span-1 ${subSection3ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <dl>
              <dt>Negentropic Entanglement (NE):</dt>
              <dd>NE, proposed to be possible in the intersection of real and p-adic worlds (or related to the hierarchy of Planck constants), is a correlate of conscious information, attention, and understanding. Unlike standard entanglement which is entropic, NE is information-carrying and stable under quantum jumps (specifically, SSFRs that preserve it), forming the basis of memory engrams as stable patterns of NE.</dd>
              <dt>Memory Engrams as NE Patterns:</dt>
              <dd>Instead of solely relying on synaptic strengths, memory engrams in TGD could be fundamentally patterns of Negentropic Entanglement, potentially at the level of magnetic bodies. These patterns could connect different brain regions or even different selves in the hierarchy, representing associations and learned information in a conscious, information-rich manner.</dd>
            </dl>
          </div>
          <div className={`diagram-card md:col-span-1 ${subSection3ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <img
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Negentropic+Entanglement"
              alt="Diagram of TGD Negentropic Entanglement in memory"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">TGD: Negentropic Entanglement & Memory Engrams</p>
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
          className={`diagram-adjacent-text-container unified-content ${subSection4ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
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
              <dd>TGD proposes that p-adic number fields describe the physics of cognition and intention. p-Adic spacetime sheets are interpreted as geometric correlates of cognitive representations, imagination, intentions, and plans. Their inherent non-determinism (piecewise constancy) allows for the "freedom of imagination."</dd>
              <dt>Transformation of Intention to Action:</dt>
              <dd>Cognitive processes (p-adic) can transform into real physical actions (described by real number based physics) via quantum jumps that convert p-adic spacetime sheets to real ones (or vice-versa). This provides a fundamental mechanism for how intentions lead to physical actions and how cognitive models influence the material world.</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}