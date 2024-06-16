import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from './utility/api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './utility/constants';
import { LOGOUT_USER_URL } from './utility/api_urls';
import { 
  HOME_ROUTE, UNDEFINED_ROUTE, REGISTER_ACCOUNT_ROUTE, LOGIN_ROUTE, LOGOUT_ROUTE, 
  DASHBOARD_ROUTE,
} from './utility/routes';

import ProtectedRoute from './components/ProtectedRoute';

import RegisterUserPage from './pages/RegisterUserPage';
import LoginUserPage from './pages/LoginUserPage';
import DashboardPage from './pages/DashboardPage';

import NotFoundPage from './pages/NotFoundPage';

function Logout() {
  api.post(LOGOUT_USER_URL, {
    refresh: Cookies.get(REFRESH_TOKEN),
  });

  Cookies.remove(ACCESS_TOKEN);
  Cookies.remove(REFRESH_TOKEN);
  localStorage.clear();

  return <Navigate to={LOGIN_ROUTE} />;
}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* PAGE ROUTES: */}
        <Route
          path={REGISTER_ACCOUNT_ROUTE}
          element={<RegisterUserPage />}
        />

        <Route path={LOGIN_ROUTE} element={<LoginUserPage />} />

        <Route path={LOGOUT_ROUTE} element={<Logout />} />

        <Route
          path={DASHBOARD_ROUTE}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path={HOME_ROUTE} element={<Navigate to={DASHBOARD_ROUTE} />} />

        <Route path={UNDEFINED_ROUTE} element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
