import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../CustomHook/useUser";
import { useEffect } from "react";

function ProtectedRoutes({ isAllowed, children }) {
  const { user, isLoading } = useUser();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      sessionStorage.setItem("lastVisitedPath", location.pathname);
    }
  }, [isLoading, user, location]);

  if (!isLoading) {
    if (user) {
      if (!isAllowed) {
        console.log("I have been called");
           return <Navigate to="/dashboard" />;
      } else {
        return children ? children : <Outlet />;
      }
    } else {
      return <Navigate to="/login" state={{ from: location.pathname }} />;
    }
  } else {
    return "Loading...";
  }
}
// function ProtectedRoutes() {
//   const token = localStorage.getItem("accessToken");

//   return token ? <Outlet /> : <Navigate to="/login" />;
// }

export default ProtectedRoutes;
