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
    <section id="conclusion" className="section py-20 md:py-32 relative min-h-screen flex flex-col justify-center" aria-labelledby="conclusion-title">
      <div className="relative z-10">
        <h2 id="conclusion-title" ref={titleRef} className={`text-4xl md:text-5xl lg:text-6xl font-black text-center mb-6 md:mb-8 ${titleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}>
          Concluding Remarks: Memory within the TGD Framework
        </h2>
        
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <div className="space-y-8 text-center max-w-4xl mx-auto">
            <p ref={p1Ref} className={`text-lg text-slate-700 leading-relaxed ${p1Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
              This presentation has outlined TGD's distinct perspective on memory, contrasting it with established and other alternative models. TGD proposes memory as an active, 4-dimensional, conscious process, orchestrated by Magnetic Bodies and intrinsically linked to the structure of spacetime.
            </p>
            
            <div ref={diagramRef} className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 mx-auto max-w-2xl ${diagramVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
              <img
                src="https://placehold.co/600x300/e2e8f0/38bdf8?text=Synthesizing+Diagram :+TGD%27s+Integrated+View+of+Memory,+Consciousness,+Cosmos"
                alt="Synthesizing Diagram of TGD's View"
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
              />
              <p className="text-center text-sm text-slate-600 mt-4 italic">
                Synthesizing Diagram: TGD's Integrated View of Memory, Consciousness, Cosmos
              </p>
            </div>
            
            <p ref={p2Ref} className={`text-lg text-slate-700 leading-relaxed ${p2Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
              Were this model to be substantiated, it would necessitate a significant re-evaluation of foundational concepts in physics, including spacetime, quantum measurement, and the nature of consciousness.
            </p>
            
            <p ref={p3Ref} className={`text-lg text-slate-700 leading-relaxed ${p3Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
              While TGD is a theoretically extensive and experimentally demanding framework, it offers a comprehensive structure for considering fundamental questions about memory, consciousness, and their physical basis. It suggests a view of the universe with potentially deeper interconnections and a more integral role for conscious experience than currently understood.
            </p>
            
            <p ref={thankYouRef} className={`mt-8 text-3xl font-bold gradient-text ${thankYouVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
              Thank you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
