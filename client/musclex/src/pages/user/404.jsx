import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-5 rounded-full">
            <AlertTriangle size={48} className="text-red-600" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-800 mb-3">404</h1>

        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Page not found
        </h2>

        <p className="text-gray-500 mb-6">
          The page you’re trying to access doesn’t exist or was moved.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Go Back
          </button>

          <Link
            to="/"
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
