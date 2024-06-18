import React, { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import ModalContainer from "./ModalContainer";
import AddNewUniversityModal from "./AddNewUniversityModal";
import api from "../utility/api";
import { UNIVERSITY_LIST_URL } from "../utility/api_urls";
import SuccessGif from "../assets/gifs/Success.gif";
import UnfilledPlusIcon from "../assets/icons/UnfilledPlus.png";
import FilledPlusIcon from "../assets/icons/FilledPlus.png";

const AddExistingUniversityModal = ({
  isOpen,
  onClose,
  onUniversityAdded,
}) => {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAddNewUniversityTooltip, setShowAddNewUniversityTooltip] =
    useState(false);
  const [showAddNewUniversityModal, setShowAddNewUniversityModal] =
    useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await api.get(UNIVERSITY_LIST_URL);
      setUniversities(response.data);
    } catch (error) {
      setMessage("Failed to fetch universities");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUniversity) {
      setMessage("Please select a university.");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      setIsSuccess(true);
      setTimeout(() => {
        onUniversityAdded();
        onClose();
      }, 5000);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to add university");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewUniversityClick = () => {
    setShowAddNewUniversityModal(true);
  };

  return (
    <>
      <ModalContainer isOpen={isOpen} onClose={onClose}>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Add Existing University
        </h2>
        <p className="text-center text-gray-500 mb-4">
          Please select a university from the list.
        </p>
        {message && (
          <div className="text-center mb-4 text-red-500">{message}</div>
        )}
        {isSuccess ? (
          <div className="text-center">
            <img src={SuccessGif} alt="Success" className="mx-auto w-32" />
            <p className="text-green-500 font-semibold">
              University added successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
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
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="px-4 py-2 border-[1px] border-yellow-800 text-black rounded-md hover:bg-yellow-800 hover:text-white focus:outline-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Add University"}
              </button>
            </div>
          </form>
        )}

        {/* Plus icon for adding new university */}
        <div className="absolute bottom-4 right-4">
          <img
            src={
              showAddNewUniversityTooltip ? FilledPlusIcon : UnfilledPlusIcon
            }
            alt="Add New University"
            className="w-8 h-8 cursor-pointer"
            onClick={handleAddNewUniversityClick}
            onMouseOver={() => setShowAddNewUniversityTooltip(true)}
            onMouseOut={() => setShowAddNewUniversityTooltip(false)}
            data-tooltip-id="add-new-university-tooltip"
            data-tooltip-content="Add New University"
          />
        </div>
        <Tooltip id="add-new-university-tooltip" place="left" />
      </ModalContainer>

      {/* AddNewUniversityModal */}
      {showAddNewUniversityModal && (
        <AddNewUniversityModal
          isOpen={true}
          onClose={() => {
            setShowAddNewUniversityModal(false);
            onUniversityAdded();
            onClose();
          }}
          onUniversityAdded={() => {
            setShowAddNewUniversityModal(false);
            onUniversityAdded();
          }}
          onCloseExistingModal={onClose}
        />
      )}
    </>
  );
};

export default AddExistingUniversityModal;
