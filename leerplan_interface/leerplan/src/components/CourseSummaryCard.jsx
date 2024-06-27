import React from "react";

const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

const CourseSummaryCard = ({ code, title, color }) => {
  const maxTextLength = 50;
  const truncatedTitle = truncateText(`${code} - ${title}`, maxTextLength);

  return (
    <div
      className="relative flex items-center mt-4"
      style={{ backgroundColor: color.light }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[7px]"
        style={{ backgroundColor: color.deep }}
      ></div>
      <div className="content p-2 pl-4 flex-1">
        <span className="font-bold">{code}</span>
        <span className="ml-2 font-semibold">
          {truncatedTitle.slice(code.length + 3)}
        </span>
      </div>
    </div>
  );
};

export default CourseSummaryCard;
