import { useQuery, useQueryClient } from "@tanstack/react-query";
import { message, Popconfirm, Table, Tooltip } from "antd";

import React from "react";
import axiosInstance from "../Components/axiosInstance";
import { MdOutlineSettingsBackupRestore } from "react-icons/md";
import { FilePdfFilled, FolderFilled } from "@ant-design/icons";

const RecycleBin = () => {
  const queryClient = useQueryClient();
  // useQuery to fetch all trails
  const { data: recycle } = useQuery({
    queryKey: ["recycle"],
    queryFn: () => {
      return axiosInstance.get("/recycle");
    },
  });
  console.log(recycle?.data?.result);

  const formattedData = [
    ...(recycle?.data?.result?.deletedFiles || []).map((file) => ({
      key: file.fileId, // Used as unique row key
      fileId: file.fileId, // Store fileId but don't display it
      isDeleted: file.isDeleted, // Store isDeleted but don't display it
      name: (
        <div className="flex items-center align-center">
          <FilePdfFilled className="text-[24px] text-[#eb3b3b]" />
          {file.fileName}
        </div>
      ),
      subject: file.subject,
      reference: file.ref,
      type: "File",
    })),
    ...(recycle?.data?.result?.deletedFolders || []).map((folder) => ({
      key: folder.folderId, // Used as unique row key
      folderId: folder.folderId, // Store folderId but don't display it
      isDeleted: folder.isDeleted, // Store isDeleted but don't display it
      name: (
        <div className="flex items-center align-center">
          <FolderFilled className="text-[24px] text-[#FFAC28]" />
          {folder.folderName}
        </div>
      ),
      subject: "-", // Folders don't have subjects
      reference: "-", // Folders don't have references
      type: "Folder",
    })),
  ];

  const handleRestore = async (record) => {
    // console.log("Restoring:", record);

    try {
      // Determine if it's a file or folder and send the appropriate request
      if (record.type === "File") {
        await axiosInstance.patch(`/restore/${record.fileId}`);
      } else {
        await axiosInstance.patch(`/restore/${record.folderId}`);
      }

      // Show success message
      message.success("Item restored successfully!");

      // Refetch data to update the table without refreshing the page
      await queryClient.invalidateQueries("recycle");
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name  ",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject  ",
    },
    {
      title: "Reference",
      dataIndex: "reference",
      key: "reference  ",
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id  ",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to restore this item?"
          onConfirm={() => handleRestore(record)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Restore">
            <MdOutlineSettingsBackupRestore className="text-blue-500 text-xl cursor-pointer" />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={formattedData} />
    </div>
  );
};

export default RecycleBin;
