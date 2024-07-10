import React, { useState } from "react";
import moment from "moment";
import AddUserMetaData from "./AddUserMetaData";
import EditPencilIcon from "../assets/icons/EditPencil.png";

const UserMetaData = ({ metadata }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTime = (time) => {
    return moment(time, "HH:mm:ss").format("hh:mm A");
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">User Metadata</h3>
        <button onClick={handleEditClick}>
          <img src={EditPencilIcon} alt="Edit" className="w-6 h-6" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="text-yellow-800 font-semibold flex-[6] text-left">
            Min Study Time:
          </span>
          <span className="font-semibold text-gray-500 flex-[6] text-left">
            {metadata?.min_study_time} hours
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-800 font-semibold flex-[6] text-left">
            Max Study Time:
          </span>
          <span className="font-semibold text-gray-500 flex-[6] text-left">
            {metadata?.max_study_time} hours
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-800 font-semibold flex-[6] text-left">
            Sleep Time:
          </span>
          <span className="font-semibold text-gray-500 flex-[6] text-left">
            {formatTime(metadata?.sleep_time)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-800 font-semibold flex-[6] text-left">
            Wake Time:
          </span>
          <span className="font-semibold text-gray-500 flex-[6] text-left">
            {formatTime(metadata?.wake_time)}
          </span>
        </div>
      </div>
      {isModalOpen && (
        <AddUserMetaData
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          metadata={metadata}
          editMode={true}
        />
      )}
    </div>
  );
};

export default UserMetaData;
