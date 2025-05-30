import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function TgdMemorySection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [subtitleRef, subtitleVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  const [subSection0TitleRef, subSection0TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection0ContentRef, subSection0ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection00TitleRef, subSection00TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection00ContentRef, subSection00ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection1TitleRef, subSection1TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection1ContentRef, subSection1ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection2TitleRef, subSection2TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection2ContentRef, subSection2ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection3TitleRef, subSection3TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection3ContentRef, subSection3ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [subSection4TitleRef, subSection4TitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [subSection4ContentRef, subSection4ContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  return (
    <section id="tgd-memory" className="section py-20 md:py-32 relative min-h-screen flex flex-col justify-center" aria-labelledby="tgd-memory-title">
      <div className="relative z-10">
        <h2
          id="tgd-memory-title"
          ref={titleRef}
          className={`text-4xl md:text-5xl lg:text-6xl font-black text-center mb-6 md:mb-8 ${titleVisible ? 'animate-fadeIn' : 'opacity-0'} gradient-text`}
        >
          The TGD Model of Memory
        </h2>

        {/* Subsection 0: Critical Challenge to Quantum Consciousness Theories */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4
            ref={subSection0TitleRef}
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection0TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Critical Challenge to Quantum Consciousness Theories
          </h4>
          <div
            ref={subSection0ContentRef}
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection0ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`space-y-6 ${subSection0ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">The Fundamental Problem:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">
                  If consciousness is associated with quantum jumps (as proposed by many quantum consciousness theories), 
                  then subjective memory becomes impossible. More specifically: theories in which 
                  State Function Reduction (SFR) is a building brick of conscious experience
                  do not allow any subjective memories about previous SFRs.
                </dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Memory Continuity Problem:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Each conscious moment would be completely isolated from previous ones, making continuity of experience impossible. Standard quantum mechanics preserves no information from previous quantum jumps, creating a devastating counter-argument to quantum consciousness theories.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Need for Alternative Framework:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">This fundamental limitation necessitates a more sophisticated theoretical framework that can account for both consciousness and subjective memory - leading to the development of TGD's Zero Energy Ontology.</dd>
              </dl>
            </div>
            <div className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 ${subSection0ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <video
                src="/TGDQuantumMemory.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-center text-sm text-slate-600 mt-4 italic">The Memory Problem in Quantum Consciousness Theories</p>
            </div>
          </div>
        </div>

        {/* Subsection 00: TGD Resolution through ZEO */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4
            ref={subSection00TitleRef}
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection00TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            TGD Resolution through Zero Energy Ontology
          </h4>
          <div
            ref={subSection00ContentRef}
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection00ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 ${subSection00ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <video
                src="/TGDQuantumMemory.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-center text-sm text-slate-600 mt-4 italic">TGD: Zero Energy Ontology & Memory Resolution</p>
            </div>
            <div className={`space-y-6 ${subSection00ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">Zero Energy Ontology (ZEO):</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">ZEO is needed to solve the fundamental problem of quantum consciousness theories. In ZEO, physical states are superpositions of histories, and quantum jumps recreate these histories rather than destroying previous information.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">4D Memory Structures:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Memory is encoded as 4D structures in geometric time, allowing information preservation through spacetime geometry rather than relying on fragile quantum states that collapse during state function reductions.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Consciousness & Memory Integration:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">TGD enables both consciousness and subjective memory by distinguishing between consciousness (through state function reductions) and memory storage (through geometric spacetime structures), solving the incompatibility problem of standard quantum consciousness theories.</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Subsection 1: Memory, the 4D Brain, and Magnetic Body Action in ZEO */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4
            ref={subSection1TitleRef}
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection1TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Memory, the 4D Brain, and Magnetic Body Action in ZEO
          </h4>
          <div
            ref={subSection1ContentRef}
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection1ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`space-y-6 ${subSection1ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">The 4D Brain & Memory Encoding:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">In ZEO, memories are not just stored in 3D neural patterns. Instead, TGD proposes a "4D brain," where the conscious history of a self is encoded in the 4-dimensional spacetime surface associated with it. Past quantum jumps (conscious moments) embed information about themselves into the geometry and topology of this 4D surface. This is possible due to the slight non-determinism of TGD's fundamental field equations (Kähler action + volume term), allowing the 4D spacetime "Bohr orbit" to be rich enough to carry historical information. <em>(Holography = holomorphy vision gives same extremals for much more general actions)</em></dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Episodic Memories as Re-Experiences:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Thus, episodic memories are not passive playbacks but can be actual re-experiences or a re-illumination of a segment of this 4D past. This is achieved by quantum jumping to a state where the sub-self (mental image) corresponding to the memory is briefly re-activated in the geometric past.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Role of Magnetic Bodies (MBs) & Holographic Recall:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">The Magnetic Body (MB) is the intentional agent orchestrating memory. TGD suggests a holographic mechanism: The MB encodes memories by sending "reference beams" (e.g., dark photons) which interfere with sensory input ("object beams," also transformed into dark photons) to create holographic memory traces, likely on biological structures. For recall, the MB sends phase-conjugate reference beams towards the geometric past to interact with these stored holograms. This interaction reconstructs the memory, which is then communicated to the present conscious experience of the self.</dd>
              </dl>
            </div>
            <div className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 ${subSection1ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <video
                src="/TGDQuantumMemory.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-center text-sm text-slate-600 mt-4 italic">TGD: 4D Brain, ZEO, and Holographic Memory Recall via Magnetic Body</p>
            </div>
          </div>
        </div>

        {/* Subsection 2: Time, Self, State Function Reductions, and Hierarchy */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4
            ref={subSection2TitleRef}
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection2TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Time, Self, State Function Reductions, and Hierarchy
          </h4>
          <div
            ref={subSection2ContentRef}
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection2ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 ${subSection2ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <video
                src="/TGDQuantumMemory.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-center text-sm text-slate-600 mt-4 italic">TGD: State Function Reductions, Selves & Time Perception</p>
            </div>
            <div className={`space-y-6 ${subSection2ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">Subjective vs. Geometric Time:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">TGD distinguishes between subjective time (the experienced sequence of quantum jumps/conscious moments) and geometric time (the standard time coordinate of 4D spacetime). Memories are located in the geometric past but are re-experienced in the subjective present of the self.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">State Function Reductions (SFRs) & the Flow of Time:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">
                  A "self" is a sequence of <strong>Small State Function Reductions (SSFRs)</strong>. During SSFRs, the conscious experience of the self evolves, the arrow of geometric time is preserved, and the "active" boundary of its associated Causal Diamond (CD) shifts towards the geometric future.
                  For conscious memory recall, which involves accessing the geometric past, <strong>Big State Function Reductions (BSFRs)</strong> are crucial. A <strong>BSFR changes the arrow of geometric time</strong> for the self or a sub-self involved in the recall. This effectively allows the self to "look" into its geometric past, re-activating a past mental image.
                </dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Hierarchy of Selves:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Consciousness is organized into a fractal-like hierarchy of selves. Selves at higher levels experience longer durations of subjective time and integrate information from lower-level selves (sub-selves). This hierarchy is associated with the Magnetic Bodies and the hierarchy of Planck constants.</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Subsection 3: Negentropic Entanglement and Memory Formation */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4
            ref={subSection3TitleRef}
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection3TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Negentropic Entanglement and Memory Formation
          </h4>
          <div
            ref={subSection3ContentRef}
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection3ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`space-y-6 ${subSection3ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">Negentropic Entanglement (NE):</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">NE, proposed to be possible in the intersection of real and p-adic worlds (or related to the hierarchy of Planck constants), is a correlate of conscious information, attention, and understanding. Unlike standard entanglement which is entropic, NE is information-carrying and stable under quantum jumps (specifically, SSFRs that preserve it). The stability of NE is enhanced by <strong>large h_eff which scales up quantum time scales</strong>, forming the basis of memory engrams as stable patterns of NE.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Memory Engrams as NE Patterns:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Instead of solely relying on synaptic strengths, memory engrams in TGD could be fundamentally patterns of Negentropic Entanglement, potentially at the level of magnetic bodies. These patterns could connect different brain regions or even different selves in the hierarchy, representing associations and learned information in a conscious, information-rich manner.</dd>
              </dl>
            </div>
            <div className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 ${subSection3ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <video
                src="/TGDQuantumMemory.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-center text-sm text-slate-600 mt-4 italic">TGD: Negentropic Entanglement & Memory Engrams</p>
            </div>
          </div>
        </div>

        {/* Subsection 4: Cognitive Correlates: p-Adic Physics */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4
            ref={subSection4TitleRef}
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection4TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Cognitive Correlates: p-Adic Physics
          </h4>
          <div
            ref={subSection4ContentRef}
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection4ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 ${subSection4ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <video
                src="/TGDQuantumMemory.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-center text-sm text-slate-600 mt-4 italic">TGD: p-Adic Physics & Cognitive Representation</p>
            </div>
            <div className={`space-y-6 ${subSection4ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">p-Adic Spacetime Sheets as Cognitive Representations:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">TGD proposes that p-adic number fields describe the physics of cognition and intention. p-Adic spacetime sheets are interpreted as geometric correlates of cognitive representations, imagination, intentions, and plans. Their inherent non-determinism (piecewise constancy) allows for the "freedom of imagination."</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Transformation of Intention to Action:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Cognitive processes (p-adic) can transform into real physical actions (described by real number based physics) via quantum jumps that convert p-adic spacetime sheets to real ones (or vice-versa). This provides a fundamental mechanism for how intentions lead to physical actions and how cognitive models influence the material world.</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}