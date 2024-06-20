import React, { useState } from "react";
import YesNoPrompt from "./YesNoPrompt";
import { DELETE_USER_ROUTINE_URL } from "../utility/api_urls";
import api from "../utility/api";
import DeleteIcon from "../assets/icons/Delete.png";
import SuccessGif from "../assets/gifs/Success.gif";

const RoutineCard = ({ routine, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString(
      undefined,
      { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }
    );
    return formattedTime;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`${DELETE_USER_ROUTINE_URL}${routine.id}/`);
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        onDelete();
      }, 5000);
    } catch (error) {
      setDeleteError("Failed to delete routine.");
      setIsDeleting(false);
      setTimeout(() => {
        setDeleteError("");
      }, 5000);
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
    <div className="flex items-center p-4 border-[2px] bg-white shadow rounded-md">
      <div className="flex-grow">
        <div className="font-semibold">{routine.name}</div>
        <div className="text-gray-500">
          {formatTime(routine.start_time)} - {formatTime(routine.end_time)}
        </div>
      </div>
      {deleteSuccess ? (
        <img src={SuccessGif} alt="Success" className="w-8 h-8" />
      ) : (
        <img
          src={DeleteIcon}
          alt="Delete"
          className="w-6 h-6 cursor-pointer"
          onClick={handleDeleteClick}
        />
      )}
      {deleteError && <div className="text-red-500 mt-2">{deleteError}</div>}
      {isPromptOpen && (
        <YesNoPrompt
          question="Are you sure you want to delete this routine?"
          onYes={handleYes}
          onNo={handleNo}
        />
      )}
    </div>
  );
};

export default RoutineCard;