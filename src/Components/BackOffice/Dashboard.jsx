import Sidebar from "../../Components/BackOffice/Sidebar";
import Navbar from "../../Components/BackOffice/NavBar";

import { Outlet } from "react-router-dom";

const BackOfficeDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f8f4ef] flex">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="min-w-0 flex-1 overflow-x-hidden px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BackOfficeDashboard;
