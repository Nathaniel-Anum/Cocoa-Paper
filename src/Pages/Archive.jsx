import {
  Table,
  Modal,
  Form,
  Input,
  Button,
  message,
  Upload,
  Divider,
  Popconfirm,
  Radio,
  Breadcrumb,
} from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  DeleteTwoTone,
  EditTwoTone,
  FilePdfFilled,
  FolderAddOutlined,
  FolderFilled,
  UploadOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../Components/axiosInstance';
import { Link, useLocation, useParams } from 'react-router-dom';
import useArchiveTransform from './CustomHook/useArchiveTransform';
import CreateFolder from '../Components/modals/Archive/CreateFolder';
import UploadFile from '../Components/modals/Archive/UploadFile';

const Archive = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();

  const { pathname } = useLocation();

  const cancel = (e) => {
    console.log(e);
    // message.error("Click on No");
  };

  const [crumbs, setCrumbs] = useState([
    {
      title: 'Archive',
      path: '/archive',
      id: 0,
    },
  ]);

  const handleAddItem = (itemToAdd) => {
    //check if the item is already  in items array

    const itemsExist = crumbs.find((item) => item.id === itemToAdd.folderId);

    if (itemsExist) {
      const itemIndex = crumbs.findIndex(
        (item) => item.folderId === itemsExist.folderId
      );

      if (itemIndex !== crumbs.length - 1 || itemIndex !== 0) {
        setCrumbs(crumbs.slice(0, itemIndex + 1));
      }
    } else {
      setCrumbs([
        ...crumbs,
        {
          title: itemToAdd.folderName,
          path: `/${itemToAdd.folderId}`,
          id: itemToAdd.folderId,
        },
      ]);
    }
  };

  useEffect(() => {
    const storedCrumbs = JSON.parse(localStorage.getItem('crumbs')) || [];
    if (storedCrumbs.length) {
      setCrumbs(storedCrumbs);
    }
  }, []);

  // useEffect(() => {
  //   if (id || pathname.split('/')[1] !== 'archive') {
  //     const storedCrumbs = JSON.parse(localStorage.getItem('crumbs')) || [];
  //     console.log(storedCrumbs)
  //     const itemIndex = storedCrumbs.findIndex((item) => item.id === id);
  //     if (itemIndex) {
  //       setCrumbs(storedCrumbs.slice(0, itemIndex + 1));
  //       localStorage.setItem(
  //         'crumbs',
  //         JSON.stringify(storedCrumbs.slice(0, itemIndex + 1))
  //       );
  //     }
  //   }
  // }, [id, pathname]);

  useEffect(() => {
    localStorage.setItem('crumbs', JSON.stringify(crumbs));
  }, [crumbs]);

  // useEffect(() => {
  //   if (pathname) {
  //     console.log('I have been called');
  //     const ItemIndex = crumbs.findIndex((item) => item.id === id);
  //     console.log(ItemIndex);
  //     if (ItemIndex !== 0 || ItemIndex !== -1) {
  //       setCrumbs(crumbs.slice(0, ItemIndex + 1));
  //       localStorage.setItem(
  //         'crumbs',
  //         JSON.stringify(crumbs.slice(1, ItemIndex + 1))
  //       );
  //     } else if (ItemIndex === -1) {
  //       setCrumbs([
  //         {
  //           title: 'Archive',
  //           path: '/archive',
  //           id: 0,
  //         },
  //       ]);
  //       localStorage.setItem(
  //         'crumbs',
  //         JSON.stringify([{ title: 'Archive', path: '/archive', id: 0 }])
  //       );
  //     }
  //   } else {
  //     setCrumbs([
  //       {
  //         title: 'Archive',
  //         path: '/archive',
  //         id: 0,
  //       },
  //     ]);
  //     localStorage.setItem(
  //       'crumbs',
  //       JSON.stringify([{ title: 'Archive', path: '/archive', id: 0 }])
  //     );
  //   }
  // }, [pathname]);

  function itemRender(currentRoute, params, items, paths) {
    console.log({ route: currentRoute.path, items });
    return (
      <Link
        to={
          currentRoute.path === '/archive'
            ? '/archive'
            : `/archive${currentRoute.path}`
        }
      >
        {currentRoute.title}
      </Link>
    );
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'folderName',
      render: (value, record) => (
        <div
          className="flex gap-2 cursor-pointer "
          onClick={() => {
            handleAddItem(record);
            // console.log(crumbs);
          }}
        >
          <Link to={`/archive/${record?.folderId}`}>
            {value ? (
              <div className="flex gap-2">
                <FolderFilled className="text-[24px] text-[#FFAC28]" />
                {value}
              </div>
            ) : (
              <div className="flex gap-2">
                <FilePdfFilled className="text-[24px] text-[#eb3b3b]" />
                {record?.fileName}
              </div>
            )}
          </Link>
        </div>
      ),
    },
    {
      title: 'Reference',
      dataIndex: 'ref',
      render: (value, record) => (
        <div>{value ? record?.ref : <div className="  "> - </div>}</div>
      ),
    },
    {
      title: 'Date Created',
      dataIndex: 'createdAt',
      render: (createdAt) => {
        const dateTime = new Date(createdAt);
        const datesTime = new Date(createdAt);
        return (
          <div className="flex gap-2">
            <div>{dateTime.toDateString()}</div>
            <div>{datesTime.toLocaleTimeString()} </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value) => <div>{value}</div>,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      render: (value) => <div>{value ? value : <div>-</div>}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'archiveId',
      render: (value, record) => (
        <div className="flex gap-3 text-[17px]">
          <button onClick={() => console.log(record)}>
            <EditTwoTone />
          </button>
          <Popconfirm
            title="Delete Archive"
            description="Are you sure to delete this archive?"
            onConfirm={() => confirm(record?.archiveId)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <button>
              <DeleteTwoTone twoToneColor="#FF0000" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  console.log('Test');
  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name,
    }),
  };

  const [selectionType, setSelectionType] = useState('checkbox');

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [form] = Form.useForm();

  //UseQuery to fetch all archives/folders
  const { data: archive } = useQuery({
    queryKey: ['archive', id],
    queryFn: () => {
      if (!id) return axiosInstance.get('/archive');

      return axiosInstance.get(`archive/${id}`);
    },
  });

  const archives = id ? archive?.data?.archive : archive?.data?.archives;
  const { _data } = useArchiveTransform(archives, id);

  const data = _data?.map((archive, index) => ({
    ...archive,
    key: index,
  }));
  // console.log(_data);

  function handleClick() {
    setOpen(true);
  }

  function handleFile() {
    setShow(true);
  }

  return (
    <div className="pt-[70px]  h-screen w-full pl-[200px] pr-[72px]">
      <div>
        <div className="h-[2px] w-[1298px] bg-[#bb9673] m-4"></div>
        <div className="flex gap-4">
          <button
            className=" my-3 p-2 text-[#582F08] flex justify-center items-center gap-1 shadow-md rounded-md  text-[20px] font-semibold "
            onClick={handleClick}
          >
            <FolderAddOutlined className="text-[30px]" />
            <p>New Folder</p>
          </button>
          <button
            className=" my-3 p-2 text-[#582F08] flex justify-center items-center gap-1 shadow-md rounded-md  text-[20px] font-semibold "
            onClick={handleFile}
          >
            <UploadOutlined className="text-[30px]" />
            <p>Upload File</p>
          </button>
        </div>
        <div className="h-[2px] w-[1298px] bg-[#bb9673] m-4"></div>
      </div>

      <Breadcrumb itemRender={itemRender} items={crumbs} />

      <Table
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        columns={columns}
        dataSource={data}
      />

      {open ? <CreateFolder open={open} setOpen={setOpen} id={id} /> : null}
      {show ? <UploadFile show={show} setShow={setShow} id={id} /> : null}
    </div>
  );
};

export default Archive;
