import { createContext, useState, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false)

  return (
    <UserContext.Provider value={{ user, setUser, isLoading , setIsLoading}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
