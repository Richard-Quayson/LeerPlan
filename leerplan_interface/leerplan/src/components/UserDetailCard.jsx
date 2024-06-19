import React, { useState, useEffect } from "react";
import UniversityCard from "./UniversityCard";
import ProfilePicture from "../assets/images/defaultprofile.png";
import AddExistingUniversityModal from "./AddExistingUniversityModal";
import UploadProfilePictureModal from "./UploadProfilePictureModal";
import AddCameraIcon from "../assets/icons/AddCamera.png";
import EmailIcon from "../assets/icons/Email.png";
import CalendarIcon from "../assets/icons/Calendar.png";
import FilledPlusIcon from "../assets/icons/FilledPlus.png";
import UnfilledPlusIcon from "../assets/icons/UnfilledPlus.png";

const UserDetailCard = ({ user, isOpen, onClose }) => {
  const [universities, setUniversities] = useState(user.universities);
  const [
    isAddExistingUniversityModalOpen,
    setIsAddExistingUniversityModalOpen,
  ] = useState(false);
  const [isUploadProfilePictureModalOpen, setIsUploadProfilePictureModalOpen] =
    useState(false);
  const [isPlusIconHovered, setIsPlusIconHovered] = useState(false);

  const handleDeleteUniversity = () => {
    setUniversities(user.universities);
    window.location.reload();
  };

  useEffect(() => {
    setUniversities(user.universities);
  }, [user]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex transition-transform duration-300 ${
        isOpen ? "transform translate-x-0" : "transform -translate-x-full"
      }`}
    >
      <div className="w-1/3 bg-white p-6 shadow-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-900 text-2xl"
        >
          &times;
        </button>

        {/* USER PROFILE SECTION */}
        <div className="flex items-center mb-6 relative">
          <div className="relative">
            <img
              // src={user.profile_picture || ProfilePicture}
              src={ProfilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-lg mr-4"
            />
            <img
              src={AddCameraIcon}
              alt="Add Camera"
              className="w-8 h-8 absolute bottom-2 right-4 transform translate-x-1/2 translate-y-2/3 cursor-pointer"
              onClick={() => setIsUploadProfilePictureModalOpen(true)}
            />
          </div>
          <div>
            <div className="text-xl font-semibold">
              {user.firstname} {user.lastname}
            </div>
            {user.preferred_university && (
              <div className="text-gray-500">
                {user.preferred_university.name}
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center">
            <img src={EmailIcon} alt="Email" className="w-6 h-6 mr-2" />
            <div>{user.email}</div>
          </div>
          <div className="flex items-center mt-2 text-gray-500">
            <img
              src={CalendarIcon}
              alt="Date Joined"
              className="w-6 h-6 mr-2"
            />
            <div className="text-sm">
              Joined on {formatDate(user.date_joined)}
            </div>
          </div>
        </div>

        {/* LINE SEPARATOR */}
        <hr className="border-gray-400 w-full my-4" />

        {/* UNIVERSITY SECTION */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">University Affiliations</h3>
            <img
              src={isPlusIconHovered ? FilledPlusIcon : UnfilledPlusIcon}
              alt="Add University"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setIsAddExistingUniversityModalOpen(true)}
              onMouseOver={() => setIsPlusIconHovered(true)}
              onMouseOut={() => setIsPlusIconHovered(false)}
            />
          </div>
          {universities.map((university) => (
            <UniversityCard
              key={university.id}
              university={university}
              onDelete={handleDeleteUniversity}
            />
          ))}
        </div>
      </div>
      <div
        className={`w-2/3 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Add Existing University Modal */}
      <AddExistingUniversityModal
        isOpen={isAddExistingUniversityModalOpen}
        onClose={() => setIsAddExistingUniversityModalOpen(false)}
        onUniversityAdded={handleDeleteUniversity}
      />

      {/* Upload Profile Picture Modal */}
      <UploadProfilePictureModal
        isOpen={isUploadProfilePictureModalOpen}
        onClose={() => setIsUploadProfilePictureModalOpen(false)}
      />
    </div>
  );
};

export default UserDetailCard;
