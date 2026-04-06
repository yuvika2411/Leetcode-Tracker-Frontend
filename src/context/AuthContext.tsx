import { createContext, useEffect, useState, useContext } from "react";
import type { LoginRequest } from "../types";
import { AuthService } from "../services/endpoints";

interface User {
    id: string;
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children : React.ReactNode}> = ({children}) => {
    
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
        const response = await AuthService.login(credentials);
        
        // Extract the newly added 'role' from the backend response
        const { accessToken, mentorId, name: userName, role: userRole } = response.data;

        // Save EVERYTHING to localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify({ 
            id: mentorId, 
            name: userName, 
            role: userRole 
        }));

        // Update the React state
        setUser({ id: mentorId, name: userName, role: userRole });
        
        // FIX 2: Removed the setIsAuthenticated line. 
        // Because we called setUser above, !!user automatically evaluates to true!
    };

    const logout = async () => {
        try{
            await AuthService.logout();
        } catch(error){
            console.error("Backend logout failed, forcing local logout", error); 
        } finally{
            // No matter what happens, wipe the frontend memory clean
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return(
        <AuthContext.Provider
        value={{
            user,
            isAuthenticated: !!user, // <-- This dynamically evaluates to true when logged in
            isLoading,
            login,
            logout,
        }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// FIX 3: Tell Vite's strict linter that it's okay to export a hook from this file
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};