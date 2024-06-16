import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utility/auth";
import { LOGIN_ROUTE } from "../utility/routes";

function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await isAuthenticated();
      setIsAuthorized(authenticated);
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to={LOGIN_ROUTE} />;
}

export default ProtectedRoute;
