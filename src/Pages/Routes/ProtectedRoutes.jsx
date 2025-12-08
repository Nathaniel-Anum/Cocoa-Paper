import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../CustomHook/useUser';
import { useEffect } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Loader from '../../Components/Loader/Loader';

function ProtectedRoutes({ isAllowed, children }) {
  const { user, isLoading } = useUser();

  const location = useLocation();
  const navigate = useNavigate();

  // Debug logging
  console.log('ProtectedRoutes:', { 
    path: location.pathname, 
    isAllowed, 
    hasUser: !!user, 
    isLoading 
  });

  useEffect(() => {
    if (!isLoading && !user) {
      sessionStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [isLoading, user, location]);

  if (isLoading) return <Loader />;

  if (user) {
    if (!isAllowed) {
      console.log('ProtectedRoutes: Access denied, redirecting to /');
      return <Navigate to="/" />;
    } else {
      return children ? children : <Outlet />;
    }
  } else {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
}

export default ProtectedRoutes;
