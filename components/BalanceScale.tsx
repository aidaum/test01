
import React from 'react';

interface BalanceScaleProps {
  left: string;
  right: string;
}

const BalanceScale: React.FC<BalanceScaleProps> = ({ left, right }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border-4 border-blue-100 shadow-inner">
      <div className="relative w-full h-40 flex items-end justify-center">
        {/* Horizontal Beam */}
        <div className="absolute top-1/2 left-1/4 right-1/4 h-2 bg-gray-400 rounded-full transform -translate-y-1/2"></div>
        
        {/* Left Pan */}
        <div className="flex flex-col items-center w-1/3">
          <div className="bg-yellow-100 p-4 rounded-t-lg border-2 border-yellow-300 w-full text-center font-bold text-blue-600">
            {left}
          </div>
          <div className="w-1 h-12 bg-gray-400"></div>
        </div>

        {/* Pivot */}
        <div className="w-8 h-8 bg-blue-500 rounded-full -mt-4 border-4 border-white shadow-md"></div>

        {/* Right Pan */}
        <div className="flex flex-col items-center w-1/3">
          <div className="bg-green-100 p-4 rounded-t-lg border-2 border-green-300 w-full text-center font-bold text-green-700">
            {right}
          </div>
          <div className="w-1 h-12 bg-gray-400"></div>
        </div>
      </div>
      <div className="w-24 h-4 bg-gray-500 rounded-t-lg"></div>
      <p className="mt-4 text-sm text-gray-500 italic">"등식의 양변은 저울처럼 항상 평형을 이루어야 해!"</p>
    </div>
  );
};

export default BalanceScale;
