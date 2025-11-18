import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearQuery } from "../../store/features/searchSlice";

const SearchData = ({ item, idx }) => {
  const URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const HandleNavigate = (id) => {
    navigate(`/user/products/${id}`);
    dispatch(clearQuery());
  };
  return (
    <div
      onClick={() => HandleNavigate(item._id)}
      className="rounded-md w-72  bg-purple-600 flex items-center gap-3 px-4 py-1  cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        {item.variant?.images?.[0] ? (
          <img
            src={`${URL}${item.variant.images[0]}`}
            alt={item.name}
            className="w-12 h-12 object-cover rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs">No img</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate capitalize">
          {item.name}
          {item.variant?.flavour && (
            <span className="text-white font-normal">
              {" "}
              ({item.variant.flavour})
            </span>
          )}
        </p>
        <p className="text-xs text-gray-200  mt-0.5">
          {item.category?.catgName} • {item.brands?.brand_name}
        </p>
      </div>
    </div>
  );
};

export default SearchData;
