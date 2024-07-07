import React from "react";
import moment from "moment";
import HashTagIcon from "../assets/icons/HashTag.png";
import AssessmentIcon from "../assets/icons/Assessment.png";
import TopicIcon from "../assets/icons/Topic.png";
import ReadingIcon from "../assets/icons/Reading.png";

const WeeklySchedule = ({ weeklySchedule }) => {
  if (!weeklySchedule) {
    return (
      <p className="text-center text-gray-500">
        No weekly schedule information available.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-3">
        <img src={HashTagIcon} alt="Week" className="w-5 h-5 mr-2" />
        <div className="flex items-center">
          <span className="border border-gray-300 rounded px-2 py-1 mr-2">
            Week {weeklySchedule.week_number}
          </span>
          <span className="bg-yellow-100 font-semibold text-yellow-800 px-2 py-1 rounded">
            {weeklySchedule.type}
          </span>
        </div>
      </div>
      {weeklySchedule.weekly_assessments.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center mb-2">
            <img
              src={AssessmentIcon}
              alt="Assessments"
              className="w-5 h-5 mr-2"
            />
            <strong>Assessments</strong>
          </div>
          <div className="pl-8">
            {weeklySchedule.weekly_assessments.map((assessment, index) => (
              <div key={index} className="flex justify-between mb-1">
                <span className="mr-2">{assessment.name}</span>
                <span className="font-semibold">
                  Due:{" "}
                  <span className="text-red-600">
                    {assessment.due_date
                      ? moment(assessment.due_date).format("MMMM DD")
                      : "No specified date"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {weeklySchedule.weekly_topics.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center mb-2">
            <img src={TopicIcon} alt="Topics" className="w-5 h-5 mr-2" />
            <strong>Topics</strong>
          </div>
          <ul className="list-none pl-8">
            {weeklySchedule.weekly_topics.map((topic, index) => (
              <li key={index}>{topic.topic}</li>
            ))}
          </ul>
        </div>
      )}
      {weeklySchedule.weekly_readings &&
        weeklySchedule.weekly_readings.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <img src={ReadingIcon} alt="Readings" className="w-5 h-5 mr-2" />
              <strong>Readings</strong>
            </div>
            <ul className="list-none pl-8">
              {weeklySchedule.weekly_readings.map((reading, index) => (
                <li key={index}>{reading.chapter}</li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
};

export default WeeklySchedule;
