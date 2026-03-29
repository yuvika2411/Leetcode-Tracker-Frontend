import { createContext, useEffect, useState, useContext } from "react";
import type { LoginRequest } from "../types";
import { AuthService } from "../services/endpoints";

interface User{
    id: string;
    name: string;
}

interface AuthContextType{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children : React.ReactNode}> = ({children}) => {
    
    const [user,setUser] = useState<User | null>(null);

    // We start loading as 'true' so we don't accidentally flash the login screen
    // to a user who is already logged in while we check their local storage.
    const [isLoading,setIsLoading] = useState(true);

    useEffect(() => {
        // When the app boots up, check if we already have a session saved
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        if(token && storedUser){
            try{
                setUser(JSON.parse(storedUser));
            }catch(error){
                console.error("Failed to parse stored user data",error);
                localStorage.removeItem('user');
            }
        }
        // Done checking, safe to render the app
        setIsLoading(false);
    },[]);

    const login = async (credentials: LoginRequest) => {
        // 1. Hit the Spring Boot backend
        const response  = await AuthService.login(credentials);
        const {accessToken , mentorId , name} = response.data;

        // 2. Save the Access Token for the Axios Interceptor
        localStorage.setItem('accessToken', accessToken);

        //3. save the User data to Context State and Local Storage
        const userData = {id: mentorId, name};
        localStorage.setItem('user',JSON.stringify(userData));
        setUser(userData);
    };

    const logout =  async () => {
        try{
            await AuthService.logout();
        } catch(error){
            console.error("Backend logout failed, forcing local logout", error); 
        } finally{
            // 2. No matter what happens, wipe the frontend memory clean
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return(
        <AuthContext.Provider
        value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
        }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// 5. Create a custom hook for easy access
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};