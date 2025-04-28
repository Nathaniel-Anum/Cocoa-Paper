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
      <div className="pt-[10rem] h-screen w-full pl-[200px] pr-[72px] ">
        {pathname !== '/' && (
          <span
            className="flex items-center gap-2  pl-[20px] w-[100px] cursor-pointer font-semibold text-[#694422]"
            onClick={() => navigate(-1)}
          >
            <LuArrowLeft />
            <span className=" ">Back</span>
          </span>
        )}

        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
