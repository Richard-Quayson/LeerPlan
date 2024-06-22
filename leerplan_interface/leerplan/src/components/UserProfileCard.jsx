import React, { useState, useEffect } from "react";
import SetUniversityModal from "./SetUniversityModal";
import AddNewUniversityModal from "./AddNewUniversityModal";
import AddExistingUniversityModal from "./AddExistingUniversityModal";
import UserDetailCard from "./UserDetailCard";
import {
  USER_UNIVERSITY_LIST_URL,
  UNIVERSITY_LIST_URL,
} from "../utility/api_urls";
import {
  PREFERRED_UNIVERSITY_NAME,
  PREFERRED_UNIVERSITY_ID,
} from "../utility/constants";
import api from "../utility/api";
import ProfilePicture from "../assets/images/defaultprofile.png";

const UserProfileCard = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUniversityModalOpen, setIsAddUniversityModalOpen] =
    useState(false);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [showAddExistingUniversityModal, setShowAddExistingUniversityModal] =
    useState(false);
  const [existingUniversities, setExistingUniversities] = useState([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await api.get(USER_UNIVERSITY_LIST_URL);
        setUniversities(response.data);

        const preferredUniversityName = localStorage.getItem(
          PREFERRED_UNIVERSITY_NAME
        );
        const preferredUniversityId = localStorage.getItem(
          PREFERRED_UNIVERSITY_ID
        );

        if (preferredUniversityName && preferredUniversityId) {
          setSelectedUniversity(preferredUniversityId);
        } else {
          if (response.data.length > 0) {
            setSelectedUniversity(response.data[0].university.id.toString());
            localStorage.setItem(
              PREFERRED_UNIVERSITY_NAME,
              response.data[0].university.name
            );
            localStorage.setItem(
              PREFERRED_UNIVERSITY_ID,
              response.data[0].university.id
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch user universities", error);
      }
    };

    fetchUniversities();
  }, []);

  const handleUniversityChange = (event) => {
    setSelectedUniversity(event.target.value);
  };

  const handleUniversityAdded = () => {
    setIsAddUniversityModalOpen(false);
    setShowAddExistingUniversityModal(false);
    window.location.reload();
  };

  const fetchExistingUniversities = async () => {
    try {
      const response = await api.get(UNIVERSITY_LIST_URL);
      setExistingUniversities(response.data);
    } catch (error) {
      console.error("Failed to fetch existing universities", error);
    }
  };

  useEffect(() => {
    fetchExistingUniversities();
  }, []);

  const handleAddUniversityClick = async () => {
    if (existingUniversities && existingUniversities.length > 0) {
      setShowAddExistingUniversityModal(true);
    } else {
      setIsAddUniversityModalOpen(true);
    }
  };

  const renderUniversitySection = () => {
    if (universities.length === 0) {
      return (
        <div
          className="text-blue-500 cursor-pointer"
          onClick={handleAddUniversityClick}
        >
          Add University
        </div>
      );
    } else if (universities.length === 1) {
      return (
        <div className="text-blue-500 cursor-default">
          {universities[0] && universities[0].university.name}
        </div>
      );
    } else {
      const selectedUni = universities.find(
        (uni) => uni.university.id.toString() === selectedUniversity
      );
      return (
        <div
          className="text-blue-500 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          {selectedUni && selectedUni.university.name}
        </div>
      );
    }
  };

  return (
    <div>
      <div className="flex items-center p-4 bg-white shadow rounded-md cursor-pointer">
        <img
          // src={user.profile_picture || ProfilePicture}
          src={ProfilePicture}
          alt="Profile"
          className="w-16 h-16 rounded-lg mr-4"
          onClick={() => setIsUserDetailOpen(true)}
        />
        <div>
          <div
            className="font-semibold text-gray-700 mb-1"
            onClick={() => setIsUserDetailOpen(true)}
          >
            {user.firstname} {user.lastname}
          </div>
          {renderUniversitySection()}
        </div>
      </div>

      <SetUniversityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        universities={universities}
        selectedUniversity={selectedUniversity}
        handleSetUniversity={(selectedId) => {
          setSelectedUniversity(selectedId.toString());
          setIsModalOpen(false);
        }}
        handleUniversityChange={handleUniversityChange}
      />

      <AddNewUniversityModal
        isOpen={isAddUniversityModalOpen}
        onClose={() => setIsAddUniversityModalOpen(false)}
        onUniversityAdded={handleUniversityAdded}
      />

      <AddExistingUniversityModal
        isOpen={showAddExistingUniversityModal}
        onClose={() => setShowAddExistingUniversityModal(false)}
        onUniversityAdded={handleUniversityAdded}
      />

      <UserDetailCard
        user={user}
        isOpen={isUserDetailOpen}
        onClose={() => setIsUserDetailOpen(false)}
      />
    </div>
  );
};

export default UserProfileCard;
