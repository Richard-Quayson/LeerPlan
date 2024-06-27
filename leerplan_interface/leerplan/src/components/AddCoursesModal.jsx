import React, { useState, useEffect } from "react";
import ModalContainer from "./ModalContainer";
import { CREATE_COURSES_URL } from "../utility/api_urls";
import api from "../utility/api";
import { PREFERRED_UNIVERSITY_ID } from "../utility/constants";
import SuccessGif from "../assets/gifs/Success.gif";
import FileIcon from "../assets/icons/File.png";
import UploadIcon from "../assets/icons/Upload.png";

const AddCoursesModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    setFiles([]);
    setMessage("");
    setUploadSuccess(false);
  }, [isOpen]);

  useEffect(() => {
    let timeoutId;
    if (uploadSuccess) {
      timeoutId = setTimeout(() => {
        onClose();
        window.location.reload();
      }, 5000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [uploadSuccess, onClose]);

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
    setMessage("");
  };

  const handleRemoveFile = (indexToRemove) => {
    const updatedFiles = files.filter((file, index) => index !== indexToRemove);
    setFiles(updatedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (files.length === 0) {
      setMessage("Please select at least one course syllabus.");
      setTimeout(() => {
        setMessage("");
      }, 5000);
      return;
    }

    // Check file types
    const allowedTypes = [".pdf", ".json"];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();
      if (!allowedTypes.includes(fileType)) {
        setMessage("Please upload files with .pdf or .json extensions.");
        setTimeout(() => {
          setMessage("");
        }, 5000);
        return;
      }
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`course_files[${index}]`, file);
      });
      formData.append(
        "university",
        localStorage.getItem(PREFERRED_UNIVERSITY_ID)
      );

      const response = await api.post(CREATE_COURSES_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setUploadSuccess(true);
      } else {
        setMessage(response.data.detail || "Failed to upload courses.");
        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to upload courses.");
      setTimeout(() => {
        setMessage("");
      }, 5000);
    }

    setIsLoading(false);
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <h2 className="text-2xl mb-4 font-bold text-yellow-800">
          Upload Course Syllabus
        </h2>
        {uploadSuccess ? (
          <div className="mt-4">
            <img src={SuccessGif} alt="Success" className="w-32 h-32 mx-auto" />
            <p className="text-green-500 mt-2">
              Courses uploaded successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {message && <div className="mb-4 text-red-500">{message}</div>}
            <p className="text-gray-500 mb-2">
              Upload all your course syllabus for the semester here to create a
              custom academic calendar.
            </p>
            <div className="ml-8 my-4 flex flex-col">
              {files.map((file, index) => (
                <div key={index} className="flex mb-2">
                  <div className="flex items-center">
                    <img src={FileIcon} alt="File" className="w-8 h-8 mr-2" />
                    <span>{file.name}</span>
                    <span
                      className="ml-2 text-red-500 cursor-pointer text-2xl"
                      onClick={() => handleRemoveFile(index)}
                    >
                      &times;
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-2">
              <div className="flex justify-between">
                <label
                  htmlFor="file-upload"
                  className="ml-4 cursor-pointer bg-white px-4 rounded-3xl border border-yellow-800 mr-2"
                >
                  <div className="flex items-center py-1">
                    <img
                      src={UploadIcon}
                      alt="Upload"
                      className="w-6 h-6 inline-block mr-2"
                    />
                    Choose Files
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.json"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  className={`px-4 border border-yellow-800 bg-white font-semibold text-yellow-800 rounded-lg shadow hover:bg-yellow-800 hover:text-white ${
                    isLoading && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </ModalContainer>
  );
};

export default AddCoursesModal;
