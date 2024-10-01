import "./App.css";
import Home from "./Pages/Home";
import Layout from "./Pages/Layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeDashboard from "./Pages/HomeDashboard";
import PublicRoutes from ".././src/Pages/Routes/PublicRoutes";
import ProtectedRoutes from ".././src/Pages/Routes/ProtectedRoutes";
import axiosInstance from "./Components/axiosInstance";
import Dashboard from "./../src/Components/BackOffice/Dashboard";
import Staff from "./Components/BackOffice/Staff";
import Department from "./Components/BackOffice/Department";
import Division from "./Components/BackOffice/Division";
import Role from "./Components/BackOffice/Role";
import RoleManagement from "./Components/BackOffice/RoleManagement";
import AddDocument from "./Pages/AddDocument";
import Incoming from "./Pages/Incoming";
import Outgoing from "./Pages/Outgoing";
import { useEffect } from "react";
import { useUser } from "./Pages/CustomHook/useUser";
import { useTrail } from "./Pages/CustomHook/useTrail";
import Locator from "./Pages/Locator";
import PhysicalDocs from "./Pages/PhysicalDocs";
import Archive from "./Pages/Archive";
import { SignIn } from "./Pages/SignIn";
import ConfirmEmail from "./Pages/ConfirmEmail";
import ResetPassword from "./Pages/ResetPassword";
import { hasPermission, requiredPermissions } from "../utils/Roles";

function App() {
  // API call for the users.
  const { setUser, setIsLoading, user, isLoading } = useUser();

  // axiosInstance.get("/archive").then((res) => console.log(res?.data?.archives));

  // console.log(user, isLoading);
  // console.log(user);

  console.log(user?.role[0].rolePermissions);

  useEffect(() => {
    const fetchUser = () => {
      setIsLoading(true);

      axiosInstance
        .get("/user")
        .then((res) => {
          setUser(res?.data?.user);
        })
        .finally(() => setIsLoading(false));
    };
    fetchUser();
  }, []);

  console.log(
    hasPermission(user?.role[0].rolePermissions, [
      requiredPermissions.CREATE_ARCHIVE,
      requiredPermissions.DELETE_ARCHIVE,
      requiredPermissions.CREATE_DOCUMENT,
      requiredPermissions.DELETE_DOCUMENT,
    ])
  );

  return (
    <div>
      <Router>
        <Routes>
          {/* <Route element={<ProtectedRoutes />}> */}
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<HomeDashboard />} />
            <Route
              path="/dashboard/add-document"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.UPDATE_DOCUMENT,
                    requiredPermissions.DELETE_DOCUMENT,
                    requiredPermissions.READ_DOCUMENT,
                    requiredPermissions.CREATE_DOCUMENT,
                  ])}
                >
                  <AddDocument />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/dashboard/incoming"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.CREATE_TRAIL,
                    requiredPermissions.DELETE_TRAIL,
                    requiredPermissions.READ_TRAIL,
                    requiredPermissions.UPDATE_TRAIL,
                  ])}
                >
                  <Incoming />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/dashboard/outgoing"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.CREATE_TRAIL,
                    requiredPermissions.DELETE_TRAIL,
                    requiredPermissions.READ_TRAIL,
                    requiredPermissions.UPDATE_TRAIL,
                  ])}
                >
                  <Outgoing />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/dashboard/physicaldocs"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.CREATE_TRAIL,
                    requiredPermissions.DELETE_TRAIL,
                    requiredPermissions.READ_TRAIL,
                    requiredPermissions.UPDATE_TRAIL,
                  ])}
                >
                  <PhysicalDocs />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/dashboard/locator"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.CREATE_TRAIL,
                    requiredPermissions.DELETE_TRAIL,
                    requiredPermissions.READ_TRAIL,
                    requiredPermissions.UPDATE_TRAIL,
                  ])}
                >
                  <Locator />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/archive"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.CREATE_ARCHIVE,
                    requiredPermissions.READ_ARCHIVE,
                    requiredPermissions.DELETE_ARCHIVE,
                    requiredPermissions.UPDATE_ARCHIVE,
                  ])}
                >
                  <Archive />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/archive/:id"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.CREATE_ARCHIVE,
                    requiredPermissions.READ_ARCHIVE,
                    requiredPermissions.DELETE_ARCHIVE,
                    requiredPermissions.UPDATE_ARCHIVE,
                  ])}
                >
                  <Archive />
                </ProtectedRoutes>
              }
            />
          </Route>
          <Route
            path="/backoffice"
            element={
              // <ProtectedRoutes
              //   isAllowed={hasPermission(user?.role[0].rolePermissions, [
              //     requiredPermissions.READ_USER,
              //     requiredPermissions.UPDATE_USER,
              //     requiredPermissions.CREATE_USER,
              //     requiredPermissions.DELETE_USER,
              //     requiredPermissions.CREATE_ROLES,
              //     requiredPermissions.READ_ROLES,
              //     requiredPermissions.DELETE_ROLES,
              //     requiredPermissions.UPDATE_ROLES,
              //     requiredPermissions.CREATE_DEPT,
              //     requiredPermissions.DELETE_DEPT,
              //     requiredPermissions.READ_DEPT,
              //     requiredPermissions.UPDATE_DEPT,
              //     requiredPermissions.CREATE_STAFF,
              //     requiredPermissions.READ_STAFF,
              //     requiredPermissions.DELETE_STAFF,
              //     requiredPermissions.UPDATE_STAFF,
              //   ])}
              // >
              <Dashboard />
              // </ProtectedRoutes>
            }
          >
            <Route
              path="/backoffice/bod"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.CREATE_STAFF,
                    requiredPermissions.READ_STAFF,
                    requiredPermissions.DELETE_STAFF,
                    requiredPermissions.UPDATE_STAFF,
                  ])}
                >
                  <Staff />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/backoffice/department"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.CREATE_DEPT,
                    requiredPermissions.READ_DEPT,
                    requiredPermissions.DELETE_DEPT,
                    requiredPermissions.UPDATE_DEPT,
                  ])}
                >
                  <Department />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/division"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.READ_DIVISION,
                  ])}
                >
                  <Division />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/roles"
              element={
                <ProtectedRoutes
                  isAllowed={hasPermission(user?.role[0].rolePermissions, [
                    requiredPermissions.READ_ROLES,
                    requiredPermissions.CREATE_ROLES,
                    requiredPermissions.DELETE_ROLES,
                    requiredPermissions.UPDATE_ROLES,
                  ])}
                >
                  <Role />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/backoffice/rolemanagement"
              element={<RoleManagement />}
            />
          </Route>
          {/* </Route> */}

          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Home />} />
            <Route path="/backoffice/login" element={<SignIn />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
