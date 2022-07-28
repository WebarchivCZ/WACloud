import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  FunctionComponent,
  ReactNode
} from 'react';
import { useTranslation } from 'react-i18next';

import IUser from '../interfaces/IUser';
import { addNotification } from '../config/notifications';

const authContext = createContext<AuthProps | null>(null);

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().

type AuthProps = {
  user: IUser | null;
  signIn: (user: IUser) => void;
  signOut: () => void;
};

export const ProvideAuth: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
const useProvideAuth = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<IUser | null>(null);

  // Wrap any Firebase methods we want to use making sure ...
  // ... to save the user to state.
  const signIn = (user: IUser) => {
    setUser(user);
  };

  const signOut = () => {
    fetch('/api/logout', {
      method: 'POST'
    }).then(() => {
      setUser(null);
      addNotification(t('logout.header'), t('logout.success'), 'success');
    });
  };

  // Subscribe to user on mount
  // Because this sets state in the callback it will cause any ...
  // ... component that utilizes this hook to re-render with the ...
  // ... latest auth object.
  useEffect(() => {
    fetch('/api/me')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error();
      })
      .then((response) => signIn(response))
      .catch(() => setUser(null));

    return () => setUser(null);
  }, []);

  // Return the user object and auth methods
  return {
    user,
    signIn,
    signOut
  };
};
