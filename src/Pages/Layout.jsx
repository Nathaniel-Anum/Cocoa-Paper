import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';

const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div>
      <Navbar />
      <Sidebar />
      <div className="min-h-screen w-full pl-4 md:pl-[230px] pr-4 md:pr-[72px] pb-8">
        {pathname !== '/' && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 mt-4 mb-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#582f08] bg-[#f9eeda] hover:bg-[#e3bc97] hover:text-[#582f08] transition-colors duration-150 cursor-pointer border-none outline-none"
          >
            <LuArrowLeft className="text-base" />
            <span>Back</span>
          </button>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
