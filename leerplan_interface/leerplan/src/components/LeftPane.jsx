import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import UserProfileCard from "./UserProfileCard";
import CourseList from "./CourseList";
import RoutineList from "./RoutineList";
import AddUserMetaData from "./AddUserMetaData";
import YesNoPrompt from "./YesNoPrompt";
import LiveStream from "./LiveStream";
import { LOGOUT_ROUTE } from "../utility/routes";
import { CURRENT_USER_ID, DISPLAY_TIME_BLOCKS } from "../utility/constants";
import LeerPlanLogo from "../assets/images/leerplanlogo.png";
import AutomateIcon from "../assets/icons/Automate.png";
import FilledLogoutIcon from "../assets/icons/FilledLogout.png";
import UnfilledLogoutIcon from "../assets/icons/UnfilledLogout.png";

const LeftPane = ({ user, userCourses, onTimeBlocksToggle }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showAddMetadataForm, setShowAddMetadataForm] = useState(false);
  const [showYesNoPrompt, setShowYesNoPrompt] = useState(false);
  const [displayTimeBlocks, setDisplayTimeBlocks] = useState(
    localStorage.getItem(DISPLAY_TIME_BLOCKS) === "true"
  );

  const handleGenerateSchedule = () => {
    if (!user.metadata) {
      setShowAddMetadataForm(true);
    } else {
      setShowYesNoPrompt(true);
    }
  };

  const handleYesResponse = () => {
    setShowYesNoPrompt(false);
    const newDisplayTimeBlocks = !displayTimeBlocks;
    setDisplayTimeBlocks(newDisplayTimeBlocks);
    localStorage.setItem(DISPLAY_TIME_BLOCKS, newDisplayTimeBlocks.toString());
    onTimeBlocksToggle(newDisplayTimeBlocks);
  };

  const handleNoResponse = () => {
    setShowYesNoPrompt(false);
  };

  return (
    <div className="left-pane h-full flex flex-col">
      <div className="flex-shrink-0 w-full">
        {/* LOGO */}
        <img
          src={LeerPlanLogo}
          alt="LeerPlan Logo"
          className="w-16 h-16 mx-2 my-1"
        />

        {/* LINE SEPARATORS */}
        <hr className="border-gray-400 w-full mb-1" />
        <hr className="border-gray-400 w-full" />

        {/* USER PROFILE CARD */}
        <div className="w-full">
          <UserProfileCard user={user} />
        </div>

        <hr className="border-gray-300 w-full" />
      </div>

      <div className="flex-grow overflow-y-auto w-full">
        {/* COURSE DIRECTORY */}
        <div>
          <CourseList courses={userCourses} />
        </div>

        {/* LINE SEPARATOR */}
        <hr className="border-gray-300 w-full mt-4" />

        {/* ROUTINE DIRECTORY */}
        <div>
          <RoutineList routines={user.routines} />
        </div>

        {/* LINE SEPARATOR */}
        <hr className="border-gray-300 w-full mt-4" />

        {/* GENERATE ACADEMIC CALENDAR */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleGenerateSchedule}
            className="w-[200px] py-2 border border-yellow-700 text-yellow-700 rounded-lg"
          >
            <img
              src={AutomateIcon}
              alt="Automate Icon"
              className="w-6 h-6 inline-block mr-2"
            />
            {displayTimeBlocks ? "Remove Timeblocks" : "Generate Timeblocks"}
          </button>
        </div>

        {/* LINE SEPARATOR */}
        <hr className="border-gray-300 w-full mt-4" />

        {/* MISCELLANEOUS ITEMS: STUDY STREAMS, TIPS, ETC. */}
        <div className="w-full">
          <LiveStream />
        </div>

        {/* LINE SEPARATOR */}
        <hr className="border-gray-300 w-full mt-4" />
      </div>

      {/* LOGOUT */}
      <div
        className="logout-container"
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
      >
        <button
          onClick={() => {
            localStorage.removeItem(CURRENT_USER_ID);
            navigate(LOGOUT_ROUTE);
          }}
        >
          <img
            src={isHovered ? FilledLogoutIcon : UnfilledLogoutIcon}
            alt="Logout Icon"
            className="w-12 h-12 inline-block"
            data-tooltip-id="logout"
            data-tooltip-content="Logout"
          />
        </button>
      </div>

      <Tooltip id="logout" place="right" />

      {/* YES/NO PROMPT */}
      {showYesNoPrompt && (
        <YesNoPrompt
          question={
            !displayTimeBlocks
              ? "Generating an academic calendar requires all course syllabus for the semester. Have you uploaded the necessary courses and created your routines?"
              : "Oops... 😒 Why are you trying to remove the timeblocks? Don't like the feature? 😢 Hope you come around later in the future!"
          }
          onYes={handleYesResponse}
          onNo={handleNoResponse}
        />
      )}

      {/* ADD METADATA FORM */}
      {showAddMetadataForm && (
        <AddUserMetaData
          isOpen={showAddMetadataForm}
          onClose={() => setShowAddMetadataForm(false)}
          metadata={{}}
          editMode={false}
        />
      )}
    </div>
  );
};

export default LeftPane;
