// src/components/ConclusionSection.jsx
import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function ConclusionSection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [subTitleRef, subTitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 200 });
  const [p1Ref, p1Visible] = useIntersectionObserver({ threshold: 0.1, delay: 400 });
  const [diagramRef, diagramVisible] = useIntersectionObserver({ threshold: 0.1, delay: 600 });
  const [p2Ref, p2Visible] = useIntersectionObserver({ threshold: 0.1, delay: 500 });
  const [p3Ref, p3Visible] = useIntersectionObserver({ threshold: 0.1, delay: 600 });
  const [thankYouRef, thankYouVisible] = useIntersectionObserver({ threshold: 0.1, delay: 700 });

  return (
    <section id="conclusion" className="slide-section min-h-screen flex flex-col justify-center" aria-labelledby="conclusion-title">
      <h2 id="conclusion-title" ref={titleRef} className={`slide-title ${titleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}>Concluding Remarks: Memory within the TGD Framework</h2>
      <h3 ref={subTitleRef} className={`text-center text-2xl font-semibold text-sky-700 mb-6 ${subTitleVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>Section: Conclusion</h3>
      <div className="content-text space-y-6 text-center max-w-4xl mx-auto">
        <p ref={p1Ref} className={`${p1Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          This presentation has outlined TGD's distinct perspective on memory, contrasting it with established and other alternative models. TGD proposes memory as an active, 4-dimensional, conscious process, orchestrated by Magnetic Bodies and intrinsically linked to the structure of spacetime.
        </p>
        <div ref={diagramRef} className={`diagram-card mx-auto ${diagramVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <img
            src="https://placehold.co/600x300/e2e8f0/38bdf8?text=Synthesizing+Diagram :+TGD%27s+Integrated+View+of+Memory,+Consciousness,+Cosmos"
            alt="Synthesizing Diagram of TGD's View"
            className="diagram-placeholder"
          />
          <p className="diagram-caption text-center text-sm text-gray-500 mt-2 italic">
            Synthesizing Diagram: TGD's Integrated View of Memory, Consciousness, Cosmos
          </p>
        </div>
        <p ref={p2Ref} className={`${p2Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          Were this model to be substantiated, it would necessitate a significant re-evaluation of foundational concepts in physics, including spacetime, quantum measurement, and the nature of consciousness.
        </p>
        <p ref={p3Ref} className={`${p3Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          While TGD is a theoretically extensive and experimentally demanding framework, it offers a comprehensive structure for considering fundamental questions about memory, consciousness, and their physical basis. It suggests a view of the universe with potentially deeper interconnections and a more integral role for conscious experience than currently understood.
        </p>
        <p ref={thankYouRef} className={`mt-8 text-xl font-semibold ${thankYouVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>Thank you.</p>
      </div>
    </section>
  );
}
