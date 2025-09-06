import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Discover Creators",
      description: "Browse through innovative projects from talented creators across art, music, gaming, and more.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: 2,
      title: "Mint an NFT to Invest",
      description: "Purchase an NFT that represents your investment in the creator's future revenue stream.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500"
    },
    {
      number: 3,
      title: "Claim Your Revenue",
      description: "As the creator generates revenue, you automatically receive your proportional share through smart contracts.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
          How It Works
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          FlowMint makes it simple to invest in creators and earn from their success. Here's how the process works:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {/* Connection line for desktop */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-600 to-transparent transform translate-x-4 z-0"></div>
            )}
            
            <div className="relative z-10 text-center">
              {/* Step number and icon */}
              <div className="relative mb-6">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-lg`}>
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-sm">
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile connection lines */}
      <div className="md:hidden flex justify-center mt-8">
        <div className="flex space-x-4">
          {steps.slice(0, -1).map((_, index) => (
            <div key={index} className="w-8 h-0.5 bg-gray-600"></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
