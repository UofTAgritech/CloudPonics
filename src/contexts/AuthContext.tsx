import { useContext, useState, createContext, useEffect, FC } from 'react';
import { initializeApp } from '@firebase/app';
import { getAuth, onAuthStateChanged, User } from '@firebase/auth';

// Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAHVx4BGAxOTIm0VVQw-3EpM_w-IKxH8Ks",
    authDomain: "cloudponics-bc383.firebaseapp.com",
    projectId: "cloudponics-bc383",
    storageBucket: "cloudponics-bc383.appspot.com",
    messagingSenderId: "615419170947",
    appId: "1:615419170947:web:d0669656f4182056724bb6",
    measurementId: "G-3LBFQ98WJY"
  };
initializeApp(firebaseConfig);

type AuthState = null | undefined | User;

// Context
const AuthContext = createContext<AuthState>(undefined);

// Context hook
const useAuth = () : AuthState => {
    return useContext(AuthContext);
};

// Provider component
const AuthProvider:FC = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<AuthState>(undefined);

    useEffect(()=>{
        return onAuthStateChanged(getAuth(), user=>{
            setCurrentUser(user);
        });
    },[]);
    const value = currentUser;

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { useAuth };
export default AuthProvider;