import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser, useUserContext } from "../CustomHook/useUser";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

function PublicRoutes() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className=" flex justify-center items-center h-screen">
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 54 }} spin />}
          className="text-[#582F08] "
        />
      </div>
    );
  }

  return user ? (
    <Navigate to={sessionStorage.getItem("lastVisitedPath") || "/"} replace />
  ) : (
    <Outlet />
  );
}

export default PublicRoutes;
