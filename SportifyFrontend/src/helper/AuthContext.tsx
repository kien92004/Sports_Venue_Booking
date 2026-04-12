// context/AuthContext.tsx
import { createContext, useState, useEffect,type ReactNode } from "react";
import { checkLogin } from "./checkLogin";

interface User {
    loggedIn: boolean;
    username: string;
    role: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLogin().then(res => {
        console.log("AuthProvider checkLogin:", res);
      if (res.loggedIn && res.username && res.role) {
        setUser({
          loggedIn: res.loggedIn,
        username: res.username,
       role: res.role
        });
      }
            setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
