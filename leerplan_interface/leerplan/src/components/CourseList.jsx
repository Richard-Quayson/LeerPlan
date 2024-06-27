import React, { useState, useEffect } from "react";
import CourseSummaryCard from "./CourseSummaryCard";
import AddCoursesModal from "./AddCoursesModal";
import {
  EXTENDED_COURSE_LIST_DISPLAY,
  COURSE_ROUTINE_COLOURS,
} from "../utility/constants";
import RightIcon from "../assets/icons/ChevronRight.png";
import DownIcon from "../assets/icons/ChevronDown.png";
import FolderIcon from "../assets/icons/Folder.png";
import PlusIcon from "../assets/icons/UnroundedPlus.png";

const CourseList = ({ courses }) => {
  const [extendedDisplay, setExtendedDisplay] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedDisplayState = localStorage.getItem(
      EXTENDED_COURSE_LIST_DISPLAY
    );
    if (storedDisplayState === null) {
      localStorage.setItem(EXTENDED_COURSE_LIST_DISPLAY, "false");
    } else {
      setExtendedDisplay(storedDisplayState === "true");
    }
  }, []);

  const toggleDisplay = () => {
    const newDisplayState = !extendedDisplay;
    setExtendedDisplay(newDisplayState);
    localStorage.setItem(
      EXTENDED_COURSE_LIST_DISPLAY,
      newDisplayState.toString()
    );
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="course-list pl-4 pt-4">
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
              alt="Folder Icon"
              className="w-6 h-6 ml-4"
              onClick={toggleDisplay}
            />
            <span className="text-gray-500 ml-2 text-lg">Courses</span>
          </div>
        </div>
        <div
          className="flex items-center text-blue-500 pr-4 cursor-pointer"
          onClick={openModal}
        >
          <img src={PlusIcon} alt="Add New Course" className="mr-2 w-4 h-4" />
          <span className="text-sm">Add New</span>
        </div>
      </div>

      {extendedDisplay && (
        <div className="course-cards mt-4 ml-6">
          {courses.length === 0 ? (
            <p className="text-gray-400 text-center">
              No courses have been added
            </p>
          ) : (
            courses.map((course, index) => (
              <CourseSummaryCard
                key={course.id}
                code={course.course.code}
                title={course.course.name}
                color={
                  Object.values(COURSE_ROUTINE_COLOURS)[
                    index % Object.keys(COURSE_ROUTINE_COLOURS).length
                  ]
                }
              />
            ))
          )}
        </div>
      )}

      <AddCoursesModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default CourseList;
