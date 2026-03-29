import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../Components/axiosInstance';

const HomeDashboard = () => {
  const { data: summary } = useQuery({
    queryKey: ['trailSummary'],
    queryFn: async () => {
      const response = await axiosInstance.get('/trail-summary');
      return response.data;
    },
  });

  const incomingLength = summary?.incomingLength ?? 0;
  const outgoingLength = summary?.outgoingLength ?? 0;

  return (
    <>
      {/* Hero Banner - Desktop Only */}
      <div className="hidden  md:mt-[10rem] md:block bg-gradient-to-r from-[#E3BC97] to-[#D4A574] rounded-2xl mt-12 overflow-hidden shadow-lg">
        <div className="grid grid-cols-5 min-h-[200px]">
          {/* Content Section */}
          <div className="col-span-3 flex flex-col justify-center py-8 pl-10 pr-6">
            <div className="space-y-3">
              <h2 className="text-4xl lg:text-5xl font-bold text-[#582F08] leading-tight">
                Cocoa Papers
              </h2>
              <p className="text-lg text-[#694421] font-medium max-w-md">
                Streamline your document workflow with intelligent tracking and seamless collaboration.
              </p>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-[#694421]">Real-time tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-[#694421]">Secure sharing</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Image Section */}
          <div className="col-span-2 relative flex items-end justify-end">
            <img
              className="h-[180px] lg:h-[200px] object-contain"
              src="/asset/dashboard-hero-icon.22f0582028e1c313326c6fd4c443be43.svg"
              alt="Dashboard illustration"
            />
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="md:hidden px-4 pt-4">
        <div className="flex flex-col gap-4">
          {/* Incoming Card */}
          <Link to="/incoming" className="block">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FDF4ED] rounded-xl flex items-center justify-center flex-shrink-0">
                  <img className="w-8 h-8" src="/asset/Incoming.svg" alt="Incoming" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#582F08] text-sm">Incoming</p>
                  <p className="text-xs text-gray-500 mt-0.5">Documents received</p>
                </div>
                <div className="bg-[#F54F4B] text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center">
                  {incomingLength}
                </div>
              </div>
            </div>
          </Link>

          {/* Outgoing Card */}
          <Link to="/outgoing" className="block">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FDF4ED] rounded-xl flex items-center justify-center flex-shrink-0">
                  <img className="w-8 h-8" src="/asset/Outgoing.svg" alt="Outgoing" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#582F08] text-sm">Outgoing</p>
                  <p className="text-xs text-gray-500 mt-0.5">Documents sent</p>
                </div>
                <div className="bg-[#F54F4B] text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[28px] text-center">
                  {outgoingLength}
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Desktop Action Cards Section */}
      <div className="hidden md:block pt-[100px] px-0">
        <div className="w-full flex flex-row gap-[70px] justify-start items-center pl-[30px] cursor-pointer pb-[37px] border-b border-black">
        
        {/* Incoming Card - Desktop */}
        <Link to="/incoming">
          <div className="relative hover:bg-[#E3BC97] transition-all duration-300 hover:rounded-lg hover:px-3 py-2 hover:scale-110">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img className="w-[140px]" src="/asset/Incoming.svg" alt="Incoming documents" />
                <div className="absolute bottom-[25px] -right-[0px] bg-[#F54F4B] rounded-full min-w-[32px] h-8 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {incomingLength}
                </div>
              </div>
              <p className="font-semibold text-[21px] text-[#582F08] mt-2">
                Incoming
              </p>
            </div>
          </div>
        </Link>

        {/* Outgoing Card - Desktop */}
        <Link to="/outgoing">
          <div className="relative hover:bg-[#E3BC97] transition-all duration-300 hover:rounded-lg hover:px-3 py-2 hover:scale-110">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img className="w-[140px]" src="/asset/Outgoing.svg" alt="Outgoing documents" />
                <div className="absolute bottom-[25px] -right-[0px] bg-[#F54F4B] rounded-full min-w-[32px] h-8 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {outgoingLength}
                </div>
              </div>
              <p className="font-semibold text-[21px] text-[#582F08] mt-2">
                Outgoing
              </p>
            </div>
          </div>
        </Link>

        </div>
      </div>

      {/* Floating Add Button */}
      <Link to="/add-document">
        <div className="fixed bottom-4 right-4 md:bottom-7 md:right-[62px] bg-[#582F08] rounded-full p-3 md:p-2 shadow-lg z-20 hover:bg-[#9D4D01] transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="plus w-6 h-6 md:w-9 md:h-9 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
      </Link>
    </>
  );
};

export default HomeDashboard;
