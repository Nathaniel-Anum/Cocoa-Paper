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

function App() {
  // API call for the users.
  const { setUser, setIsLoading, user, isLoading } = useUser();

  // axiosInstance.get("/archive").then((res) => console.log(res?.data?.archives));

  console.log(user, isLoading);

  useEffect(() => {
    console.log("running");

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

  return (
    <div>
      <Router>
        <Routes>
          {/* <Route element={<ProtectedRoutes />}> */}
            <Route path="/" element={<Layout />}>
              <Route path="/dashboard" element={<HomeDashboard />} />
              <Route path="/dashboard/add-document" element={<AddDocument />} />
              <Route path="/dashboard/incoming" element={<Incoming />} />
              <Route path="/dashboard/outgoing" element={<Outgoing />} />
              <Route
                path="/dashboard/physicaldocs"
                element={<PhysicalDocs />}
              />
              <Route path="/dashboard/locator" element={<Locator />} />
              <Route path="/dashboard/archive" element={<Archive />} />
              <Route path="/dashboard/archive/:id" element={<Archive />} />
            </Route>
            <Route path="/backoffice" element={<Dashboard />}>
              <Route path="/backoffice/bod" element={<Staff />} />
              <Route path="/backoffice/department" element={<Department />} />
              <Route path="/backoffice/division" element={<Division />} />
              <Route path="/backoffice/roles" element={<Role />} />
              <Route
                path="/backoffice/rolemanagement"
                element={<RoleManagement />}
              />
            {/* </Route> */}
          </Route>

          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
