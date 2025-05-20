// src/components/TgdCoreSection.jsx
export default function TgdCoreSection() {
  return (
    <section id="tgd-core" className="slide-section border-b border-sky-200 min-h-screen flex flex-col justify-center" aria-labelledby="tgd-core-title">
      <h2 id="tgd-core-title" className="slide-title">Core Principles of TGD Relevant to Memory</h2>
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
  );
}
