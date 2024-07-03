import React, { useState, useEffect } from "react";
import {
  EXTENDED_CALENDAR_FILTER_DISPLAY,
  CALENDAR_FILTER_TYPE,
  CALENDAR_FILTER_VALUE,
} from "../utility/constants";
import SearchIcon from "../assets/icons/Search.png";
import ExportIcon from "../assets/icons/Export.png";

const HorizontalNavigation = ({ title }) => {
  const [extendedDisplay, setExtendedDisplay] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const storedExtendedDisplay = localStorage.getItem(
      EXTENDED_CALENDAR_FILTER_DISPLAY
    );
    if (storedExtendedDisplay) {
      setExtendedDisplay(storedExtendedDisplay === "true");
    }

    const storedFilterType = localStorage.getItem(CALENDAR_FILTER_TYPE);
    if (storedFilterType) {
      setFilterType(storedFilterType);
    }

    const storedFilterValue = localStorage.getItem(CALENDAR_FILTER_VALUE);
    if (storedFilterValue) {
      setFilterValue(storedFilterValue);
    }

    setInitialLoad(false);
  }, []);

  const handleSearchClick = () => {
    setExtendedDisplay(true);
    localStorage.setItem(EXTENDED_CALENDAR_FILTER_DISPLAY, "true");
  };

  const handleCloseClick = () => {
    setExtendedDisplay(false);
    localStorage.setItem(EXTENDED_CALENDAR_FILTER_DISPLAY, "false");
  };

  const handleFilterTypeChange = (event) => {
    const { value } = event.target;
    setFilterType(value);
    localStorage.setItem(CALENDAR_FILTER_TYPE, value);
  };

  const handleFilterValueChange = (event) => {
    const { value } = event.target;
    setFilterValue(value);
    localStorage.setItem(CALENDAR_FILTER_VALUE, value);
  };

  return (
    <div className="flex items-center justify-between h-20 pl-10 pr-4 text-yellow-700 shadow-md">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center space-x-4">
        {extendedDisplay ? (
          <>
            <select
              value={filterType}
              onChange={handleFilterTypeChange}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none"
            >
              <option disabled value="">
                Select filter ...
              </option>
              <option value="date">Date</option>
              <option value="courseCode">Course Code</option>
            </select>
            {filterType === "date" ? (
              <input
                type="date"
                value={filterValue}
                onChange={handleFilterValueChange}
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none"
              />
            ) : filterType === "courseCode" ? (
              <input
                type="text"
                value={filterValue}
                onChange={handleFilterValueChange}
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-28"
                placeholder="Enter Course Code"
              />
            ) : null}
            <button
              onClick={handleCloseClick}
              className="text-2xl font-bold text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              &times;
            </button>
          </>
        ) : (
          <img
            src={SearchIcon}
            alt="Search"
            className="w-6 h-6 cursor-pointer"
            onClick={handleSearchClick}
          />
        )}
        <img
          src={ExportIcon}
          alt="Export ICS File"
          className="w-6 h-6 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default HorizontalNavigation;
