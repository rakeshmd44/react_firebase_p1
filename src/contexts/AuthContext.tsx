import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // After successful login, navigate to the home page
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
} 