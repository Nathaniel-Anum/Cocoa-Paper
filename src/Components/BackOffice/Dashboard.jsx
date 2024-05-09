import Sidebar from "../../Components/BackOffice/Sidebar";
import Navbar from "../../Components/BackOffice/NavBar";

import { Outlet } from "react-router-dom";

const BackOfficeDashboard = () => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className=" px-[240px] pt-[20px]  ">
        <h2 className="font-bold text-[30px] text-center text-[#582f08] ">
          Cocoa Papers Admin Panel
        </h2>
      </div>
      <Outlet />
    </div>
  );
};

export default BackOfficeDashboard;
