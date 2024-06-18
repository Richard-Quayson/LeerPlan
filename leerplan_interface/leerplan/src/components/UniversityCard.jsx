import React, { useState } from "react";
import YesNoPrompt from "./YesNoPrompt";
import { REMOVE_USER_UNIVERSITY_URL } from "../utility/api_urls";
import api from "../utility/api";
import UniversityIcon from "../assets/icons/University.png";
import DeleteIcon from "../assets/icons/Delete.png";
import SuccessIcon from "../assets/gifs/Success.gif";

const UniversityCard = ({ university, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`${REMOVE_USER_UNIVERSITY_URL}${university.id}/`);
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        onDelete();
      }, 3000);
    } catch (error) {
      setDeleteError("Failed to delete university.");
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    setIsPromptOpen(true);
  };

  const handleYes = () => {
    setIsPromptOpen(false);
    handleDelete();
  };

  const handleNo = () => {
    setIsPromptOpen(false);
  };

  return (
    <div className="flex items-center p-4 border-[2px] bg-white shadow rounded-md mb-2">
      <img src={UniversityIcon} alt="University" className="w-8 h-8 mr-4" />
      <div className="flex-grow">
        <div className="font-semibold">{university.university.name}</div>
        {university.university.location && (
          <div className="text-gray-500">{university.university.location}</div>
        )}
      </div>
      {deleteSuccess ? (
        <img src={SuccessIcon} alt="Success" className="w-8 h-8" />
      ) : (
        <img
          src={DeleteIcon}
          alt="Delete"
          className="w-8 h-8 cursor-pointer"
          onClick={handleDeleteClick}
        />
      )}
      {deleteError && <div className="text-red-500 mt-2">{deleteError}</div>}
      {isPromptOpen && (
        <YesNoPrompt
          question="Are you sure you want to delete this university?"
          onYes={handleYes}
          onNo={handleNo}
        />
      )}
    </div>
  );
};

export default UniversityCard;
