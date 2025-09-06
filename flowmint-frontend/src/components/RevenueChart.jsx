import React from 'react';

const RevenueChart = ({ data, title, type = 'bar' }) => {
  // Mock data for demonstration
  const chartData = data || [
    { month: 'Jan', revenue: 2500 },
    { month: 'Feb', revenue: 3200 },
    { month: 'Mar', revenue: 2800 },
    { month: 'Apr', revenue: 4100 },
    { month: 'May', revenue: 3800 },
    { month: 'Jun', revenue: 5200 }
  ];

  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
  const minRevenue = Math.min(...chartData.map(d => d.revenue));
  const range = maxRevenue - minRevenue;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      {type === 'bar' ? (
        <div className="space-y-4">
          <div className="flex items-end justify-between h-48 space-x-2">
            {chartData.map((item, index) => {
              const height = range > 0 ? ((item.revenue - minRevenue) / range) * 100 + 20 : 50;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="relative group">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-300 hover:from-purple-400 hover:to-pink-400"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    ></div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      ${item.revenue.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>${minRevenue.toLocaleString()}</span>
            <span>${maxRevenue.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        // Line chart
        <div className="space-y-4">
          <div className="relative h-48">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y, index) => (
                <line
                  key={index}
                  x1="0"
                  y1={y * 2}
                  x2="400"
                  y2={y * 2}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Line path */}
              <path
                d={chartData.map((item, index) => {
                  const x = (index / (chartData.length - 1)) * 400;
                  const y = 200 - ((item.revenue - minRevenue) / range) * 180 - 10;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
              
              {/* Data points */}
              {chartData.map((item, index) => {
                const x = (index / (chartData.length - 1)) * 400;
                const y = 200 - ((item.revenue - minRevenue) / range) * 180 - 10;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#8B5CF6"
                    className="hover:r-6 transition-all duration-200"
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            {chartData.map((item, index) => (
              <span key={index}>{item.month}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
