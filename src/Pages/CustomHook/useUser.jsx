import { createContext, useState, useContext, useEffect } from "react";
import { socket } from '../../utils/socket';
import PropTypes from 'prop-types';

const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      socket.emit('identify', user.userId);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        setIsLoading,
        currentLocation,
        setCurrentLocation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => useContext(UserContext);
