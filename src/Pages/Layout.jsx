import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className="pt-[10rem] h-screen w-full pl-[200px] pr-[72px] ">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
