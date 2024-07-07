import React, { useState, useEffect } from "react";
import HorizontalNavigation from "./HorizontalNavigation";
import CustomCalendar from "./CustomCalendar";
import { SET_COURSE_COHORT_URL } from "../utility/api_urls";
import api from "../utility/api";
import SuccessGif from "../assets/gifs/Success.gif";

const RightPane = ({ courses }) => {
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [applyFilter, setApplyFilter] = useState(false);
  const [courseWithoutCohort, setCourseWithoutCohort] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState("");
  const [specifyCohort, setSpecifyCohort] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (courses && courses.length > 0) {
      const courseNeedingCohort = courses.find((course) => !course.cohort);
      setCourseWithoutCohort(courseNeedingCohort);
      setSpecifyCohort(courseNeedingCohort !== undefined);
    } else {
      setCourseWithoutCohort(null);
      setSpecifyCohort(null);
    }
  }, [courses]);

  const handleFilterSubmit = (type, value) => {
    setFilterType(type);
    setFilterValue(value);
    setApplyFilter(true);
  };

  const handleCohortSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.patch(SET_COURSE_COHORT_URL, {
        user_course: courseWithoutCohort.id,
        course_cohort: parseInt(selectedCohort, 10),
      });
      if (response.status === 200) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSpecifyCohort(false);
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      setErrorMessage("Failed to set cohort. Please try again.");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
    setIsSubmitting(false);
  };

  const renderCohortForm = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-md bg-white rounded-lg p-6">
        <h2 className="text-2xl text-yellow-800 font-bold mb-4 text-center">
          Set Cohort for {courseWithoutCohort.course.code}{" "}
          {courseWithoutCohort.course.name}
        </h2>
        {errorMessage && (
          <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
        )}
        <p className="mb-4 text-center text-gray-400">
          You have not set your cohort for this course. Please select a cohort.
        </p>
        <form onSubmit={handleCohortSubmit} className="space-y-4">
          <div className="flex flex-col items-start">
            <label
              htmlFor="cohort"
              className="mb-2 font-medium text-yellow-800"
            >
              Select Cohort
            </label>
            <select
              id="cohort"
              className="w-full p-2 border border-yellow-800 rounded focus:outline-none focus:ring-yellow-800"
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              required
            >
              <option value="" disabled>
                Select Cohort
              </option>
              {courseWithoutCohort.course.cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-1/3 border border-yellow-800 p-2 rounded hover:bg-yellow-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-800 focus:ring-opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Set Cohort"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <HorizontalNavigation
          title="Dashboard"
          handleSubmit={handleFilterSubmit}
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        {courseWithoutCohort === null && specifyCohort === null ? (
          <div className="h-full flex items-center justify-center">
            <h1 className="text-xl text-gray-400">Loading courses...</h1>
          </div>
        ) : specifyCohort ? (
          submitSuccess ? (
            <div className="flex flex-col items-center justify-center h-full">
              <img src={SuccessGif} alt="Success" className="w-32 h-32" />
              <p className="mt-4 font-semibold text-green-500">
                Cohort set successfully!
              </p>
            </div>
          ) : (
            renderCohortForm()
          )
        ) : courses && courses.length > 0 ? (
          <CustomCalendar
            courses={courses}
            filterType={filterType}
            filterValue={filterValue}
            applyFilter={applyFilter}
            resetFilter={() => setApplyFilter(false)}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <h1 className="text-xl text-gray-400">No courses found</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPane;
