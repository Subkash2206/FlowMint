import React from 'react';

const PortfolioChart = ({ data, title }) => {
  // Mock data for demonstration
  const chartData = data || [
    { category: 'Art', amount: 15000, color: '#8B5CF6' },
    { category: 'Music', amount: 12000, color: '#EC4899' },
    { category: 'Gaming', amount: 8000, color: '#10B981' },
    { category: 'Education', amount: 5000, color: '#F59E0B' },
    { category: 'Other', amount: 3000, color: '#6B7280' }
  ];

  const total = chartData.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = chartData.map(item => {
    const percentage = (item.amount / total) * 100;
    const angle = (item.amount / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    
    return {
      ...item,
      percentage,
      angle,
      startAngle,
      endAngle
    };
  });

  // Create SVG path for pie segments
  const createArcPath = (startAngle, endAngle, radius = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", 100, 100,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      
      <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createArcPath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="text-white text-sm">{segment.category}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  ${segment.amount.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs">
                  {segment.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
          
          {/* Total */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Total Portfolio</span>
              <span className="text-white font-bold text-lg">
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
