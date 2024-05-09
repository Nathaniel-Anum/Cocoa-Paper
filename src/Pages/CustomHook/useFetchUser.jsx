import React from "react";
import { useUser } from "./useUser";

const useFetchUser = () => {
  const { setUser, setIsLoading } = useUser();

  useEffect(() => {
    const fetchUser = () => {
      setIsLoading(true);

      axiosInstance
        .get("/user")
        .then((res) => {
          setUser(res?.data?.user);
        })
        .finally(() => setIsLoading(false));
    };
    fetchUser();
  }, []);
};

export default useFetchUser;
