import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Alex Chen",
      role: "Digital Artist",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      content: "FlowMint has revolutionized how I monetize my art. I've raised $50K and my investors are already seeing returns. The platform is incredibly user-friendly.",
      revenue: "$50,000",
      investors: 23
    },
    {
      name: "Sarah Johnson",
      role: "Music Producer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      content: "As an independent artist, finding funding was always a challenge. FlowMint connected me with investors who believe in my vision. Game changer!",
      revenue: "$25,000",
      investors: 15
    },
    {
      name: "Mike Rodriguez",
      role: "Game Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "The smart contract system ensures transparent revenue sharing. My investors trust the platform, and I can focus on creating amazing games.",
      revenue: "$100,000",
      investors: 45
    },
    {
      name: "Dr. Emily Watson",
      role: "Educational Content Creator",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "FlowMint helped me scale my educational platform. The community of investors is supportive and understands the long-term value of quality education.",
      revenue: "$75,000",
      investors: 28
    }
  ];

  const investorTestimonials = [
    {
      name: "David Kim",
      role: "Crypto Investor",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      content: "I've invested in 5 projects on FlowMint and the returns have been consistent. The platform makes it easy to diversify across different creators.",
      totalInvested: "$15,000",
      returns: "$3,200"
    },
    {
      name: "Lisa Wang",
      role: "Venture Capitalist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      content: "FlowMint is the future of creator economy investing. The smart contracts ensure I get my fair share without any manual tracking.",
      totalInvested: "$50,000",
      returns: "$12,500"
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
          What Our Community Says
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Hear from creators and investors who are already experiencing the benefits of FlowMint's revolutionary platform.
        </p>
      </div>

      {/* Creator Testimonials */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-white mb-8 text-center">Creator Success Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>Revenue: <span className="text-green-400 font-semibold">{testimonial.revenue}</span></span>
                <span>Investors: <span className="text-blue-400 font-semibold">{testimonial.investors}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investor Testimonials */}
      <div>
        <h3 className="text-2xl font-semibold text-white mb-8 text-center">Investor Experiences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {investorTestimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>Invested: <span className="text-purple-400 font-semibold">{testimonial.totalInvested}</span></span>
                <span>Returns: <span className="text-green-400 font-semibold">{testimonial.returns}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
