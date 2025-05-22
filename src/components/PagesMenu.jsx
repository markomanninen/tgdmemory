const PagesMenu = () => {
  const diracLink = `${import.meta.env.BASE_URL}pages/dirac_propagator/index.html`;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Pages</h1>
      <ul className="space-y-4">
        <li className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <a href={diracLink} className="text-xl text-sky-600 hover:text-sky-700 font-semibold">
            Dirac Propagator
          </a>
          <p className="text-gray-600 mt-2">A detailed exploration of the Dirac propagator in the context of TGD.</p>
        </li>
        {/* Add more pages here as they become available */}
      </ul>
    </div>
  );
};

export default PagesMenu;
