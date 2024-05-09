import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../CustomHook/useUser";

function PublicRoutes() {
  const { user, isLoading } = useUser();

  return !isLoading ? (
    user ? (
      <Navigate to="/dashboard" />
    ) : (
      <Outlet />
    )
  ) : (
    "Loading..."
  );
}

export default PublicRoutes;
