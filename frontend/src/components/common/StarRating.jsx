import React, { useState } from 'react';

const StarRating = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            // The className is removed from the button
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            {/* The className logic is now correctly on the span */}
            <span 
              className={`star ${ratingValue <= (hover || rating) ? 'star-filled' : 'star-empty'}`}
            >
              &#9733;
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;