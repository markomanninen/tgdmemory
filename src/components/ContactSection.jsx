import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function ContactSection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [contact1Ref, contact1Visible] = useIntersectionObserver({ threshold: 0.1, delay: 200 });
  const [book1Ref, book1Visible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });
  const [contact2Ref, contact2Visible] = useIntersectionObserver({ threshold: 0.1, delay: 400 });
  const [book2Ref, book2Visible] = useIntersectionObserver({ threshold: 0.1, delay: 500 });

  return (
    <section id="contact" className="section py-20 md:py-32 relative min-h-screen flex flex-col justify-center bg-gradient-to-br from-sky-50/50 to-blue-50/30" aria-labelledby="contact-title">
      <div className="relative z-10">
        <h2 id="contact-title" ref={titleRef} className={`text-4xl md:text-5xl lg:text-6xl font-black text-center mb-6 md:mb-8 ${titleVisible ? 'animate-fadeInDown' : 'opacity-0'} gradient-text`}>
          Contacts &amp; Resources
        </h2>
        
        <div className="max-w-6xl mx-auto space-y-8">
          <div ref={contact1Ref} className={`p-10 ${contact1Visible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
            <div className="grid md:grid-cols-3 gap-6 items-start">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold gradient-text mb-4">Marko T. Manninen</h3>
                <p className="text-lg"><a href="tel:+358505882868" className="text-sky-600 hover:text-sky-800 transition-colors">+358 50 5882868</a></p>
                <p className="text-lg"><a href="mailto:elonmedia@gmail.com" className="text-sky-600 hover:text-sky-800 transition-colors">elonmedia@gmail.com</a></p>
                <p className="text-sm text-slate-600 mt-4">
                  <b>ResearchGate Profile</b>:<br />
                  <a href="https://www.researchgate.net/profile/Marko-Manninen" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 underline transition-colors">
                    researchgate.net/profile/Marko-Manninen
                  </a>
                </p>
              </div>
              <div ref={book1Ref} className={`md:col-span-2 ${book1Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <img 
                    src="tgd_early_intro.jpeg" 
                    alt="Book cover for Through the Wormhole on Spacetime Surface" 
                    className="w-40 h-auto rounded-lg shadow-lg border border-slate-200"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Through the Wormhole on Spacetime Surface</h4>
                    <p className="text-lg text-slate-700 mb-1">Early History of Topological Geometrodynamics Theory</p>
                    <p className="text-sm text-slate-600 mb-1">2024, Holistic Science Publications</p>
                    <p className="text-sm text-slate-600">ISBN: 978-952-65432-3-9</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div ref={contact2Ref} className={`p-10 ${contact2Visible ? 'animate-fadeInRight' : 'opacity-0'}`}>
            <div className="grid md:grid-cols-3 gap-6 items-start">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold gradient-text mb-4">Matti J. Pitkänen</h3>
                <p className="text-lg"><a href="tel:+358400587258" className="text-sky-600 hover:text-sky-800 transition-colors">+358 40 0587258</a></p>
                <p className="text-lg"><a href="mailto:matpitka6@gmail.com" className="text-sky-600 hover:text-sky-800 transition-colors">matpitka6@gmail.com</a></p>
                <div className="text-sm text-slate-600 mt-4 space-y-2">
                  <p>
                    <b>Blogspot</b>:<br />
                    <a href="https://matpitka.blogspot.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 underline transition-colors">
                      matpitka.blogspot.com
                    </a>
                  </p>
                  <p>
                    <b>TGD Theory</b>:<br />
                    <a href="https://www.tgdtheory.fi" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-800 underline transition-colors">
                      tgdtheory.fi
                    </a>
                  </p>
                </div>
              </div>
              <div ref={book2Ref} className={`md:col-span-2 ${book2Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <img 
                    src="tgd_revised.jpg" 
                    alt="Book cover for Topological Geometrodynamics: Revised Edition" 
                    className="w-40 h-auto rounded-lg shadow-lg border border-slate-200"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-800 mb-2">Topological Geometrodynamics</h4>
                    <p className="text-lg text-slate-700 mb-1">Revised Edition</p>
                    <p className="text-sm text-slate-600 mb-1">2016, Bentham Books</p>
                    <p className="text-sm text-slate-600">ISBN: 978-1-68108-179-3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
