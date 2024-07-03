import React, { useState } from "react";
import HorizontalNavigation from "./HorizontalNavigation";
import CustomCalendar from "./CustomCalendar";

const RightPane = ({ courses }) => {
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [applyFilter, setApplyFilter] = useState(false);

  const handleFilterSubmit = (type, value) => {
    setFilterType(type);
    setFilterValue(value);
    setApplyFilter(true);
  };

  return (
    <div className="flex flex-col h-full">
      <HorizontalNavigation
        title="Dashboard"
        handleSubmit={handleFilterSubmit}
      />
      <div className="flex-grow pl-8 bg-white">
        {courses && courses.length > 0 ? (
          <CustomCalendar
            courses={courses}
            filterType={filterType}
            filterValue={filterValue}
            applyFilter={applyFilter}
            resetFilter={() => setApplyFilter(false)}
          />
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
