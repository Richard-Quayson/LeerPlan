import React from "react";
import StudyStreamLogo from "../assets/images/StudyStreamLogo.png";
import LiveStreamGif from "../assets/gifs/LiveStream.gif";

const MiscellaneousItems = () => {
  return (
    <div className="flex flex-col justify-center pt-4 pl-4">
      <div className="flex items-center">
        <img
          src={LiveStreamGif}
          alt="Live Stream Gif"
          className="w-6 h-6 mr-2"
        />
        <span className="text-gray-500 ml-2 text-lg">Online Study Rooms</span>
      </div>
      <a
        href="https://www.studystream.live/focus-room"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center ml-8"
      >
        <img
          src={StudyStreamLogo}
          alt="Study Stream Logo"
          className="w-8 h-8"
        />
        Study Stream
      </a>
    </div>
  );
};

export default MiscellaneousItems;
