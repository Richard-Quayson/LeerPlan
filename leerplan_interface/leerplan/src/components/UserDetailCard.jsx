import React, { useState, useEffect } from "react";
import UniversityCard from "./UniversityCard";
import ProfilePicture from "../assets/images/defaultprofile.png";
import EmailIcon from "../assets/icons/Email.png";
import CalendarIcon from "../assets/icons/Calendar.png";

const UserDetailCard = ({ user, isOpen, onClose }) => {
  const [universities, setUniversities] = useState(user.universities);

  const handleDeleteUniversity = () => {
    // reload user data
    setUniversities(user.universities);
  };

  useEffect(() => {
    setUniversities(user.universities);
  }, [user]);

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
        <div className="flex items-center mb-4">
          <img
            src={user.profile_picture || ProfilePicture}
            alt="Profile"
            className="w-16 h-16 rounded-lg mr-4"
          />
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
            <div>
              Joined on {new Date(user.date_joined).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* LINE SEPARATOR */}
        <hr className="border-gray-400 w-full my-4" />

        {/* UNIVERSITY SECTION */}
        <div>
          <h3 className="font-semibold mb-2">
            University Affiliations
          </h3>
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
    </div>
  );
};

export default UserDetailCard;
