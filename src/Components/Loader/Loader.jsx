import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';

const Loader = () => {
  return (
    <div>
      <div className=" flex justify-center items-center h-screen">
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 54 }} spin />}
          className="text-[#582F08] "
        />
      </div>
    </div>
  );
};

export default Loader;
