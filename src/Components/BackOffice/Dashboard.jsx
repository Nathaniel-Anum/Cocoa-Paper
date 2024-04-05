import Sidebar from "../../Components/BackOffice/Sidebar";
import Navbar from "../../Components/BackOffice/NavBar";

import { Outlet } from "react-router-dom";

const BackOfficeDashboard = () => {
  return (
    <div>
      <Navbar />
      <Sidebar />

      <Outlet />
    </div>
  );
};

export default BackOfficeDashboard;
