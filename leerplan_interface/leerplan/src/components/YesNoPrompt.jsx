import React from "react";

const YesNoPrompt = ({ question, onYes, onNo }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md text-center">
        <p className="text-lg mb-6">{question}</p>
        <div className="flex justify-center">
          <button
            onClick={onYes}
            className="px-4 py-1 bg-red-500 text-white rounded-md mr-8 hover:bg-red-600"
          >
            Yes
          </button>
          <button
            onClick={onNo}
            className="px-4 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default YesNoPrompt;
