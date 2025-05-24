import { useEffect, useState } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import TableModal from './TableModal';

export default function IntroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add useEffect to toggle body class for scroll prevention
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open-no-scroll');
    } else {
      document.body.classList.remove('modal-open-no-scroll');
    }
    // Cleanup function to remove the class if the component unmounts while modal is open
    return () => {
      document.body.classList.remove('modal-open-no-scroll');
    };
  }, [isModalOpen]);

  const tableHeaders = ["Feature", "Classical Models (e.g., MSM, Baddeley's WM)", "Standard QM Approaches (e.g., Orch OR variants)", "TGD Framework"];
  const tableRows = [
    { "Feature": "Nature of Storage", "Classical Models (e.g., MSM, Baddeley's WM)": "Information encoded in neural patterns, synaptic strengths.", "Standard QM Approaches (e.g., Orch OR variants)": "Quantum states in microtubules or other neural structures; often focused on consciousness rather than explicit memory trace.", "TGD Framework": "Memories stored in 4-D brain (spacetime sheets), ZEO implies memories can be re-experienced via time-like entanglement." },
    { "Feature": "Mechanism of Recall", "Classical Models (e.g., MSM, Baddeley's WM)": "Activation of stored patterns, cue-dependent retrieval.", "Standard QM Approaches (e.g., Orch OR variants)": "Collapse of quantum wave function, objective reduction; specific recall mechanisms less detailed.", "TGD Framework": "Intentional action (negentropic entanglement) initiates communication with geometric past; 'signals' from past to present (negative energy photons)." },
    { "Feature": "Subjective Experience (Qualia)", "Classical Models (e.g., MSM, Baddeley's WM)": "Emergent property of complex neural activity; 'hard problem' largely unaddressed.", "Standard QM Approaches (e.g., Orch OR variants)": "Conscious moments linked to quantum computations/collapse; qualia associated with fundamental spacetime geometry (Penrose).", "TGD Framework": "Qualia are fundamental properties of quantum jumps; sensory qualia at sensory organs, contents of memory as qualia from geometric past." },
    { "Feature": "Arrow of Time / Memory Directionality", "Classical Models (e.g., MSM, Baddeley's WM)": "Implicitly follows thermodynamic arrow; past -> present encoding.", "Standard QM Approaches (e.g., Orch OR variants)": "Standard arrow of time; some models might explore advanced/retarded potentials but not central to memory.", "TGD Framework": "ZEO allows for both arrows of time; memory recall involves signals from geometric past (non-standard time directionality)." },
    { "Feature": "Capacity & Longevity", "Classical Models (e.g., MSM, Baddeley's WM)": "LTM vast but subject to decay/interference; physical basis of lifelong memories debated.", "Standard QM Approaches (e.g., Orch OR variants)": "Quantum states are fragile (decoherence); long-term stability of quantum memory traces is a challenge.", "TGD Framework": "Geometric past is immutable; memory capacity is effectively infinite. Negentropic entanglement provides stability for 'living' memories." },
    { "Feature": "Active vs. Passive Recall", "Classical Models (e.g., MSM, Baddeley's WM)": "Can be both; e.g., cued recall (passive) vs. free recall (active search).", "Standard QM Approaches (e.g., Orch OR variants)": "Typically passive collapse; active intentionality less defined.", "TGD Framework": "Recall is an active, intentional process (directed attention via magnetic body); re-experiencing past quantum states." }
  ];

  const [pageTitleRef, pageTitleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [pageSubtitleRef, pageSubtitleVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  const [introParagraphRef, introParagraphVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -100px 0px', delay: 200 });

  const [challengesTitleRef, challengesTitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [challengesContentRef, challengesContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  const [transitionParagraphRef, transitionParagraphVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });

  const [limitationsTitleRef, limitationsTitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [limitationsContentRef, limitationsContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });

  return (
    <section id="intro" className="section py-20 md:py-32 relative min-h-screen flex flex-col justify-center" aria-labelledby="intro-title">
      <div className="relative z-10">
        <h1 
          id="intro-title" 
          ref={pageTitleRef} 
          className={`text-4xl md:text-5xl lg:text-6xl font-black text-center mb-6 md:mb-8 ${pageTitleVisible ? 'animate-fadeIn' : 'opacity-0'} gradient-text`}
        >
          Quantum Perspectives on Memory
        </h1>
        <h2 
          ref={pageSubtitleRef}
          className={`text-xl md:text-2xl lg:text-3xl text-center mb-12 md:mb-16 font-medium text-slate-600 ${pageSubtitleVisible ? 'animate-slideUp' : 'opacity-0'} animation-delay-200`}
        >
          How subjective memories are realized in TGD inspired theory of consciousness?
        </h2>
        
        <div 
          ref={introParagraphRef}
          className={`unified-content space-y-6 max-w-5xl mx-auto ${introParagraphVisible ? 'animate-fadeInUp' : 'opacity-0'} animation-delay-400`}
        >
          <p className="text-lg leading-relaxed text-gray-700 bg-sky-50 border-l-4 border-sky-400 pl-6 py-4 rounded-r-lg">
            Memory, the capacity for encoding, storing, and retrieving information, is a fundamental aspect of human cognition. It underpins identity, learning, and adaptation. Traditional investigations within psychology and neuroscience have provided significant insights into its biological substrates and behavioral manifestations. But, can memory be understood through the lens of quantum mechanics?
          </p>
        </div>

        {/* Subsection: Challenges in Understanding Memory */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative"> 
          <h3 
            id="challenges-title" 
            ref={challengesTitleRef} 
            className={`text-2xl md:text-3xl font-bold mb-8 text-center relative gradient-text ${challengesTitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
          >
            Challenges in Understanding Memory
          </h3>
          <div 
            ref={challengesContentRef} 
            className={`grid md:grid-cols-2 gap-10 items-stretch ${challengesContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
            <div className={`space-y-6 ${challengesContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
              <dl className="space-y-4">
                <dt className="font-bold text-lg text-slate-800 mb-2">Mainstream Models:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Frameworks such as the Multi-Store Model or Working Memory models delineate information processing architectures. However, a comprehensive explanation for the subjective qualities of memory, including the phenomenal experience of recollection, often remains outside their primary scope.</dd>
                <dt className="font-bold text-lg text-slate-800 mb-2">Quantum Considerations in Consciousness Science:</dt>
                <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">The difficulties in accounting for subjective experience (the "hard problem" of consciousness) have led some to consider quantum mechanical principles. Concepts like superposition and entanglement have been explored for their potential parallels with mental phenomena (e.g., the Orch OR theory). But do they represent a model for cognitive processes crusial to conscious experience?</dd>
              </dl>
            </div>
            <div 
              onClick={() => setIsModalOpen(true)}
              className={`enhanced-card hover-lift cursor-pointer transition-transform duration-200 hover:scale-105 ${challengesContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain rounded-lg shadow-md border border-gray-300 bg-gray-50"
                aria-label="Background video showing memory model comparison overview. Click to open full table."
              >
                <source src="bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p className="text-center text-sm text-gray-500 mt-4 italic">
                Table 1: Comparative Overview (Click video to view details)
              </p>
            </div>
          </div>
        </div>
        

        {/* Subsection: Limitations of Standard Quantum Mechanics for Memory */}
        <div className="mt-16 pt-12 border-t border-gray-200 relative"> 
          <h3 
              id="qm-limitations-title" 
              ref={limitationsTitleRef} 
              className={`text-2xl md:text-3xl font-bold mb-8 text-center relative gradient-text ${limitationsTitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
          >
              Limitations of Standard Quantum Mechanics for Memory
          </h3>
          <div 
              ref={limitationsContentRef}
              className={`grid md:grid-cols-2 gap-10 items-stretch ${limitationsContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
              <div 
                  className={`enhanced-card hover-lift ${limitationsContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}
              >
                  <img
                  src="quantum_memory.png"
                  alt="Diagram illustrating limitations of standard QM for memory"
                  className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md border border-gray-300 bg-gray-50"
                  />
                  <p className="text-center text-sm text-gray-500 mt-4 italic">
                  Limitations of Standard Quantum Mechanics in Explaining Memory
                  </p>
              </div>
              <div className={`space-y-6 ${limitationsContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
                <dl className="space-y-4">
                    <dt className="font-bold text-lg text-slate-800 mb-2">Prioritization of Consciousness:</dt>
                    <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Many quantum-mind theories prioritize consciousness, with memory often a secondary consideration.</dd>
                    <dt className="font-bold text-lg text-slate-800 mb-2">Decoherence Problem:</dt>
                    <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">The "decoherence problem" poses challenges for sustaining quantum states in the brain's thermal environment.</dd>
                    <dt className="font-bold text-lg text-slate-800 mb-2">Limited Empirical Validation:</dt>
                    <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Direct empirical validation of specific, non-trivial quantum mechanisms in memory processes is currently limited.</dd>
                    <dt className="font-bold text-lg text-slate-800 mb-2">Storage and Recall Mechanisms:</dt>
                    <dd className="text-slate-700 leading-relaxed pl-4 border-l-4 border-sky-200">Standard QM does not readily offer mechanisms for the storage of vast lifelong information or the detailed nature of subjective recall.</dd>
                </dl>
              </div>
          </div>

        <div 
          ref={transitionParagraphRef}
          className={`unified-content mt-10 pt-6 max-w-4xl mx-auto ${transitionParagraphVisible ? 'animate-fadeInUp' : 'opacity-0'} animation-delay-200`}
        >
          <p className="text-lg leading-relaxed text-gray-700 bg-sky-50 border-l-4 border-sky-400 pl-6 py-4 rounded-r-lg italic">
            <b>Prompt an inquiry</b>: Is a more fundamental revision of physical principles necessary to fully address the multifaceted nature of memory? This presentation will examine Topological Geometrodynamics (TGD), developed by Matti Pitkänen, as a distinct theoretical framework proposing memory as an integral aspect of spacetime and consciousness.
          </p>
        </div>
        </div>

        <TableModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Table 1: Comparative Overview of Key Memory Models" 
          headers={tableHeaders} 
          rows={tableRows} 
        />
      </div>
    </section>
  );
}
