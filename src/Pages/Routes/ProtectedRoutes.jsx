import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../CustomHook/useUser';
import { useEffect } from 'react';

function ProtectedRoutes() {
  const { user, isLoading } = useUser();

  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      sessionStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [isLoading, user, location]);

  return !isLoading ? (
    user ? (
      <Outlet />
    ) : (
      <Navigate to="/login" state={{ from: location.pathname }} />
    )
  ) : (
    'Loading...'
  );
}
// function ProtectedRoutes() {
//   const token = localStorage.getItem("accessToken");

//   return token ? <Outlet /> : <Navigate to="/login" />;
// }

export default ProtectedRoutes;
