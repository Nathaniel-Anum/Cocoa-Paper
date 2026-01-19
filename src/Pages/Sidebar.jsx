import { Link } from 'react-router-dom';
import { useUser } from './CustomHook/useUser';
import './Home.css';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import { GiTakeMyMoney } from 'react-icons/gi';
import { HiMiniPresentationChartLine } from 'react-icons/hi2';
import { FaShieldAlt, FaChartPie, FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

const Sidebar = () => {
  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile hamburger button - Clean minimal design */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-[13px] left-3 z-50 w-9 h-9 flex items-center justify-center rounded-lg text-[#582F08] hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <FaTimes size={18} />
        ) : (
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1H19M1 7H19M1 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed z-40 h-screen bg-[#582f08] overflow-y-auto no-scrollbar transition-transform duration-300 ease-in-out
        w-[10rem] px-[15px] py-[19px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/asset/logo.9a18109e1c16584832d5.png" alt="Cocoa Papers" className="h-12 w-auto" />
        </div>
        <ul className="list-none px-[10px] md:px-[15px] py-[10px] flex flex-col gap-[20px] md:gap-[30px] cursor-pointer">
          {hasPermission(allRolePermissions, [
            requiredPermissions.READ_ANALYTICS,
          ]) && (
            <Link to="/analytics" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <HiMiniPresentationChartLine
                  className="w-[4rem] md:w-[6rem] text-[#E3BC97]"
                  size={40}
                />
                <p className="text-xs">Analytics</p>
              </li>
            </Link>
          )}
          {hasPermission(allRolePermissions, [
            requiredPermissions.READ_ANALYTICS,
          ]) && (
            <Link to="/advanced-analytics" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <FaChartPie
                  className="w-[4rem] md:w-[6rem] text-[#E3BC97]"
                  size={35}
                />
                <p className="text-xs text-center">Dashboard</p>
              </li>
            </Link>
          )}
          <Link to="/" onClick={closeSidebar}>
            <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
              <img
                className="w-[35px] md:w-[43px]"
                src="/asset/home-icon.a1cb008ba41682badfae94e2877d0206.svg"
                alt=""
              />
              <p className="text-xs">Home</p>
            </li>
          </Link>

          <Link to="/locator" onClick={closeSidebar}>
            <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-500 py-2 px-2 hover:scale-105 hover:rounded-md">
              <img
                className="w-[35px] md:w-[43px]"
                src="/asset/tracker-icon.6371fcdb202ad14b09e06a9391bf8cc2.svg"
                alt=""
              />
              <p className="text-xs">Locator</p>
            </li>
          </Link>

          {hasPermission(allRolePermissions, [
            requiredPermissions.CREATE_ARCHIVE,
          ]) && (
            <Link to="/archive" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <img
                  className="w-[35px] md:w-[43px]"
                  src="/asset/archive.3b9ddd7f65d8f9353f8fd0efad0c45e5.svg"
                  alt=""
                />
                <p className="text-xs">Archive</p>
              </li>
            </Link>
          )}
          {hasPermission(allRolePermissions, [
            requiredPermissions.CREATE_ARCHIVE,
          ]) && (
            <Link to="/work-history" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <img
                  className="w-[35px] md:w-[43px]"
                  src="/asset/work-history.c7047f9c0a21ca2ba896c6c73f75c562.svg"
                  alt=""
                />
                <p className="text-xs">Work History</p>
              </li>
            </Link>
          )}

          {hasPermission(allRolePermissions, [
            requiredPermissions.READ_BUDGET,
            requiredPermissions.APPROVE_DOCUMENT,
          ]) && (
            <Link to="/budget" onClick={closeSidebar}>
              <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
                <GiTakeMyMoney
                  className="w-[4rem] md:w-[6rem] text-[#E3BC97]"
                  size={45}
                />
                <p className="text-xs">Budget</p>
              </li>
            </Link>
          )}
          <Link to="/trash" onClick={closeSidebar}>
            <li className="flex flex-col justify-center items-center gap-1 hover:bg-white/10 duration-300 py-2 px-2 hover:scale-105 hover:rounded-md">
              <img
                className="w-[35px] md:w-[43px]"
                src="/asset/full trash.6648e39921b830096f076502815f16eb.svg"
                alt=""
              />
              <p className="text-xs">Recycle Bin</p>
            </li>
          </Link>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
