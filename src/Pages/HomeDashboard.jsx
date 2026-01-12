import Badge from '../Components/Badge';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTrail } from './CustomHook/useTrail';
import {
  hasPermission,
  requiredPermissions,
  getAllRolePermissions,
} from '../../utils/Roles';
import { useUser } from './CustomHook/useUser';

const HomeDashboard = () => {
  const { outgoingLength, incomingLength, physicalLength } = useTrail();
  const { user } = useUser();
  const allRolePermissions = getAllRolePermissions(user);

  return (
    <>
      {/* Banner - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-2 bg-[#E3BC97] md:h-[230px] relative rounded-[15px] md:mt-[50px]">
        <div className="flex flex-col justify-center md:pl-[30px] md:text-left">
          <h2 className="font-bold md:text-[48px]">Cocoa Papers</h2>
          <p className="font-medium md:text-base">
            Ready to start your day with Cocoa Papers?
          </p>
        </div>
        <div className="hidden md:block">
          <img
            className="absolute right-0 bottom-[0px]"
            src="/asset/dashboard-hero-icon.22f0582028e1c313326c6fd4c443be43.svg"
            alt=""
          />
        </div>
      </div>
      <div className="min-h-[80vh] md:min-h-0 flex items-center justify-center md:block pt-16 md:pt-[100px]">
        <div className="w-full grid grid-cols-1 md:flex md:flex-row gap-10 md:gap-[70px] justify-items-center md:justify-start items-center pl-0 md:pl-[30px] cursor-pointer pb-6 md:pb-[37px] md:border-b md:border-black">
        <Link to="/incoming">
          <div>
            <div className="relative hover:bg-[#E3BC97] duration-500 px-4 md:px-3 hover:rounded-lg py-3 md:py-2 hover:scale-110 bg-[#F5EDE6] md:bg-transparent rounded-xl md:rounded-none shadow-md md:shadow-none">
              <img className="w-[120px] md:w-[140px] mx-auto" src="/asset/Incoming.svg" alt="" />
              <p className="text-center font-semibold text-lg md:text-[21px] text-[#582F08] mt-2 md:mt-0">
                Incoming
              </p>
              <div className="absolute bottom-[35px] md:bottom-[25px] right-[5px] md:-right-[0px] bg-[#F54F4B] rounded-[100%] px-3 md:px-[12px] py-1.5 md:py-[4px] text-white font-semibold text-sm md:text-base">
                <p>{incomingLength}</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/outgoing">
          <div>
            <div className="relative hover:bg-[#E3BC97] duration-500 px-4 md:hover:px-3 hover:rounded-lg py-3 md:py-2 hover:scale-110 bg-[#F5EDE6] md:bg-transparent rounded-xl md:rounded-none shadow-md md:shadow-none">
              <img className="w-[120px] md:w-[140px] mx-auto" src="/asset/Outgoing.svg" alt="" />
              <p className="text-center font-semibold text-lg md:text-[21px] text-[#582F08] mt-2 md:mt-0">
                Outgoing
              </p>
              <div className="absolute bottom-[35px] md:bottom-[25px] right-[5px] md:-right-[0px] bg-[#F54F4B] rounded-[100%] px-3 md:px-[12px] py-1.5 md:py-[4px] text-white font-semibold text-sm md:text-base">
                <p>{outgoingLength}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* <Link to="/physicaldocs">
          <div>
            <div className="relative hover:bg-[#E3BC97] duration-500 hover:px-3 hover:rounded-lg py-2 hover:scale-110">
              <img className="w-[140px]" src="/asset/PhysicalDocs.svg" alt="" />
              <div>
                <p className="text-center font-semibold text-[21px] text-[#582F08]">
                  Physical Docs
                </p>
                <div className="absolute bottom-[25px] -right-[15px] bg-[#F54F4B] rounded-[100%] px-[13px] py-[4px] text-white font-semibold">
                  <p>{physicalLength}</p>
                </div>
              </div>
            </div>
          </div>
        </Link> */}
        {/* <div>
          <div className="relative hover:bg-[#E3BC97] duration-500 hover:px-3 hover:rounded-lg py-2 hover:scale-110">
            <img
              className="w-[140px]"
              src="../../src/assets/PhysicalDocs.svg"
              alt=""
            />
            <div>
              <p className="text-center font-semibold text-[21px] text-[#582F08]">
                Physical Docs
              </p>
              <Badge
                value={1}
                className="absolute bottom-[25px] -right-[15px] bg-[#F54F4B] rounded-[100%] px-[13px] py-[4px] text-white font-semibold"
              />
            </div>
          </div>
        </div> */}
        <Link to="/add-document">
          <div className="fixed md:absolute bottom-4 md:bottom-7 right-4 md:right-[62px] bg-[#582F08] rounded-full px-3 md:px-2 py-3 md:py-2 shadow-lg z-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="plus w-6 h-6 md:w-9 md:h-9"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
        </Link>
        </div>
      </div>
    </>
  );
};

export default HomeDashboard;
