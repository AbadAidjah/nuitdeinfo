import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, className = '', id, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`appearance-none block w-full border ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-all duration-200 ${
            icon ? 'pl-10 px-3 py-2.5' : 'px-3 py-2.5'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 animate-pulse">{error}</p>}
    </div>
  );
};

export default Input;