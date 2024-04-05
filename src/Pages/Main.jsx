import axios from "axios";
import Badge from "../Components/Badge";
import React, { useEffect } from "react";

const Main = () => {
  return (
    <div className="pt-[70px]  h-screen w-full pl-[200px] pr-[72px] ">
      <div className="grid grid-cols-2 bg-[#E3BC97] h-[230px] relative rounded-[15px]  mt-[50px] ">
        <div className="flex flex-col justify-center pl-[30px] ">
          <h2 className="font-bold text-[48px]">Cocoa Papers</h2>
          <p className="font-medium">
            Ready to start your day with Cocoa Papers?
          </p>
        </div>
        <div>
          <img
            className="absolute right-0 bottom-[0px]"
            src="../../src/assets/dashboard-hero-icon.22f0582028e1c313326c6fd4c443be43.svg"
            alt=""
          />
        </div>
      </div>
      <div className="pt-[100px] flex justify-start items-center gap-[70px] pl-[30px] cursor-pointer  pb-[37px] border-b border-black ">
        <div>
          <div>
            <img
              className="w-[140px]"
              src="../../src/assets/Incoming.svg"
              alt=""
            />
            <p className="text-center font-semibold text-[21px] text-[#582F08]">
              Incoming
            </p>
          </div>
        </div>

        <div>
          <div className="relative">
            <img
              className="w-[140px]"
              src="../../src/assets/Outgoing.svg"
              alt=""
            />
            <p className="text-center font-semibold text-[21px] text-[#582F08]">
              Outgoing
            </p>
            <div className="absolute bottom-[25px] -right-[15px] bg-[#F54F4B] rounded-[100%] px-[10px] py-[4px] text-white font-semibold">
              <p>11</p>
            </div>
          </div>
        </div>
        <div>
          <div className="relative">
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
        </div>
        <div className="absolute bottom-7 right-[62px] bg-[#582F08] rounded-full px-2 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="plus"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Main;
