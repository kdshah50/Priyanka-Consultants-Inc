import React from 'react';

const CoursePage = () => {
  const modules = [
    "Thriving in the Digital Age", "Lean-Agile Leadership", 
    "Team and Technical Agility", "Agile Product Delivery", 
    "Lean Portfolio Management", "Leading the Transformation"
  ];

  return (
    <div className="bg-[#050505] text-white min-h-screen p-10 font-sans">
      {/* Breadcrumb / Back Navigation */}
      <nav className="text-gray-500 mb-8 uppercase text-xs tracking-widest">
        Academy Catalog / SAFe® 6.0 / <span className="text-blue-500">Leading SAFe</span>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left: Main Info */}
        <div className="lg:col-span-2">
          <h1 className="text-6xl font-bold mb-6 tracking-tighter">LEADING SAFe® 6.0</h1>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed italic">
            "Become a Lean-Agile leader who can drive transformation in the digital age."
          </p>

          <section className="mb-12">
            <h2 className="text-blue-500 font-bold uppercase tracking-widest mb-4">Course Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((m, i) => (
                <div key={i} className="border border-gray-800 p-4 hover:border-blue-500 transition-colors">
                  <span className="text-gray-600 mr-2">0{i+1}</span> {m}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Action & Exam Specs */}
        <div className="space-y-8">
          <div className="bg-white text-black p-8 rounded-sm">
            <h3 className="text-2xl font-bold mb-4">CERTIFICATION</h3>
            <p className="text-sm mb-6 uppercase tracking-tight font-semibold text-gray-600">Certified SAFe® Agilist (SA)</p>
            <button className="w-full bg-blue-600 text-white py-4 font-bold hover:bg-blue-700 transition">
              ENROLL IN COURSE
            </button>
          </div>

          <div className="border border-gray-800 p-6">
            <h4 className="text-gray-500 text-xs uppercase mb-4 tracking-widest">Exam Quick Facts</h4>
            <ul className="text-sm space-y-2">
              <li className="flex justify-between border-b border-gray-900 pb-2"><span>Questions</span> <span>45</span></li>
              <li className="flex justify-between border-b border-gray-900 pb-2"><span>Time</span> <span>90 Mins</span></li>
              <li className="flex justify-between border-b border-gray-900 pb-2"><span>Passing Score</span> <span>80%</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;