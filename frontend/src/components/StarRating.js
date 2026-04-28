import React from 'react';

export default function StarRating({ value, onChange, disabled }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(v => (
        <div
          key={v}
          className={`star${value >= v ? ' active' : ''}`}
          onClick={() => !disabled && onChange(v)}
          title={`${v} star${v > 1 ? 's' : ''}`}
        >
          {v}
        </div>
      ))}
    </div>
  );
}
