import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser, useUserContext } from "../CustomHook/useUser";
import { useEffect } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

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
        to={sessionStorage.getItem("lastVisitedPath") || "/dashboard"}
        replace
      />
    ) : (
      <Outlet />
    )
  ) : (
    <div className=" flex justify-center items-center">
      <Spin
        indicator={<LoadingOutlined style={{ fontSize: 54 }} spin />}
        className="text-[#582F08] "
      />
    </div>
  );
}

export default PublicRoutes;
