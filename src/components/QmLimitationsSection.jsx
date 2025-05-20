import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function QmLimitationsSection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [listRef, listVisible] = useIntersectionObserver({ threshold: 0.1, delay: 200 });
  const [diagramRef, diagramVisible] = useIntersectionObserver({ threshold: 0.1, delay: 400 });

  return (
    <section id="qm-limitations" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center" aria-labelledby="qm-limitations-title">
      <h2 id="qm-limitations-title" ref={titleRef} className={`slide-title ${titleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}>
        Limitations of Standard Quantum Mechanics for Memory
      </h2>
      <div className="content-text space-y-6">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <ul ref={listRef} className={`list-disc pl-5 space-y-2 md:col-span-1 ${listVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <li>Many quantum-mind theories prioritize consciousness, with memory often a secondary consideration.</li>
            <li>The "decoherence problem" poses challenges for sustaining quantum states in the brain's thermal environment.</li>
            <li>Direct empirical validation of specific, non-trivial quantum mechanisms in memory processes is currently limited.</li>
            <li>Standard QM does not readily offer mechanisms for the storage of vast lifelong information or the detailed nature of subjective recall.</li>
          </ul>
          <div 
            ref={diagramRef}
            className={`diagram-card md:col-span-1 ${diagramVisible ? 'animate-fadeInRight' : 'opacity-0'}`}
          >
            <img
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram :+Standard+QM+Limitations"
              alt="Diagram illustrating limitations of standard QM for memory"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
              Limitations of Standard Quantum Mechanics in Explaining Memory
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
