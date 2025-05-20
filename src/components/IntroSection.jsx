import useIntersectionObserver from '../hooks/useIntersectionObserver';

// src/components/IntroSection.jsx
export default function IntroSection() {
  const [pageTitleRef, pageTitleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [pageSubtitleRef, pageSubtitleVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  const [introParagraphRef, introParagraphVisible] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -100px 0px', delay: 200 });

  const [challengesTitleRef, challengesTitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [challengesContentRef, challengesContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 }); // Combined ref for list and diagram parent

  const [transitionParagraphRef, transitionParagraphVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });

  const [limitationsTitleRef, limitationsTitleVisible] = useIntersectionObserver({ threshold: 0.1, delay: 100 });
  const [limitationsContentRef, limitationsContentVisible] = useIntersectionObserver({ threshold: 0.1, delay: 300 }); // Combined ref for list and diagram parent


  return (
    <section id="intro" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center" aria-labelledby="intro-title">
      <h1 
        id="intro-title" 
        ref={pageTitleRef} 
        className={`slide-title ${pageTitleVisible ? 'animate-fadeIn' : 'opacity-0'}`}
      >
        Introduction to Mainstream and Quantum Perspectives on Memory
      </h1>
      <h2 
        ref={pageSubtitleRef}
        className={`slide-subtitle ${pageSubtitleVisible ? 'animate-slideUp' : 'opacity-0'} animation-delay-200`}
      >
        How subjective memories are realized in TGD inspired theory of consciousness?
      </h2>
      
      <div 
        ref={introParagraphRef}
        className={`content-text space-y-6 ${introParagraphVisible ? 'animate-fadeInUp' : 'opacity-0'} animation-delay-400`}
      >
        <p>
          Memory, the capacity for encoding, storing, and retrieving information, is a fundamental aspect of human cognition. It underpins identity, learning, and adaptation. Traditional investigations within psychology and neuroscience have provided significant insights into its biological substrates and behavioral manifestations.
        </p>
      </div>

      {/* Subsection: Challenges in Understanding Memory */}
      <div className="subsection-divider"> 
        <h3 
          id="challenges-title" 
          ref={challengesTitleRef} 
          className={`subsection-title ${challengesTitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
          Challenges in Understanding Memory
        </h3>
        <div 
          ref={challengesContentRef} 
          className={`diagram-adjacent-text-container content-text ${challengesContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          <div className={`diagram-adjacent-text md:col-span-1 ${challengesContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <dl>
              <dt>Mainstream Models:</dt>
              <dd>Frameworks such as the Multi-Store Model or Working Memory models delineate information processing architectures. However, a comprehensive explanation for the subjective qualities of memory, including the phenomenal experience of recollection, often remains outside their primary scope.</dd>
              <dt>Quantum Considerations in Consciousness Science:</dt>
              <dd>The difficulties in accounting for subjective experience (the "hard problem" of consciousness) have led some to consider quantum mechanical principles. Concepts like superposition and entanglement have been explored for their potential parallels with mental phenomena (e.g., the Orch OR theory).</dd>
            </dl>
          </div>
          <div 
            className={`diagram-card md:col-span-1 ${challengesContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}
          >
            <img
              src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram :+Memory+Models+%26+Quantum+Considerations"
              alt="Diagram illustrating challenges in memory models and quantum considerations"
              className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
            />
            <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">
              Challenges: Memory Models & Quantum Considerations
            </p>
          </div>
        </div>
      </div>
      

      {/* Subsection: Limitations of Standard Quantum Mechanics for Memory */}
      <div className="subsection-divider"> 
        <h3 
            id="qm-limitations-title" 
            ref={limitationsTitleRef} 
            className={`subsection-title ${limitationsTitleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}
        >
            Limitations of Standard Quantum Mechanics for Memory
        </h3>
        <div 
            ref={limitationsContentRef}
            className={`diagram-adjacent-text-container content-text ${limitationsContentVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
            <div 
                className={`diagram-card md:col-span-1 order-first ${limitationsContentVisible ? 'animate-fadeInLeft' : 'opacity-0'}`}
            >
                <img
                src="https://placehold.co/600x400/e2e8f0/38bdf8?text=Diagram :+Standard+QM+Limitations"
                alt="Diagram illustrating limitations of standard QM for memory"
                className="diagram-placeholder rounded-lg shadow-md border border-gray-300 bg-gray-50 w-full h-full object-cover"
                />
                <p className="diagram-caption text-center text-sm text-gray-500 mt-7 italic">
                Limitations of Standard Quantum Mechanics in Explaining Memory
                </p>
            </div>
            <div className={`diagram-adjacent-text md:col-span-1 order-last ${limitationsContentVisible ? 'animate-fadeInRight' : 'opacity-0'}`}>
              <dl>
                  <dt>Prioritization of Consciousness:</dt>
                  <dd>Many quantum-mind theories prioritize consciousness, with memory often a secondary consideration.</dd>
                  <dt>Decoherence Problem:</dt>
                  <dd>The "decoherence problem" poses challenges for sustaining quantum states in the brain's thermal environment.</dd>
                  <dt>Limited Empirical Validation:</dt>
                  <dd>Direct empirical validation of specific, non-trivial quantum mechanisms in memory processes is currently limited.</dd>
                  <dt>Storage and Recall Mechanisms:</dt>
                  <dd>Standard QM does not readily offer mechanisms for the storage of vast lifelong information or the detailed nature of subjective recall.</dd>
              </dl>
            </div>
            
        </div>

      <div 
        ref={transitionParagraphRef}
        className={`content-text mt-10 pt-6 ${transitionParagraphVisible ? 'animate-fadeInUp' : 'opacity-0'} animation-delay-200`}
      >
        <p>
          <b>Prompt an inquiry</b>: Is a more fundamental revision of physical principles necessary to fully address the multifaceted nature of memory? This presentation will examine Topological Geometrodynamics (TGD), developed by Matti Pitkänen, as a distinct theoretical framework proposing memory as an integral aspect of spacetime and consciousness.
        </p>
      </div>
      </div>
    </section>
  );
}
