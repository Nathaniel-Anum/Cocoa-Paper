import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../CustomHook/useUser";

function ProtectedRoutes() {
  const { user, isLoading } = useUser();
  console.log(isLoading, user);

  return !isLoading ? (
    user ? (
      <Outlet />
    ) : (
      <Navigate to="/login" />
    )
  ) : (
    "Loading..."
  );
}
// function ProtectedRoutes() {
//   const token = localStorage.getItem("accessToken");

//   return token ? <Outlet /> : <Navigate to="/login" />;
// }

export default ProtectedRoutes;
