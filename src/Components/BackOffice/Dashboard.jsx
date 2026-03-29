import Sidebar from "../../Components/BackOffice/Sidebar";
import Navbar from "../../Components/BackOffice/NavBar";

import { Outlet } from "react-router-dom";

const BackOfficeDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f8f4ef]">
      <Navbar />
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default BackOfficeDashboard;
