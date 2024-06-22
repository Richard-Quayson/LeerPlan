import React, { useState, useEffect } from "react";
import ModalContainer from "./ModalContainer";
import { Tooltip } from "react-tooltip";
import api from "../utility/api";
import { UNIVERSITY_LIST_URL } from "../utility/api_urls";
import UnfilledPlusIcon from "../assets/icons/UnfilledPlus.png";
import FilledPlusIcon from "../assets/icons/FilledPlus.png";
import AddExistingUniversityModal from "./AddExistingUniversityModal";
import AddNewUniversityModal from "./AddNewUniversityModal";

const SetUniversityModal = ({
  isOpen,
  onClose,
  universities,
  selectedUniversity,
  handleSetUniversity,
}) => {
  const [existingUniversities, setExistingUniversities] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [showAddExistingModal, setShowAddExistingModal] = useState(false);
  const [showAddNewModal, setShowAddNewModal] = useState(false);

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

  const tooltipContent =
    existingUniversities.length > 0
      ? "Add Existing University"
      : "Add New University";

  const handlePlusIconClick = () => {
    if (existingUniversities.length > 0) {
      setShowAddExistingModal(true);
    } else {
      setShowAddNewModal(true);
    }
  };

  const handleSelectChange = (event) => {
    const selectedId = parseInt(event.target.value);
    const selectedUni = universities.find(
      (uni) => uni.university.id === selectedId
    );

    if (selectedUni) {
      handleSetUniversity(selectedUni.university.id);
      onClose();
    }
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center">Set University</h2>
      {universities.length > 0 ? (
        <>
          <select
            value={selectedUniversity}
            onChange={handleSelectChange}
            className="w-full p-2 border rounded-md"
          >
            {universities.map((uni) => (
              <option key={uni.university.id} value={uni.university.id}>
                {uni.university.name}
              </option>
            ))}
          </select>
          <div className="flex justify-center mt-4">
            <img
              src={
                isHovered && existingUniversities.length > 0
                  ? FilledPlusIcon
                  : UnfilledPlusIcon
              }
              alt="Add University"
              className="w-8 h-8 cursor-pointer"
              onClick={handlePlusIconClick}
              data-tooltip-id="add-icon-tooltip"
              data-tooltip-content={tooltipContent}
              onMouseOver={() => setIsHovered(true)}
              onMouseOut={() => setIsHovered(false)}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 my-4">
          You have not added any university to your account. Please add one.
        </div>
      )}
      <Tooltip id="add-icon-tooltip" place="left" />

      {showAddExistingModal && (
        <AddExistingUniversityModal
          isOpen={true}
          onClose={() => {
            setShowAddExistingModal(false);
            onClose();
          }}
          onUniversityAdded={onClose}
        />
      )}

      {showAddNewModal && (
        <AddNewUniversityModal
          isOpen={true}
          onClose={() => {
            setShowAddNewModal(false);
            onClose();
          }}
          onUniversityAdded={onClose}
        />
      )}
    </ModalContainer>
  );
};

export default SetUniversityModal;
