import React from "react";
import HorizontalNavigation from "./HorizontalNavigation";
import CustomCalendar from "./CustomCalendar";

const RightPane = ({ courses }) => {
  return (
    <div className="flex flex-col h-full">
      <HorizontalNavigation title="Dashboard" />
      <div className="flex-grow pl-8 bg-white">
        {courses && courses.length > 0 ? (
          <CustomCalendar courses={courses} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <h1 className="text-2xl text-gray-400">No courses found</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPane;
