import axiosInstance from "../Components/axiosInstance";

// Users in the logged-in person's division that a folder can be shared with
export const getShareableUsers = async () => {
  const res = await axiosInstance.get("/folder-access/users");
  return res.data.users;
};

// Grant access to one or more recipients on a folder
// recipients: [{ userId, role: 'VIEWER'|'EDITOR', canDelete: boolean }]
// includeFolderIds: descendant folders to grant as well
export const grantFolderAccess = (
  folderId,
  recipients,
  includeFolderIds = [],
) => {
  return axiosInstance.post(`/folder-access/${folderId}`, {
    recipients,
    includeFolderIds,
  });
};

// List everyone who has access to a folder (owner only), plus subfolders
export const getFolderAccessList = async (folderId) => {
  const res = await axiosInstance.get(`/folder-access/${folderId}`);
  return {
    access: res.data.access || [],
    subfolders: res.data.subfolders || [],
  };
};

// Update a recipient's permissions on a folder
export const updateFolderAccess = (folderId, targetUserId, data) => {
  return axiosInstance.patch(
    `/folder-access/${folderId}/${targetUserId}`,
    data,
  );
};

// Revoke a recipient's access to a folder
export const revokeFolderAccess = (folderId, targetUserId) => {
  return axiosInstance.delete(`/folder-access/${folderId}/${targetUserId}`);
};

// Folders shared with the current user
export const getSharedWithMe = async () => {
  const res = await axiosInstance.get("/folder-access/shared/with-me");
  return res.data.folders;
};
