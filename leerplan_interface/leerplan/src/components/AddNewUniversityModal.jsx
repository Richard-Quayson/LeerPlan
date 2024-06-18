import React, { useState } from "react";
import ModalContainer from "./ModalContainer";
import AddExistingUniversityModal from "./AddExistingUniversityModal";
import api from "../utility/api";
import { ADD_USER_UNIVERSITY_URL } from "../utility/api_urls";
import { NAME_REGEX } from "../utility/constants";
import UniversityIcon from "../assets/icons/UniversityInput.png";
import SuccessGif from "../assets/gifs/Success.gif";

const AddNewUniversityModal = ({ isOpen, onClose, onUniversityAdded }) => {
  const [universityName, setUniversityName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isNameValid) {
      setMessage("Invalid university name.");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(ADD_USER_UNIVERSITY_URL, {
        name: universityName,
      });

      if (response.status === 201) {
        setIsSuccess(true);
        setTimeout(() => {
          onUniversityAdded();
          onClose();
        }, 5000);
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to add university");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUniversityNameChange = (event) => {
    const value = event.target.value;
    setUniversityName(value);
    setIsNameValid(value.trim() !== "" && NAME_REGEX.test(value));
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center text-yellow-800">
        Add New University
      </h2>
      <p className="text-center text-gray-500 mb-4">
        Please enter the name of the university you wish to add.
      </p>
      {message && (
        <div className="text-center mb-4 text-red-500">
          {message}
        </div>
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
          <div className="relative mb-4">
            <label
              htmlFor="universityName"
              className="block text-sm font-medium text-gray-700"
            >
              University Name
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                id="universityName"
                name="name"
                value={universityName}
                onChange={handleUniversityNameChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                  universityName
                    ? isNameValid
                      ? "border-green-500"
                      : "border-red-500"
                    : "border-gray-300"
                } focus:outline-none`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={UniversityIcon} alt="Name Icon" className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-4 py-2 border-[1px] border-yellow-800 text-black rounded-md hover:bg-yellow-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Add University"}
            </button>
          </div>
        </form>
      )}
    </ModalContainer>
  );
};

export default AddNewUniversityModal;
