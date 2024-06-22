import React, { useState, useEffect } from "react";
import UniversityCard from "./UniversityCard";
import RoutineCard from "./RoutineCard";
import ProfilePicture from "../assets/images/defaultprofile.png";
import AddExistingUniversityModal from "./AddExistingUniversityModal";
import AddRoutineModal from "./AddRoutineModal";
import UploadProfilePictureModal from "./UploadProfilePictureModal";
import { UPDATE_USER_DETAILS_URL, USER_DETAILS_URL } from "../utility/api_urls";
import api from "../utility/api";
import AddCameraIcon from "../assets/icons/AddCamera.png";
import EditPencilIcon from "../assets/icons/EditPencil.png";
import EllipsisIcon from "../assets/icons/Ellipsis.png";
import EmailIcon from "../assets/icons/Email.png";
import CalendarIcon from "../assets/icons/Calendar.png";
import FilledPlusIcon from "../assets/icons/FilledPlus.png";
import UnfilledPlusIcon from "../assets/icons/UnfilledPlus.png";
import SubmitIcon from "../assets/icons/Submit.png";
import SuccessGif from "../assets/gifs/Success.gif";

const UserDetailCard = ({ user, isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [
    isAddExistingUniversityModalOpen,
    setIsAddExistingUniversityModalOpen,
  ] = useState(false);
  const [isAddingRoutineModalOpen, setIsAddingRoutineModalOpen] =
    useState(false);
  const [isUploadProfilePictureModalOpen, setIsUploadProfilePictureModalOpen] =
    useState(false);
  const [isAddUniversityHovered, setIsAddUniversityHovered] = useState(false);
  const [isAddRoutineHovered, setIsAddRoutineHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [firstname, setFirstname] = useState(user.firstname);
  const [lastname, setLastname] = useState(user.lastname);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditSuccessful, setIsEditSuccessful] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(USER_DETAILS_URL);
        const data = response.data;
        setUserData(data);
        setUniversities(data.universities);
        setRoutines(data.routines);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleDeleteUniversity = (id) => {
    setUniversities((prevUniversities) =>
      prevUniversities.filter((university) => university.id !== id)
    );
  };

  const handleDeleteRoutine = (id) => {
    setRoutines((prevRoutines) =>
      prevRoutines.filter((routine) => routine.id !== id)
    );
  };

  const handleUniversityAdded = async () => {
    const response = await api.get(GET_USER_DETAILS_URL);
    const data = response.data;
    setUserData(data);
    setUniversities(data.universities);
  };

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const response = await api.patch(UPDATE_USER_DETAILS_URL, {
          firstname,
          lastname,
        });

        if (response.status === 200) {
          setIsEditSuccessful(true);
          setIsLoading(false);
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        } else {
          setMessage(response.data.detail || "Failed to update profile.");
          setIsLoading(false);
        }
      } catch (error) {
        setMessage(error.response?.data?.detail || "Failed to update profile.");
        setIsLoading(false);
      }

      setTimeout(() => {
        setMessage("");
      }, 5000);
    }, 3000);
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
          <div className="flex-1">
            {!isEditing ? (
              <>
                <div className="text-xl font-semibold">
                  {userData?.firstname} {userData?.lastname}
                </div>
                {userData?.preferred_university && (
                  <div className="text-gray-500">
                    {userData.preferred_university.name}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 w-6 h-6 transform translate-x-1/2 translate-y-2/3">
                  <img
                    src={EditPencilIcon}
                    alt="Edit"
                    className="w-full h-full cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  />
                </div>
              </>
            ) : (
              <form onSubmit={handleEditSubmit} className="flex flex-col">
                {message && <div className="mb-4 text-red-500">{message}</div>}
                <div className="flex items-center">
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      className="mb-2 p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      className="mb-2 p-2 border border-gray-300 rounded"
                    />
                  </div>
                  {isLoading ? (
                    <img src={EllipsisIcon} alt="Loading" className="w-6 h-6" />
                  ) : isEditSuccessful ? (
                    <img src={SuccessGif} alt="Success" className="w-6 h-6" />
                  ) : (
                    <button type="submit" className="p-0">
                      <img src={SubmitIcon} alt="Submit" className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center">
            <img src={EmailIcon} alt="Email" className="w-6 h-6 mr-2" />
            <div>{userData?.email}</div>
          </div>
          <div className="flex items-center mt-2 text-gray-500">
            <img
              src={CalendarIcon}
              alt="Date Joined"
              className="w-6 h-6 mr-2"
            />
            <div className="text-sm">
              Joined on {formatDate(userData?.date_joined)}
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
              src={isAddUniversityHovered ? FilledPlusIcon : UnfilledPlusIcon}
              alt="Add University"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setIsAddExistingUniversityModalOpen(true)}
              onMouseOver={() => setIsAddUniversityHovered(true)}
              onMouseOut={() => setIsAddUniversityHovered(false)}
            />
          </div>
          {universities.length > 0 ? (
            universities.map((university) => (
              <UniversityCard
                key={university.id}
                university={university}
                onDelete={handleDeleteUniversity}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 mt-4">
              You are not affiliated with any university.
            </div>
          )}
        </div>

        {/* LINE SEPARATOR */}
        <hr className="border-gray-400 w-full mt-8 mb-4" />

        {/* ROUTINE SECTION */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Routines</h3>
            <img
              src={isAddRoutineHovered ? FilledPlusIcon : UnfilledPlusIcon}
              alt="Add Routine"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setIsAddingRoutineModalOpen(true)}
              onMouseOver={() => setIsAddRoutineHovered(true)}
              onMouseOut={() => setIsAddRoutineHovered(false)}
            />
          </div>
          {routines.length > 0 ? (
            routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={() => handleDeleteRoutine(routine.id)}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 mt-4">
              You have no routines added.
            </div>
          )}
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
        onUniversityAdded={handleUniversityAdded}
      />

      {/* Add Routine Modal */}
      <AddRoutineModal
        isOpen={isAddingRoutineModalOpen}
        onClose={() => setIsAddingRoutineModalOpen(false)}
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
