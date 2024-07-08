import React from "react";
import moment from "moment";

const UserMetaData = ({ metadata }) => {
  const formatTime = (time) => {
    return moment(time, "HH:mm:ss").format("hh:mm A");
  };

  return (
    <div>
      <h3 className="font-semibold mb-4">User Metadata</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="text-yellow-800 font-semibold flex-[6] text-left">
            Min Study Time:
          </span>
          <span className="font-semibold text-gray-500 flex-[6] text-left">
            {metadata?.min_study_time} hours
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-800 font-semibold flex-[6] text-left">
            Max Study Time:
          </span>
          <span className="font-semibold text-gray-500 flex-[6] text-left">
            {metadata?.max_study_time} hours
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-800 font-semibold flex-[6] text-left">
            Sleep Time:
          </span>
          <span className="font-semibold text-gray-500 flex-[6] text-left">
            {formatTime(metadata?.sleep_time)}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-800 font-semibold flex-[6] text-left">
            Wake Time:
          </span>
          <span className="font-semibold text-gray-500 flex-[6] text-left">
            {formatTime(metadata?.wake_time)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserMetaData;
