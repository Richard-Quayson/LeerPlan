import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const ModalContainer = ({ isOpen, onClose, children }) => {
  // prevent scrolling when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // render modal only when it is open
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-900 text-2xl"
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default ModalContainer;
