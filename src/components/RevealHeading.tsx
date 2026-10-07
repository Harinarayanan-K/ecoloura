import React from 'react';

interface RevealHeadingProps {
  as?: 'h1' | 'h2';
  className?: string;
  children: React.ReactNode;
}

/** Keep the original heading semantics and emphasis while revealing each line. */
export function RevealHeading({ as: Tag = 'h2', className = '', children }: RevealHeadingProps) {
  const lines: React.ReactNode[][] = [[]];
  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && child.type === 'br') lines.push([]);
    else lines[lines.length - 1].push(child);
  });

  return <Tag className={`text-reveal-group ${className}`}>
    {lines.map((line, index) => <React.Fragment key={index}>
      {index > 0 && ' '}
      <span className="text-reveal-line" style={{ '--line-delay': `${index * 150}ms` } as React.CSSProperties}>
        <span className="text-reveal-line-inner">{line}</span>
      </span>
    </React.Fragment>)}
  </Tag>;
}
