import React, { useState, useEffect } from "react";
import RoutineCard from "./RoutineCard";
import AddRoutineModal from "./AddRoutineModal";
import {
  EXTENDED_ROUTINE_LIST_DISPLAY,
  COURSE_ROUTINE_COLOURS,
} from "../utility/constants";
import RightIcon from "../assets/icons/ChevronRight.png";
import DownIcon from "../assets/icons/ChevronDown.png";
import FolderIcon from "../assets/icons/Folder.png";
import PlusIcon from "../assets/icons/UnroundedPlus.png";

const RoutineList = ({ routines }) => {
  const [extendedDisplay, setExtendedDisplay] = useState(false);
  const [isAddRoutineModalOpen, setIsAddRoutineModalOpen] = useState(false);

  useEffect(() => {
    const storedDisplayState = localStorage.getItem(
      EXTENDED_ROUTINE_LIST_DISPLAY
    );
    if (storedDisplayState === null) {
      localStorage.setItem(EXTENDED_ROUTINE_LIST_DISPLAY, "false");
    } else {
      setExtendedDisplay(storedDisplayState === "true");
    }
  }, []);

  const toggleDisplay = () => {
    const newDisplayState = !extendedDisplay;
    setExtendedDisplay(newDisplayState);
    localStorage.setItem(
      EXTENDED_ROUTINE_LIST_DISPLAY,
      newDisplayState.toString()
    );
  };

  const openAddRoutineModal = () => {
    setIsAddRoutineModalOpen(true);
  };

  const closeAddRoutineModal = () => {
    setIsAddRoutineModalOpen(false);
  };

  return (
    <div className="routine-list pl-4 pt-4">
      <div className="header flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={extendedDisplay ? DownIcon : RightIcon}
            alt="Toggle Display"
            className="cursor-pointer w-4 h-4"
            onClick={toggleDisplay}
          />
          <div className="flex justify-center">
            <img
              src={FolderIcon}
              alt="Toggle Display"
              className="cursor-pointer w-6 h-6 ml-4"
              onClick={toggleDisplay}
            />
            <span className="text-gray-500 ml-2 text-lg">Routine</span>
          </div>
        </div>
        <div
          className="flex items-center text-blue-500 pr-4 cursor-pointer"
          onClick={openAddRoutineModal}
        >
          <img src={PlusIcon} alt="Add New Routine" className="mr-2 w-4 h-4" />
          <span className="text-sm">Add New</span>
        </div>
      </div>

      {extendedDisplay && (
        <div className="routine-cards mt-4 ml-6">
          {routines.length === 0 ? (
            <p className="text-gray-400">No routines have been added</p>
          ) : (
            routines.map((routine, index) => {
              const colorIndex =
                Object.keys(COURSE_ROUTINE_COLOURS).length -
                1 -
                (index % Object.keys(COURSE_ROUTINE_COLOURS).length);
              const color = Object.values(COURSE_ROUTINE_COLOURS)[colorIndex];
              return (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  summary={true}
                  color={color}
                  onDelete={() => handleRoutineDelete(routine.id)}
                />
              );
            })
          )}
        </div>
      )}

      <AddRoutineModal
        isOpen={isAddRoutineModalOpen}
        onClose={closeAddRoutineModal}
      />
    </div>
  );
};

export default RoutineList;
