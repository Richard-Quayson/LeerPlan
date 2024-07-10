import React, { useState } from "react";
import YesNoPrompt from "./YesNoPrompt";
import AddRoutineModal from "./AddRoutineModal";
import { DELETE_USER_ROUTINE_URL } from "../utility/api_urls";
import api from "../utility/api";
import DeleteIcon from "../assets/icons/Delete.png";
import SuccessGif from "../assets/gifs/Success.gif";

const RoutineCard = ({ routine, onDelete, summary, color }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setIsPromptOpen(true);
  };

  const handleYes = () => {
    setIsPromptOpen(false);
    handleDelete();
  };

  const handleNo = () => {
    setIsPromptOpen(false);
  };

  const handleCardClick = () => {
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div
        className="flex items-center px-4 py-1 border-[2px] shadow rounded-md relative cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex-grow">
          <div className="font-semibold text-gray-600">{routine.name}</div>
          <div className="text-gray-500 text-sm">
            {formatTime(routine.start_time)} - {formatTime(routine.end_time)}
          </div>
          <div className="text-[12px] text-gray-400">
            {routine.days === "M,T,W,Th,F,Sa,Su"
              ? "Everyday"
              : "Every " + routine.days.split(",").join(", ")}
          </div>
        </div>
        {!summary && !deleteSuccess && (
          <img
            src={DeleteIcon}
            alt="Delete"
            className="w-6 h-6 cursor-pointer"
            onClick={handleDeleteClick}
          />
        )}
        {deleteSuccess && (
          <img src={SuccessGif} alt="Success" className="w-8 h-8" />
        )}
        {deleteError && <div className="text-red-500 mt-2">{deleteError}</div>}
        {color && (
          <div
            style={{ backgroundColor: color.light }}
            className="absolute top-0 right-0 h-full w-1.5 rounded-tr-md rounded-br-md"
          />
        )}
      </div>
      {isPromptOpen && (
        <YesNoPrompt
          question="Are you sure you want to delete this routine?"
          onYes={handleYes}
          onNo={handleNo}
        />
      )}
      {isEditModalOpen && (
        <AddRoutineModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editMode={true}
          routine={routine}
        />
      )}
    </>
  );
};

export default RoutineCard;
