import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  CURRENT_USER_ID,
} from "../utility/constants";
import api from "../utility/api";
import { LOGIN_USER_URL, USER_DETAILS_URL } from "../utility/api_urls";
import { DASHBOARD_ROUTE, REGISTER_ACCOUNT_ROUTE } from "../utility/routes";
import LeerPlanLogo from "../assets/images/leerplanlogo.png";
import EmailInputIcon from "../assets/icons/EmailInput.png";
import PasswordInputIcon from "../assets/icons/PasswordInput.png";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (emailValid && passwordValid) {
      setIsLoading(true);

      try {
        const response = await api.post(LOGIN_USER_URL, {
          email: email,
          password: password,
        });

        const data = response.data;

        if (response.status === 200) {
          const { access, refresh, first_login } = data;

          // save JWT tokens to cookies with 1 week expiry
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 7);
          Cookies.set(ACCESS_TOKEN, access, { expires: 7 });
          Cookies.set(REFRESH_TOKEN, refresh, { expires: 7 });

          // fetch user details to get their role
          const userResponse = await api.get(USER_DETAILS_URL);
          const userData = userResponse.data;
          localStorage.setItem(CURRENT_USER_ID, userData.id);

          setMessage("Login successful");
          setMessageColor("text-green-500");

          if (first_login) {
            setTimeout(() => {
              setRedirectToChangePassword(true);
            }, 1000);
          } else {
            setTimeout(() => {
              setRedirectToDashboard(true);
            }, 1000);
          }
        } else {
          setMessage(data.detail || data.error || "Login failed");
          setMessageColor("text-red-500");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.error ||
          error.response?.data?.non_field_errors ||
          "Login failed";
        setMessage(errorMessage);
        setMessageColor("text-red-500");
      }

      setIsLoading(false);
    } else {
      setMessage("Please enter valid email and password.");
      setMessageColor("text-red-500");
    }

    // clear the message after 5 seconds
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  if (redirectToDashboard) {
    return <Navigate to={DASHBOARD_ROUTE} />;
  }

  return (
    <div className="bg-cover bg-center min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-800 bg-opacity-20 p-4">
        <div className="bg-white bg-opacity-75 p-8 rounded-lg shadow-lg w-full max-w-md">
          {/* APP LOGO */}
          <div className="text-center mb-2">
            <img
              src={LeerPlanLogo}
              alt="LeerPlan Logo"
              className="mx-auto w-20"
            />
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* FORM MESSAGES */}
            {message && (
              <div className={`text-center mb-4 font-semibold ${messageColor}`}>
                {message}
              </div>
            )}
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
                  number, and one special character
                </p>
              )}
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className={`px-4 py-1 bg-white border-2 border-yellow-800 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-yellow-800 hover:text-white focus:outline-none focus:ring-red-800 focus:ring-offset-2 ${
                  isLoading && "opacity-50 cursor-not-allowed"
                }`} // disable button and add opacity when isLoading is true
                disabled={isLoading} // disable button when isLoading is true
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
          {/* REGISTER SECTION */}
          <div className="text-center mt-4">
            <p>
              Don't have an account?{" "}
              <a
                href={REGISTER_ACCOUNT_ROUTE}
                className="text-yellow-800 font-semibold"
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
