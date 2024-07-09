import React, { useState, useEffect } from "react";
import ModalContainer from "./ModalContainer";
import api from "../utility/api";
import {
  ADD_USER_METADATA_URL,
  UPDATE_USER_METADATA_URL,
} from "../utility/api_urls";
import { TIME_REGEX, EXTENDED_TIME_REGEX, STUDY_TIME_REGEX } from "../utility/constants";
import SuccessGif from "../assets/gifs/Success.gif";
import StudyTimeIcon from "../assets/icons/StudyTime.png";
import TimeIcon from "../assets/icons/Time.png";

const AddUserMetaData = ({
  isOpen,
  onClose,
  metadata = {},
  editMode = false,
}) => {
  const [minStudyTime, setMinStudyTime] = useState(
    String(metadata.min_study_time || "")
  );
  const [maxStudyTime, setMaxStudyTime] = useState(
    String(metadata.max_study_time || "")
  );
  const [sleepTime, setSleepTime] = useState(metadata.sleep_time || "");
  const [wakeTime, setWakeTime] = useState(metadata.wake_time || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsSuccess(false);
    if (editMode) {
      setMinStudyTime(String(metadata.min_study_time || ""));
      setMaxStudyTime(String(metadata.max_study_time || ""));
      setSleepTime(metadata.sleep_time || "");
      setWakeTime(metadata.wake_time || "");
    }
  }, [isOpen, metadata, editMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !minStudyTime.match(STUDY_TIME_REGEX) ||
      !maxStudyTime.match(STUDY_TIME_REGEX) ||
      !sleepTime.match(EXTENDED_TIME_REGEX) ||
      !wakeTime.match(EXTENDED_TIME_REGEX)
    ) {
      setMessage("Please fill out all fields correctly.");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        min_study_time: Number(minStudyTime),
        max_study_time: Number(maxStudyTime),
        sleep_time: sleepTime,
        wake_time: wakeTime,
      };

      const response = editMode
        ? await api.patch(`${UPDATE_USER_METADATA_URL}${metadata.id}/`, payload)
        : await api.post(ADD_USER_METADATA_URL, payload);

      if (response.status === 200 || response.status === 201) {
        setIsSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          `Failed to ${editMode ? "update" : "add"} metadata.`
      );
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputBorderColor = (value, regex) => {
    if (value === "") return "border-gray-300"; // Default border color
    return value.match(regex) ? "border-green-500" : "border-red-500";
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-center text-yellow-800">
        {editMode ? "Edit User Metadata" : "Add User Metadata"}
      </h2>
      {message && (
        <div className="text-center mb-4 text-red-500">{message}</div>
      )}
      {isSuccess ? (
        <div className="text-center">
          <img src={SuccessGif} alt="Success" className="mx-auto w-32" />
          <p className="text-green-500 font-semibold">
            Metadata {editMode ? "updated" : "added"} successfully!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-4">
          <p className="text-center text-gray-500 mb-4">
            The metadata is used when blocking times on the calendar for the
            user.
          </p>
          <div className="mb-4">
            <label
              htmlFor="minStudyTime"
              className="block text-sm font-medium text-gray-700"
            >
              Min Study Time
            </label>
            <div className="relative">
              <input
                type="text"
                id="minStudyTime"
                value={minStudyTime}
                onChange={(e) => setMinStudyTime(e.target.value)}
                className={`block w-full mt-1 p-2 border rounded-md shadow-sm sm:text-sm focus:outline-none ${getInputBorderColor(minStudyTime, STUDY_TIME_REGEX)}`}
                placeholder="Enter min study time"
                required
              />
              <img
                src={StudyTimeIcon}
                alt="Study Time Icon"
                className="absolute right-2 top-2 w-6 h-6"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="maxStudyTime"
              className="block text-sm font-medium text-gray-700"
            >
              Max Study Time
            </label>
            <div className="relative">
              <input
                type="text"
                id="maxStudyTime"
                value={maxStudyTime}
                onChange={(e) => setMaxStudyTime(e.target.value)}
                className={`block w-full mt-1 p-2 border rounded-md shadow-sm sm:text-sm focus:outline-none ${getInputBorderColor(maxStudyTime, STUDY_TIME_REGEX)}`}
                placeholder="Enter max study time"
                required
              />
              <img
                src={StudyTimeIcon}
                alt="Study Time Icon"
                className="absolute right-2 top-2 w-6 h-6"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="sleepTime"
              className="block text-sm font-medium text-gray-700"
            >
              Sleep Time
            </label>
            <div className="relative">
              <input
                type="text"
                id="sleepTime"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className={`block w-full mt-1 p-2 border rounded-md shadow-sm sm:text-sm focus:outline-none ${getInputBorderColor(sleepTime, EXTENDED_TIME_REGEX)}`}
                placeholder="HH:mm (e.g., 23:00)"
                required
              />
              <img
                src={TimeIcon}
                alt="Time Icon"
                className="absolute right-2 top-2 w-6 h-6"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="wakeTime"
              className="block text-sm font-medium text-gray-700"
            >
              Wake Time
            </label>
            <div className="relative">
              <input
                type="text"
                id="wakeTime"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className={`block w-full mt-1 p-2 border rounded-md shadow-sm sm:text-sm focus:outline-none ${getInputBorderColor(wakeTime, EXTENDED_TIME_REGEX)}`}
                placeholder="HH:mm (e.g., 06:00)"
                required
              />
              <img
                src={TimeIcon}
                alt="Time Icon"
                className="absolute right-2 top-2 w-6 h-6"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-4 px-4 py-1 border-[1px] border-yellow-800 text-yellow-800 rounded-md hover:bg-yellow-800 hover:text-white focus:outline-none"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : editMode
                ? "Update Metadata"
                : "Add Metadata"}
            </button>
          </div>
        </form>
      )}
    </ModalContainer>
  );
};

export default AddUserMetaData;
