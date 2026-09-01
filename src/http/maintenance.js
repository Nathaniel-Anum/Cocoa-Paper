import axiosInstance from "../Components/axiosInstance";

// List the maintenance scripts available to run from the admin console
export const getMaintenanceScripts = async () => {
  const res = await axiosInstance.get("/maintenance/scripts");
  return res.data.scripts;
};

// Run a script. apply=false is a safe dry run; apply=true performs changes.
export const runMaintenanceScript = async (id, apply = false) => {
  const res = await axiosInstance.post(`/maintenance/scripts/${id}/run`, {
    apply,
  });
  return res.data;
};
