import React from "react";
import { Range } from "react-range";

export default function PriceRangeSlider({ priceRange, setPriceRange }) {
  const STEP = 1000;
  const MIN = 0;
  const MAX = 60000;

  return (
    <div className="w-full px-4 py-3">
      <Range
        values={priceRange}
        step={STEP}
        min={MIN}
        max={MAX}
        onChange={(values) => setPriceRange(values)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="h-2 w-full rounded-lg bg-gray-300 relative"
          >
            <div
              className="absolute h-2 bg-purple-500 rounded-lg"
              style={{
                left: `${((priceRange[0] - MIN) / (MAX - MIN)) * 100}%`,
                width: `${
                  ((priceRange[1] - priceRange[0]) / (MAX - MIN)) * 100
                }%`,
              }}
            />
            {children}
          </div>
        )}
        renderThumb={({ props }) => {
          const { key, ...rest } = props; // ✅ remove key
          return (
            <div
              key={key}
              {...rest}
              className="h-5 w-5 bg-purple-600 rounded-full shadow-md cursor-pointer hover:scale-110 transition"
            />
          );
        }}
      />

      <div className="flex justify-between mt-3 text-sm text-gray-700">
        <span>₹{priceRange[0]}</span>
        <span>₹{priceRange[1]}</span>
      </div>
    </div>
  );
}
