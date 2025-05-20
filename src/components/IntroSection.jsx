// src/components/IntroSection.jsx
export default function IntroSection() {
  return (
    <section id="intro" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center" aria-labelledby="intro-title">
      <h1 id="intro-title" className="slide-title animate-fadeIn">
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
  );
}
