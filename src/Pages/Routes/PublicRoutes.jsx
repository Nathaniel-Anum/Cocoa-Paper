import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useUserContext } from '../CustomHook/useUser';
import { useEffect } from 'react';

function PublicRoutes() {
  const { user, isLoading } = useUser();

  // useEffect(() => {
  //   if (!isLoading && user) {
  //     const lastVisitedPath =
  //       sessionStorage.getItem('lastVisitedPath') || '/dashboard';
  //     sessionStorage.removeItem('lastVisitedPath'); // Clear it after using
  //     <Navigate to={lastVisitedPath} replace />;
  //   }
  // }, [isLoading, user]);

  return !isLoading ? (
    user ? (
      <Navigate
        to={sessionStorage.getItem('lastVisitedPath') || '/dashboard'}
        replace
      />
    ) : (
      <Outlet />
    )
  ) : (
    'Loading...'
  );
}

export default PublicRoutes;
