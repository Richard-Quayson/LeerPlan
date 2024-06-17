import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { NAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX } from "../utility/constants";
import api from "../utility/api";
import { REGISTER_USER_URL } from "../utility/api_urls";
import { LOGIN_ROUTE } from "../utility/routes";
import LeerPlanLogo from "../assets/images/leerplanlogo.png";
import NameInputIcon from "../assets/icons/NameInput.png";
import EmailInputIcon from "../assets/icons/EmailInput.png";
import PasswordInputIcon from "../assets/icons/PasswordInput.png";
import SuccessGif from "../assets/gifs/Success.gif";

const RegisterUserPage = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstnameValid, setFirstnameValid] = useState(false);
  const [lastnameValid, setLastnameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const handleFirstnameChange = (event) => {
    const value = event.target.value;
    setFirstname(value);
    setFirstnameValid(NAME_REGEX.test(value));
  };

  const handleLastnameChange = (event) => {
    const value = event.target.value;
    setLastname(value);
    setLastnameValid(NAME_REGEX.test(value));
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    setEmailValid(EMAIL_REGEX.test(value));
  };

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    setPasswordValid(PASSWORD_REGEX.test(value));
  };

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;
    setConfirmPassword(value);
    setConfirmPasswordValid(value === password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      firstnameValid &&
      lastnameValid &&
      emailValid &&
      passwordValid &&
      confirmPasswordValid
    ) {
      setIsLoading(true);

      try {
        const response = await api.post(REGISTER_USER_URL, {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password,
          confirm_password: confirmPassword,
        });

        if (response.status === 201) {
          setRegistrationSuccess(true);
          setMessage("Account created successfully");
          setMessageColor("text-green-500");

          setTimeout(() => {
            setRedirectToLogin(true);
          }, 5000);
        } else {
          setMessage(
            response.data.detail || response.data.error || "Registration failed"
          );
          setMessageColor("text-red-500");
        }
      } catch (error) {
        const errorMessage =
          "A " + error.response?.data?.email ||
          error.response?.data?.error ||
          error.response?.data?.non_field_errors ||
          "Registration failed";
        setMessage(errorMessage);
        setMessageColor("text-red-500");
      }

      setIsLoading(false);
    } else {
      setMessage("Please fill out all fields correctly.");
      setMessageColor("text-red-500");
    }

    // clear the message after 5 seconds
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  if (redirectToLogin) {
    return <Navigate to={LOGIN_ROUTE} />;
  }

  return (
    <div className="bg-cover bg-center min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-800 bg-opacity-20 p-4">
        <div className="bg-white bg-opacity-75 px-8 py-4 rounded-lg shadow-lg w-full max-w-md">
          {/* APP LOGO */}
          <div className="text-center">
            <img
              src={LeerPlanLogo}
              alt="LeerPlan Logo"
              className="mx-auto w-20"
            />
          </div>
          {registrationSuccess ? (
            <div className="text-center">
              <img src={SuccessGif} alt="Success" className="mx-auto w-32" />
              <p className="text-green-500 font-semibold">
                Account created successfully! Redirecting to login...
              </p>
            </div>
          ) : (
            <form className="space-y-2" onSubmit={handleSubmit}>
              {/* FORM MESSAGES */}
              {message && (
                <div className={`text-center ${messageColor}`}>{message}</div>
              )}
              {/* FIRSTNAME INPUT */}
              <div className="relative">
                <label
                  htmlFor="firstname"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    id="firstname"
                    name="firstname"
                    value={firstname}
                    onChange={handleFirstnameChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                      firstname
                        ? firstnameValid
                          ? "border-green-500"
                          : "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img
                      src={NameInputIcon}
                      alt="Name Icon"
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>
              {/* LASTNAME INPUT */}
              <div className="relative">
                <label
                  htmlFor="lastname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    id="lastname"
                    name="lastname"
                    value={lastname}
                    onChange={handleLastnameChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                      lastname
                        ? lastnameValid
                          ? "border-green-500"
                          : "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img
                      src={NameInputIcon}
                      alt="Name Icon"
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>
              {/* EMAIL INPUT */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                      email
                        ? emailValid
                          ? "border-green-500"
                          : "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img
                      src={EmailInputIcon}
                      alt="Email Icon"
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>
              {/* PASSWORD INPUT */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                      password
                        ? passwordValid
                          ? "border-green-500"
                          : "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img
                      src={PasswordInputIcon}
                      alt="Password Icon"
                      className="h-5 w-5"
                    />
                  </div>
                </div>
                {!passwordValid && password && (
                  <p className="text-red-500 text-xs mt-2">
                    Invalid password. It must be at least 8 characters long and
                    include one uppercase letter, one lowercase letter, one
                    number, and one special character.
                  </p>
                )}
              </div>
              {/* CONFIRM PASSWORD INPUT */}
              <div className="relative">
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                      confirmPassword
                        ? confirmPasswordValid
                          ? "border-green-500"
                          : "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img
                      src={PasswordInputIcon}
                      alt="Password Icon"
                      className="h-5 w-5"
                    />
                  </div>
                </div>
                {!confirmPasswordValid && confirmPassword && (
                  <p className="text-red-500 text-xs mt-2">
                    Passwords do not match.
                  </p>
                )}
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className={`px-4 py-1 mt-2 bg-white border-[1px] border-yellow-800 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-yellow-800 hover:text-white focus:outline-none focus:ring-red-800 focus:ring-offset-2 ${
                    isLoading && "opacity-50 cursor-not-allowed"
                  }`} // disable button and add opacity when isLoading is true
                  disabled={isLoading} // disable button when isLoading is true
                >
                  {isLoading ? "Registering..." : "Register"}
                </button>
              </div>

              {/* LOGIN SECTION */}
              <div className="text-center mt-4">
                <p>
                  Already have an account?{" "}
                  <a
                    href={LOGIN_ROUTE}
                    className="text-yellow-800 font-semibold"
                  >
                    Login here
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterUserPage;
