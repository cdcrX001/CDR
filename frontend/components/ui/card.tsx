import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children }) => (
  <div className="border-b mb-2 pb-2">{children}</div>
);

export const CardContent: React.FC<CardProps> = ({ children }) => (
  <div className="mb-2">{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children }) => (
  <h2 className="text-lg font-bold">{children}</h2>
);

export const CardDescription: React.FC<CardProps> = ({ children }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

export default Card; 