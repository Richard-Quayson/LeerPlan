import React, { useState } from "react";
import ModalContainer from "./ModalContainer";
import api from "../utility/api";
import { ADD_USER_ROUTINE_URL } from "../utility/api_urls";
import { NAME_REGEX, TIME_REGEX } from "../utility/constants";
import SuccessGif from "../assets/gifs/Success.gif";

const AddRoutineModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isStartTimeValid, setIsStartTimeValid] = useState(false);
  const [isEndTimeValid, setIsEndTimeValid] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isNameValid || !isStartTimeValid || !isEndTimeValid) {
      setMessage("Please fill out all fields correctly.");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(ADD_USER_ROUTINE_URL, {
        name,
        start_time: startTime,
        end_time: endTime,
      });

      if (response.status === 201) {
        setIsSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.non_field_errors ||
          "Failed to add routine."
      );
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);
    if (value !== "" && value.length > 3) {
      setIsNameValid(value.match(NAME_REGEX));
    } else {
      setIsNameValid(false);
    }
  };

  const handleStartTimeChange = (event) => {
    const value = event.target.value;
    setStartTime(value);
    if (value !== "") {
      setIsStartTimeValid(value.match(TIME_REGEX));
    } else {
      setIsStartTimeValid(false);
    }
  };

  const handleEndTimeChange = (event) => {
    const value = event.target.value;
    setEndTime(value);
    if (value !== "") {
      setIsEndTimeValid(value.match(TIME_REGEX));
    } else {
      setIsEndTimeValid(false);
    }
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center text-yellow-800">
        Add New Routine
      </h2>
      {message && (
        <div className="text-center mb-4 text-red-500">{message}</div>
      )}
      {isSuccess ? (
        <div className="text-center">
          <img src={SuccessGif} alt="Success" className="mx-auto w-32" />
          <p className="text-green-500 font-semibold">
            Routine added successfully!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-4">
          <p className="text-center text-gray-500 mb-4">
            A routine is a daily sequence of activities performed consistently
            at set times, such as morning or bedtime routines, to establish
            structure and habits in one's schedule. Examples include morning
            routines, evening routine, and regular meal times like lunch etc.
          </p>
          <div className="mb-4">
            <label
              htmlFor="routineName"
              className="block text-sm font-medium text-gray-700"
            >
              Routine Name
            </label>
            <input
              type="text"
              id="routineName"
              name="name"
              value={name}
              onChange={handleNameChange}
              className={`block w-full mt-1 p-2 border rounded-md shadow-sm sm:text-sm focus:outline-none ${
                isNameValid ? "border-green-500" : "border-gray-300"
              }`}
              placeholder="Enter routine name"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700"
            >
              Start Time
            </label>
            <input
              type="text"
              id="startTime"
              name="start_time"
              value={startTime}
              onChange={handleStartTimeChange}
              className={`block w-full mt-1 p-2 border rounded-md shadow-sm sm:text-sm focus:outline-none ${
                isStartTimeValid ? "border-green-500" : "border-gray-300"
              }`}
              placeholder="HH:mm (e.g., 08:00)"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700"
            >
              End Time
            </label>
            <input
              type="text"
              id="endTime"
              name="end_time"
              value={endTime}
              onChange={handleEndTimeChange}
              className={`block w-full mt-1 p-2 border rounded-md shadow-sm sm:text-sm focus:outline-none ${
                isEndTimeValid ? "border-green-500" : "border-gray-300"
              }`}
              placeholder="HH:mm (e.g., 09:00)"
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-4 px-4 py-1 border-[1px] border-yellow-800 text-black rounded-md hover:bg-yellow-800 hover:text-white focus:outline-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Routine"}
            </button>
          </div>
        </form>
      )}
    </ModalContainer>
  );
};

export default AddRoutineModal;
