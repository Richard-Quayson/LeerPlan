import React from "react";
import { useNavigate } from "react-router-dom";
import FaintBackIcon from "../assets/icons/FaintBack.png";
import DarkBackIcon from "../assets/icons/DarkBack.png";

const GoBack = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center ml-4 mt-2 cursor-pointer group w-16"
    >
      <div className="relative">
        <img
          src={FaintBackIcon}
          alt="Back"
          className="w-6 h-6 transition-opacity duration-200 group-hover:opacity-0"
        />
        <img
          src={DarkBackIcon}
          alt="Back"
          className="w-6 h-6 transition-opacity duration-200 absolute top-0 left-0 opacity-0 group-hover:opacity-100"
        />
      </div>
      <span className="ml-1 text-gray-500 transition-colors duration-300 group-hover:text-yellow-700 hover:font-semibold">
        Back
      </span>
    </div>
  );
};

export default GoBack;
