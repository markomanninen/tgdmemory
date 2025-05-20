import useIntersectionObserver from '../hooks/useIntersectionObserver';

export default function ContactSection() {
  const [titleRef, titleVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [contact1Ref, contact1Visible] = useIntersectionObserver({ threshold: 0.1, delay: 200 });
  const [book1Ref, book1Visible] = useIntersectionObserver({ threshold: 0.1, delay: 300 });
  const [contact2Ref, contact2Visible] = useIntersectionObserver({ threshold: 0.1, delay: 400 });
  const [book2Ref, book2Visible] = useIntersectionObserver({ threshold: 0.1, delay: 500 });

  return (
    <section id="contact" className="slide-section py-16 md:py-24 bg-sky-50" aria-labelledby="contact-title">
      <h2 id="contact-title" ref={titleRef} className={`slide-title ${titleVisible ? 'animate-fadeInDown' : 'opacity-0'}`}>Contacts &amp; Resources</h2>
      <div className="content-text max-w-4xl mx-auto space-y-12">
        <div ref={contact1Ref} className={`p-6 bg-white rounded-lg shadow-lg ${contact1Visible ? 'animate-fadeInLeft' : 'opacity-0'}`}>
          <h3 className="text-2xl font-semibold text-sky-700 mb-3">Marko T. Manninen</h3>
          <p className="mb-1"><a href="tel:+358505882868" className="hover:text-sky-600">+358 50 5882868</a></p>
          <p className="mb-4"><a href="mailto:elonmedia@gmail.com" className="hover:text-sky-600">elonmedia@gmail.com</a></p>
          <div ref={book1Ref} className={`mt-4 pt-4 border-t border-sky-100 ${book1Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <img 
                src="tgd_early_intro.jpeg" 
                alt="Book cover placeholder for Through the Wormhole on Spacetime Surface" 
                className="w-32 sm:w-36 h-auto rounded shadow-md border border-gray-300"
              />
              <div>
                <h4 className="text-lg font-semibold text-sky-600">Through the Wormhole on Spacetime Surface: Early History of Topological Geometrodynamics Theory</h4>
                <p className="text-sm text-gray-600 mt-1">2024, Holistic Science Publications</p>
                <p className="text-sm text-gray-600">ISBN: 978-952-65432-3-9</p>
                <p className="text-sm text-gray-600 mt-2">
                  <b>ResearchGate Profile</b>: <a href="https://www.researchgate.net/profile/Marko-Manninen" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 underline">
                    researchgate.net/profile/Marko-Manninen
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div ref={contact2Ref} className={`p-6 bg-white rounded-lg shadow-lg ${contact2Visible ? 'animate-fadeInRight' : 'opacity-0'}`}>
          <h3 className="text-2xl font-semibold text-sky-700 mb-3">Matti J. Pitkänen</h3>
          <p className="mb-1"><a href="tel:+358400587258" className="hover:text-sky-600">+358 40 0587258</a></p>
          <p className="mb-4"><a href="mailto:matpitka6@gmail.com" className="hover:text-sky-600">matpitka6@gmail.com</a></p>
          <div ref={book2Ref} className={`mt-4 pt-4 border-t border-sky-100 ${book2Visible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <img 
                src="tgd_revised.jpg" 
                alt="Book cover placeholder for Topological Geometrodynamics: Revised Edition" 
                className="w-32 sm:w-36 h-auto rounded shadow-md border border-gray-300"
              />
              <div>
                <h4 className="text-lg font-semibold text-sky-600">Topological Geometrodynamics: Revised Edition</h4>
                <p className="text-sm text-gray-600 mt-1">2016, Bentham Books</p>
                <p className="text-sm text-gray-600">ISBN: 978-1-68108-179-3</p>
                <p className="text-sm text-gray-600 mt-2">
                  <b>Blogspot</b>: <a href="https://matpitka.blogspot.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 underline">
                    matpitka.blogspot.com
                  </a> &bull; <b>TGD Theory</b>: <a href="https://www.tgdtheory.fi" target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 underline">
                    tgdtheory.fi
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
