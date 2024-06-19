import React, { useState, useEffect } from "react";
import ModalContainer from "./ModalContainer";
import { UPDATE_USER_DETAILS_URL } from "../utility/api_urls";
import api from "../utility/api";
import CameraIcon from "../assets/icons/DefaultCamera.png";

const UploadProfilePictureModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageColor, setMessageColor] = useState("text-red-500");
  const [profilePictureUploaded, setProfilePictureUploaded] = useState(false);

  useEffect(() => {
    setFile(null);
    setMessage("");
    setProfilePictureUploaded(false);
  }, [isOpen]);

  useEffect(() => {
    let timeoutId;
    if (profilePictureUploaded) {
      timeoutId = setTimeout(() => {
        onClose();
      }, 5000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [profilePictureUploaded, onClose]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("profile_picture", file);
      const response = await api.patch(UPDATE_USER_DETAILS_URL, formData);

      if (response.status === 200) {
        setMessage("Profile picture uploaded successfully.");
        setMessageColor("text-green-500");
        setProfilePictureUploaded(true);
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        setMessage(response.data.detail || "Failed to upload profile picture.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Failed to upload profile picture."
      );
    }

    setIsLoading(false);
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h2 className="text-2xl mb-4 font-bold text-yellow-800">
          Upload Profile Picture
        </h2>
        <p className="text-gray-400 mb-6">
          Choose a profile picture from your device.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {message && <div className={`mb-4 ${messageColor}`}>{message}</div>}
          <div className="relative bg-gray-200 border-2 border-yellow-800 p-4 mb-6 rounded-lg w-64 h-40 flex items-center justify-center">
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Profile"
                className="w-full h-full object-contain"
              />
            ) : (
              <img src={CameraIcon} alt="Upload" className="w-16 h-16 mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          {/* conditionally render the button based on whether the profile picture is uploaded */}
          {!profilePictureUploaded && (
            <button
              type="submit"
              className={`px-4 py-1 border border-yellow-800 bg-white font-semibold text-yellow-800 rounded-lg shadow hover:bg-yellow-800 hover:text-white ${
                isLoading && "opacity-50 cursor-not-allowed"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload"}
            </button>
          )}
        </form>
      </div>
    </ModalContainer>
  );
};

export default UploadProfilePictureModal;
