import React, { useState, useEffect } from "react";
import SetUniversityModal from "./SetUniversityModal";
import AddNewUniversityModal from "./AddNewUniversityModal";
import AddExistingUniversityModal from "./AddExistingUniversityModal";
import { USER_UNIVERSITY_LIST_URL } from "../utility/api_urls";
import {
  PREFERRED_UNIVERSITY_NAME,
  PREFERRED_UNIVERSITY_ID,
} from "../utility/constants";
import api from "../utility/api";
import ProfilePicture from "../assets/images/defaultprofile.png";

const UserProfileCard = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUniversityModalOpen, setIsAddUniversityModalOpen] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await api.get(USER_UNIVERSITY_LIST_URL);
        setUniversities(response.data);

        // Check if preferred university name is set in local storage
        const preferredUniversityName = localStorage.getItem(PREFERRED_UNIVERSITY_NAME);
        const preferredUniversityId = localStorage.getItem(PREFERRED_UNIVERSITY_ID);

        // If preferred university is set, use it
        if (preferredUniversityName && preferredUniversityId) {
          setSelectedUniversity(preferredUniversityName);
        } else {
          // If user has universities and preferred university is not set, pre-select the first one
          if (response.data.length > 0) {
            setSelectedUniversity(response.data[0].university.name);
            localStorage.setItem(PREFERRED_UNIVERSITY_NAME, response.data[0].university.name);
            localStorage.setItem(PREFERRED_UNIVERSITY_ID, response.data[0].university.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user universities", error);
      }
    };

    fetchUniversities();
  }, []);

  const handleUniversityChange = (event) => {
    const selectedId = parseInt(event.target.value);
    const selectedUni = universities.find((uni) => uni.university.id === selectedId);

    if (selectedUni) {
      setSelectedUniversity(selectedUni.university.name);
      localStorage.setItem(PREFERRED_UNIVERSITY_NAME, selectedUni.university.name);
      localStorage.setItem(PREFERRED_UNIVERSITY_ID, selectedUni.university.id);
    } else {
      setSelectedUniversity("");
      localStorage.removeItem(PREFERRED_UNIVERSITY_NAME);
      localStorage.removeItem(PREFERRED_UNIVERSITY_ID);
    }
  };

  const handleUniversityAdded = () => {
    setIsAddUniversityModalOpen(false);
    window.location.reload();
  };

  const renderUniversitySection = () => {
    if (universities.length === 0) {
      // First State: No universities added
      return (
        <div
          className="text-blue-500 cursor-pointer"
          onClick={() => setIsAddUniversityModalOpen(true)}
        >
          Add University
        </div>
      );
    } else if (universities.length === 1) {
      // Second State: One university added
      return (
        <div className="text-blue-500 cursor-default">
          {universities[0].university.name}
        </div>
      );
    } else {
      // Third State: Two or more universities added
      return (
        <div
          className="text-blue-500 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          {universities[0].university.name}
        </div>
      );
    }
  };

  return (
    <div className="flex items-center p-4 bg-white shadow rounded-md">
      <img
        src={user.profile_picture || ProfilePicture}
        alt="Profile"
        className="w-16 h-16 rounded-lg mr-4"
      />
      <div>
        <div className="font-semibold text-gray-700">
          {user.firstname} {user.lastname}
        </div>
        {renderUniversitySection()}
      </div>

      <SetUniversityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        universities={universities}
        selectedUniversity={selectedUniversity}
        handleUniversityChange={handleUniversityChange}
        onAddNewUniversityClick={() => {
          setIsModalOpen(false);
          setIsAddUniversityModalOpen(true);
        }}
      />

      <AddNewUniversityModal
        isOpen={isAddUniversityModalOpen}
        onClose={() => setIsAddUniversityModalOpen(false)}
        onUniversityAdded={handleUniversityAdded}
      />
    </div>
  );
};

export default UserProfileCard;
