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
    <section id="implications" className="section py-20 md:py-32 relative min-h-screen flex flex-col justify-center" aria-labelledby="implications-title">
      <div className="relative z-10">
        <h2 
          id="implications-title" 
          ref={titleRef} 
          className={`text-4xl md:text-5xl lg:text-6xl font-black text-center mb-6 md:mb-8 ${titleVisible ? 'animate-fadeIn' : 'opacity-0'} gradient-text`}
        >
          Implications and Predictions of the TGD Model
        </h2>

        {/* Subsection 1: Predictions of Novel Physical Phenomena */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4 
            ref={subSection1TitleRef} 
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection1TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Predictions of Novel Physical Phenomena
          </h4>
          <div
            ref={subSection1ContentRef}
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection1ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`space-y-6 ${subSection1ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">Hierarchy of Planck Constants (h_eff):</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Predicts macroscopic quantum coherence in biological systems, potentially observable as novel bio-electromagnetic effects.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Zero Energy Ontology (ZEO):</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Suggests that the arrow of time might not be fixed, allowing for phenomena like retrocausality in certain contexts (e.g., memory recall as seeing into the geometric past).</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Many-Sheeted Spacetime:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Implies the existence of new forms of matter and energy (e.g., dark matter as h_eff phases, exotic particles confined to specific spacetime sheets).</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">p-Adic Physics:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Could lead to a physical basis for understanding intentionality and cognitive processes, potentially testable through their influence on physical systems.</dd>
              </dl>
            </div>
            <div className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 ${subSection1ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <img 
                src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Novel+Physics"
                alt="Diagram of Novel Physical Phenomena in TGD"
                className="w-full h-auto object-contain rounded-lg shadow-md"
              />
              <p className="text-center text-sm text-slate-600 mt-4 italic">TGD: Novel Physical Phenomena</p>
            </div>
          </div>
        </div>

        {/* Subsection 2: Implications for Understanding Consciousness and Biology */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative">
          <h4 
            ref={subSection2TitleRef} 
            className={`text-2xl md:text-3xl font-bold mb-8 text-center ${subSection2TitleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}
          >
            Implications for Understanding Consciousness and Biology
          </h4>
          <div
            ref={subSection2ContentRef}
            className={`grid md:grid-cols-2 gap-10 items-stretch ${subSection2ContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`enhanced-card p-6 bg-gradient-to-br from-sky-50/80 to-blue-50/60 border border-sky-200/50 ${subSection2ContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <img 
                src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram:+Consciousness+%26+Biology"
                alt="Diagram of TGD Implications for Consciousness and Biology"
                className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
              />
              <p className="text-center text-sm text-slate-600 mt-4 italic">TGD: Consciousness & Biology</p>
            </div>
            <div className={`space-y-6 ${subSection2ContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">Nature of Subjective Experience:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">TGD offers a framework where subjective experience is primary, linked to quantum jumps and the hierarchy of selves.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Biological Self-Organization:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Magnetic bodies and the hierarchy of h_eff provide mechanisms for the coordinated behavior of complex biological systems, beyond standard biochemical explanations.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">New Approaches to Healing:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Understanding the role of magnetic bodies and dark photons could lead to novel therapeutic interventions based on electromagnetic fields.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Evolution of Consciousness:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">The TGD framework suggests that evolution involves not just biological adaptation but also an increase in the complexity and levels of consciousness, driven by the expansion of the h_eff hierarchy.</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
