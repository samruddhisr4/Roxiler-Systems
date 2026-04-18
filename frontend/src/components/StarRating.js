import React, { useState } from 'react';

const StarRating = ({ value, onChange, readOnly = false, size = 22 }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`star ${s <= (hovered || value) ? 'filled' : ''}`}
          style={{ fontSize: size, cursor: readOnly ? 'default' : 'pointer' }}
          onClick={() => !readOnly && onChange && onChange(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export const StarDisplay = ({ value, size = 14 }) => {
  const numVal = parseFloat(value) || 0;
  return (
    <div className="star-display">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`star ${s <= Math.round(numVal) ? 'filled' : ''}`} style={{ fontSize: size }}>
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
