import React from "react";
import HorizontalNavigation from "./HorizontalNavigation";
import CustomCalendar from "./CustomCalendar";

const RightPane = ({ courses }) => {
  return (
    <div className="flex flex-col h-full">
      <HorizontalNavigation title="Dashboard" />
      <div className="flex-grow pl-8 bg-white">
        <CustomCalendar courses={courses} />
      </div>
    </div>
  );
};

export default RightPane;
