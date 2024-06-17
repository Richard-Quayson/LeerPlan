import React, { useState, useEffect } from "react";
import ModalContainer from "./ModalContainer";
import { Tooltip } from "react-tooltip";
import api from "../utility/api";
import { UNIVERSITY_LIST_URL } from "../utility/api_urls";
import UnfilledPlusIcon from "../assets/icons/UnfilledPlus.png";
import FilledPlusIcon from "../assets/icons/FilledPlus.png";
import AddExistingUniversityModal from "./AddExistingUniversityModal";

const SetUniversityModal = ({
  isOpen,
  onClose,
  universities,
  selectedUniversity,
  handleUniversityChange,
  onAddNewUniversityClick,
}) => {
  const [existingUniversities, setExistingUniversities] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [showAddExistingModal, setShowAddExistingModal] = useState(false);

  useEffect(() => {
    const fetchExistingUniversities = async () => {
      try {
        const response = await api.get(UNIVERSITY_LIST_URL);
        setExistingUniversities(response.data);
      } catch (error) {
        console.error("Failed to fetch existing universities", error);
      }
    };

    fetchExistingUniversities();
  }, []);

  const tooltipContent = existingUniversities.length > 0 ? "Add Existing University" : "Add New University";

  const handlePlusIconClick = () => {
    if (existingUniversities.length > 0) {
      onClose(); // Close SetUniversityModal before opening AddExistingUniversityModal
      setShowAddExistingModal(true);
    } else {
      onAddNewUniversityClick(); // Open AddNewUniversityModal
    }
  };

  return (
    <>
      <ModalContainer isOpen={isOpen} onClose={onClose}>
        <h2 className="text-xl font-semibold mb-4 text-center">Set University</h2>
        {universities.length > 0 ? (
          <select
            value={selectedUniversity}
            onChange={handleUniversityChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="" disabled>
              Choose University
            </option>
            {universities.map((uni) => (
              <option key={uni.id} value={uni.id}>
                {uni.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-center text-gray-500 my-4">
            You have not added any university to your account. Please add one.
          </div>
        )}
        <div className="flex justify-end mt-4">
          <img
            src={isHovered && existingUniversities.length > 0 ? FilledPlusIcon : UnfilledPlusIcon}
            alt="Add University"
            className="w-8 h-8 cursor-pointer"
            onClick={handlePlusIconClick}
            data-tooltip-id="add-icon-tooltip"
            data-tooltip-content={tooltipContent}
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
          />
        </div>
        <Tooltip id="add-icon-tooltip" place="left" />
      </ModalContainer>

      {showAddExistingModal && (
        <AddExistingUniversityModal
          isOpen={true} // Ensure the modal is open when showAddExistingModal is true
          onClose={() => setShowAddExistingModal(false)}
          onUniversityAdded={() => {
            setShowAddExistingModal(false);
          }}
        />
      )}
    </>
  );
};

export default SetUniversityModal;
