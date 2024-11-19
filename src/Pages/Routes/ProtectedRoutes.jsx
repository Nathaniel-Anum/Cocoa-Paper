import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../CustomHook/useUser";
import { useEffect } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

function ProtectedRoutes({ isAllowed, children }) {
  const { user, isLoading } = useUser();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      sessionStorage.setItem("lastVisitedPath", location.pathname);
    }
  }, [isLoading, user, location]);

  if (isLoading)
    return (
      <div className=" flex justify-center items-center h-screen">
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 54 }} spin />}
          className="text-[#582F08] "
        />
      </div>
    );

  console.log(isLoading, user);

  if (user) {
    if (!isAllowed) {
      return <Navigate to="/" />;
    } else {
      return children ? children : <Outlet />;
    }
  } else {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
}

export default ProtectedRoutes;
