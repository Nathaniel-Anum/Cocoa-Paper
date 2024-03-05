import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Main from "./Main";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      {/* <Main/> */}

      <Outlet />
    </div>
  );
};

export default Layout;
