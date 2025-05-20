import { useEffect, useState } from 'react';

export default function App() {
  const [activeSection, setActiveSection] = useState(0);
  const sections = ['intro', 'tgd-core', 'tgd-memory', 'implications', 'conclusion'];
  const headerHeight = 64;

  const scrollToSection = (index) => {
    const section = document.getElementById(sections[index]);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - headerHeight,
        behavior: 'smooth',
      });
      setActiveSection(index);
    }
  };

  // Scroll listener to update active section
  useEffect(() => {
    const handleScroll = () => {
      let index = 0;
      for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        if (
          section &&
          window.scrollY >= section.offsetTop - headerHeight - 150
        ) {
          index = i;
        }
      }
      setActiveSection(index);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement !== document.body) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeSection < sections.length - 1) {
          scrollToSection(activeSection + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeSection > 0) {
          scrollToSection(activeSection - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection]);

  return (
    <div className="bg-sky-50 text-gray-800 font-sans">
      {/* Header */}
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

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Introduction Section */}
        <section id="intro" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center">
          <h1 className="slide-title animate-fadeIn">
            The Complexities of Memory: Mainstream, Quantum, and Novel Physical Perspectives
          </h1>
          <h2 className="slide-subtitle animate-slideUp">
            An Examination of Theoretical Gaps and Alternative Frameworks
          </h2>
          <h3 className="text-center text-2xl font-semibold text-sky-700 mb-6">Section: Introduction</h3>
          <div className="content-text space-y-6 max-w-4xl mx-auto">
            <p>
              Memory, the capacity for encoding, storing, and retrieving information, is a fundamental aspect of human cognition. It underpins identity, learning, and adaptation. Traditional investigations within psychology and neuroscience have provided significant insights into its biological substrates and behavioral manifestations.
            </p>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <h3>Challenges in Understanding Memory:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Mainstream Models:</strong> Frameworks such as the Multi-Store Model or Working Memory models delineate information processing architectures. However, a comprehensive explanation for the subjective qualities of memory, including the phenomenal experience of recollection, often remains outside their primary scope.
                  </li>
                  <li>
                    <strong>Quantum Considerations in Consciousness Science:</strong> The difficulties in accounting for subjective experience (the "hard problem" of consciousness) have led some to consider quantum mechanical principles. Concepts like superposition and entanglement have been explored for their potential parallels with mental phenomena (e.g., the Orch OR theory).
                  </li>
                  <li>
                    <strong>Limitations of Standard Quantum Mechanics for Memory:</strong>
                    <ul className="list-circle pl-5 mt-2 space-y-1">
                      <li>Many quantum-mind theories prioritize consciousness, with memory often a secondary consideration.</li>
                      <li>The "decoherence problem" poses challenges for sustaining quantum states in the brain's thermal environment.</li>
                      <li>Direct empirical validation of specific, non-trivial quantum mechanisms in memory processes is currently limited.</li>
                      <li>Standard QM does not readily offer mechanisms for the storage of vast lifelong information or the detailed nature of subjective recall.</li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div className="diagram-card">
                <img
                  src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram :+Comparative+Analysis+of+Memory+Model+Limitations"
                  alt="Diagram illustrating challenges in memory models"
                  className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50"
                />
                <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
                  Comparative Analysis of Memory Model Limitations
                </p>
              </div>
            </div>
            <p className="mt-6">
              These considerations prompt an inquiry: Is a more fundamental revision of physical principles necessary to fully address the multifaceted nature of memory? This presentation will examine Topological Geometrodynamics (TGD), developed by Matti Pitkänen, as a distinct theoretical framework proposing memory as an integral aspect of spacetime and consciousness.
            </p>
          </div>
        </section>

        {/* TGD Core Principles */}
        <section id="tgd-core" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center">
          <h2 className="slide-title">Core Principles of TGD Relevant to Memory</h2>
          <h3 className="text-center text-2xl font-semibold text-sky-700 mb-6">Section: TGD Core</h3>
          <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
            Understanding TGD's model of memory requires familiarity with its key, non-standard tenets. These form the foundation for its approach to consciousness and memory.
          </p>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <dl className="keyword-list p-6 rounded-xl shadow-lg border border-sky-200 bg-sky-50 space-y-5">
              <div>
                <dt className="font-semibold text-sky-800 text-lg md:text-xl mb-1">1. Spacetime as a 4-Surface:</dt>
                <dd className="ml-4 text-gray-600 text-sm md:text-base">
                  TGD posits spacetime as a 4-dimensional surface within an 8-dimensional ambient space (H = M⁴ × CP²). This leads to a "many-sheeted spacetime," where classical fields are quantized as entities like flux tubes on these sheets.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-sky-800 text-lg md:text-xl mb-1">2. Zero Energy Ontology (ZEO):</dt>
                <dd className="ml-4 text-gray-600 text-sm md:text-base">
                  Physical states are "zero energy states" bounded by 3-surfaces within a Causal Diamond (CD). A quantum jump (State Function Reduction, SFR) between these states is identified as a moment of consciousness. ZEO distinguishes geometric time from subjective time (a sequence of SFRs).
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-sky-800 text-lg md:text-xl mb-1">3. Hierarchy of Planck Constants (h<sub>eff</sub>):</dt>
                <dd className="ml-4 text-gray-600 text-sm md:text-base">
                  Planck's constant is proposed to have a spectrum of values (h<sub>eff</sub> = n × h₀), potentially enabling macroscopic quantum coherence in biological systems. Larger h<sub>eff</sub> values are associated with increased complexity and representational capacity.
                </dd>
              </div>
            </dl>
            <div className="diagram-card order-first md:order-last">
              <img
                src="https://placehold.co/600x500/e2e8f0/38bdf8?text=Diagram :+1.+Many-Sheeted+Spacetime+2.+Causal+Diamond+(ZEO)+3.+h_eff+Hierarchy"
                alt="Diagram of TGD Spacetime, ZEO, and h_eff"
                className="diagram-placeholder"
              />
              <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
                TGD Spacetime, ZEO, and h_eff Hierarchy
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start mt-8">
            <div className="diagram-card order-last md:order-first">
              <img
                src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram :+4.+Magnetic+Body+and+Flux+Tubes+Interacting+with+Biological+System"
                alt="Diagram of Magnetic Body"
                className="diagram-placeholder"
              />
              <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
                Magnetic Body and Flux Tubes Interacting with Biological System
              </p>
            </div>
            <dl className="keyword-list p-6 rounded-xl shadow-lg border border-sky-200 bg-sky-50 space-y-5">
              <div>
                <dt className="font-semibold text-sky-800 text-lg md:text-xl mb-1">4. Magnetic Bodies (MB):</dt>
                <dd className="ml-4 text-gray-600 text-sm md:text-base">
                  Field bodies, primarily magnetic, composed of matter with large h<sub>eff</sub> (dark matter in TGD sense), are associated with physical systems. MBs are theorized as intentional agents interacting with biological systems, playing a role in consciousness and memory.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-sky-800 text-lg md:text-xl mb-1">5. p-Adic Physics (Cognition & Intention):</dt>
                <dd className="ml-4 text-gray-600 text-sm md:text-base">
                  p-Adic number fields are proposed to describe physical correlates of cognition, imagination, and intention. The transformation of p-adic intention to real action is hypothesized to occur via p-adic-to-real phase transitions.
                </dd>
              </div>
            </dl>
          </div>
          <p className="content-text mt-10 text-center">
            These interconnected concepts are central to TGD's model of memory as a dynamic, conscious process within a 4-dimensional framework.
          </p>
        </section>

        {/* TGD Memory Model */}
        <section id="tgd-memory" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center">
          <h2 className="slide-title">The TGD Model of Memory: A 4D, Conscious Process</h2>
          <h3 className="text-center text-2xl font-semibold text-sky-700 mb-6">Section: TGD Memory Model</h3>
          <div className="space-y-8 content-text">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-3">Memory as a 4-Dimensional Construct in ZEO – The "4D Brain"</h3>
                <p>
                  In ZEO, quantum states are superpositions of entire 4D spacetime surfaces. Memory is proposed to be fundamentally encoded in the 4D history (the spacetime surface) of the "self" (conscious entity), rather than solely in the present 3D brain state. This "4D brain" concept implies past experiences are part of the self's extended spacetime reality. Information about conscious quantum jumps is encoded into this 4D surface, facilitated by the proposed non-determinism of TGD's classical field equations.
                </p>
              </div>
              <div className="diagram-card">
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
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="diagram-card order-last md:order-first">
                <img
                  src="https://placehold.co/600x450/e2e8f0/38bdf8?text=Diagram :+Magnetic+Body+Mediated+Memory+Encoding+%28Hologram+Formation%29+Recall+%28Phase+Conjugation%29"
                  alt="Diagram of MB and Holographic Memory"
                  className="diagram-placeholder"
                />
                <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
                  Magnetic Body Mediated Memory Encoding (Hologram Formation), Recall (Phase Conjugation)
                </p>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-3">Role of Magnetic Bodies (MB) and Holographic Principles</h3>
                <p>The MB is hypothesized to actively participate in memory processes:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Encoding:</strong> The MB may send "reference beams" (e.g., dark photons) that interfere with "object beams" (sensory input) to create holographic memory traces on biological structures.</li>
                  <li><strong>Recall:</strong> The MB might send phase-conjugate beams to the geometric past, interacting with the hologram to generate a time-reversed mental image, which is then communicated to present consciousness. (Potential correlate: coupled ripple oscillations).</li>
                </ul>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-3">State Function Reductions (SFRs) & Subjective Time</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>SSFRs (Small SFRs):</strong> Occur repeatedly, preserve the arrow of geometric time, constitute the "self's" subjective time flow and are associated with sensory perception.</li>
                  <li><strong>BSRs (Big SFRs):</strong> More significant events potentially involving a change in the arrow of geometric time for a self or sub-self. Hypothesized as fundamental for motor action and conscious memory recall (accessing the geometric past).</li>
                </ul>
                <p className="mt-2">
                  TGD thus views memory as an active re-experiencing of the 4D past, linked to consciousness (quantum jumps) and orchestrated by the MB.
                </p>
              </div>
              <div className="diagram-card">
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
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-3">Cognitive Correlates: p-Adic Physics</h3>
              <p>p-Adic spacetime regions are proposed as correlates of cognition and intention. Intentions (p-adic) may transform into actions (real) via p-adic-to-real phase transitions. Cognitive aspects of memory could involve interactions between real (sensory/memory traces) and p-adic (cognitive processing) sectors of the TGD universe.</p>
              <div className="diagram-card mx-auto">
                <img
                  src="https://placehold.co/600x300/e2e8f0/38bdf8?text=Diagram :+Interface+of+p-Adic+%28Cognition%29+and+Real+%28Physical%29+Domains"
                  alt="Diagram of p-Adic Physics in Cognition"
                  className="diagram-placeholder"
                />
                <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
                  Interface of p-Adic (Cognition) and Real (Physical) Domains
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Implications */}
        <section id="implications" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center">
          <h2 className="slide-title">Potential Implications of TGD's Memory Model for Fundamental Physics</h2>
          <h3 className="text-center text-2xl font-semibold text-sky-700 mb-6">Section: Implications</h3>
          <div className="space-y-8 content-text">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-3">1. Reconceptualization of Spacetime:</h3>
                  <p>Spacetime would be understood as a dynamic, many-sheeted structure, serving as a repository of experiential history. Memory could be an intrinsic property of its evolving geometry.</p>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-3">2. Alterations to Quantum Measurement Theory:</h3>
                  <p>TGD integrates quantum measurement with a theory of consciousness, where the SFR is a moment of consciousness. ZEO aims to address aspects of the measurement problem by incorporating the observer ("self").</p>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-3">3. Consciousness as a Fundamental Physical Aspect:</h3>
                  <p>Consciousness might not be merely emergent but a fundamental aspect of reality, associated with quantum jumps, ZEO, MBs, and the <code>h<sub>eff</sub></code> hierarchy, implying a hierarchy of conscious entities.</p>
                </div>
              </div>
              <div className="diagram-card">
                <img
                  src="https://placehold.co/600x550/e2e8f0/38bdf8?text=Conceptual+Diagram :+Physics+Reassessment+-Dynamic+Spacetime+Record+-Observer-Inclusive+QM+-Fundamental+Consciousness"
                  alt="Diagram of Physics Implications of TGD"
                  className="diagram-placeholder"
                />
                <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
                  Conceptual Diagram: Physics Reassessment
                </p>
              </div>
            </div>
            <div className="mt-10">
              <h3 className="text-center text-xl md:text-2xl font-semibold text-sky-600 mt-6 mb-3">Predictions of Novel Physical Phenomena:</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <ul className="content-text list-disc pl-5 space-y-2">
                  <li><strong>Hierarchy of Planck Constants (h<sub>eff</sub>):</strong> Existence of "dark matter" phases exhibiting macroscopic quantum coherence.</li>
                  <li><strong>Many-Sheeted Spacetime:</strong> Potential for new types of interactions.</li>
                  <li><strong>ZEO & Negative Energy Signals:</strong> Theoretical possibility of signals with a reversed arrow of geometric time (relevant to memory recall).</li>
                  <li><strong>p-Adic Physics:</strong> Observable physical signatures of the interface between p-adic (cognition) and real domains.</li>
                </ul>
                <div className="diagram-card">
                  <img
                    src="https://placehold.co/600x350/e2e8f0/38bdf8?text=Diagram :+Examples+of+Predicted+New+Physical+Phenomena"
                    alt="Diagram of New TGD Phenomena"
                    className="diagram-placeholder"
                  />
                  <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
                    Examples of Predicted New Physical Phenomena
                  </p>
                </div>
              </div>
              <p className="content-text mt-4 text-center">
                Direct experimental verification is highly challenging, but indirect support could arise from anomalous observations in various physical or biological systems.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section id="conclusion" className="slide-section min-h-screen flex flex-col justify-center">
          <h2 className="slide-title">Concluding Remarks: Memory within the TGD Framework</h2>
          <h3 className="text-center text-2xl font-semibold text-sky-700 mb-6">Section: Conclusion</h3>
          <div className="content-text space-y-6 text-center max-w-4xl mx-auto">
            <p>This presentation has outlined TGD's distinct perspective on memory, contrasting it with established and other alternative models. TGD proposes memory as an active, 4-dimensional, conscious process, orchestrated by Magnetic Bodies and intrinsically linked to the structure of spacetime.</p>
            <div className="diagram-card mx-auto">
              <img
                src="https://placehold.co/600x300/e2e8f0/38bdf8?text=Synthesizing+Diagram :+TGD%27s+Integrated+View+of+Memory,+Consciousness,+Cosmos"
                alt="Synthesizing Diagram of TGD's View"
                className="diagram-placeholder"
              />
              <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
                Synthesizing Diagram: TGD's Integrated View of Memory, Consciousness, Cosmos
              </p>
            </div>
            <p>
              Were this model to be substantiated, it would necessitate a significant re-evaluation of foundational concepts in physics, including spacetime, quantum measurement, and the nature of consciousness.
            </p>
            <p>
              While TGD is a theoretically extensive and experimentally demanding framework, it offers a comprehensive structure for considering fundamental questions about memory, consciousness, and their physical basis. It suggests a view of the universe with potentially deeper interconnections and a more integral role for conscious experience than currently understood.
            </p>
            <p className="mt-8 text-xl font-semibold">Thank you.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-500 text-sm bg-white border-t border-gray-200">
        <p>Presentation based on concepts from Topological Geometrodynamics by Matti Pitkänen.</p>
      </footer>
    </div>
  );
}