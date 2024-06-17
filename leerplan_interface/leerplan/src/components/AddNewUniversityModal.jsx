import React, { useState } from "react";
import ModalContainer from "./ModalContainer";
import api from "../utility/api";
import { ADD_USER_UNIVERSITY_URL } from "../utility/api_urls";
import { NAME_REGEX } from "../utility/constants";
import SuccessGif from "../assets/gifs/Success.gif";

const AddNewUniversityModal = ({ isOpen, onClose, onUniversityAdded }) => {
  const [universityName, setUniversityName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!NAME_REGEX.test(universityName)) {
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

      if (response.status === 200 || response.status === 201) {
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

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center text-yellow-800">
        Add New University
      </h2>
      <p className="text-center mb-4">
        Please enter the name of the university you wish to add.
      </p>
      {message && (
        <div className="text-center mb-4 text-red-500 font-semibold">
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
          <div className="mb-4">
            <label htmlFor="universityName" className="block text-gray-700">
              University Name
            </label>
            <input
              type="text"
              id="universityName"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
