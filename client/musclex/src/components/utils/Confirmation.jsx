// components/ConfirmDialog.jsx
import React from "react";
import { confirmable, createConfirmation } from "react-confirm";
import { motion, AnimatePresence } from "framer-motion";

const Confirmation = ({ show, proceed, message }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center border border-purple-100"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-xl font-semibold text-purple-700 mb-3">
              Please Confirm
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => proceed(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-full font-medium shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Yes, Confirm
              </button>
              <button
                onClick={() => proceed(false)}
                className="bg-white text-purple-700 border border-purple-400 px-5 py-2 rounded-full font-medium hover:bg-purple-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const confirm = createConfirmation(confirmable(Confirmation));
