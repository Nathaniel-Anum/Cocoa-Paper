import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { LuArrowLeft } from 'react-icons/lu';

const Layout = () => {
  const navigate = useNavigate();

  const { pathname } = useLocation();

  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className="  min-h-screen w-full pl-4 md:pl-[200px] pr-4 md:pr-[72px] pb-8">
        {/* {pathname !== '/' && (
          <span
            className="flex items-center gap-2  pl-[20px] w-[100px] cursor-pointer font-semibold text-[#694422]"
            onClick={() => navigate(-1)}
          >
            <LuArrowLeft />
            <span className=" ">Back</span>
          </span>
        )} */}

        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
