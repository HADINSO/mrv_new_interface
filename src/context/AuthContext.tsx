import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from '../components/Loader/Skeleton';

interface User {
    id: number;
    username: string;
    email: string;
    apellido: string;
    nombre: string;
    idrol: number;
    rol: string;
    estado: number;
}

interface AuthContextProps {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkToken: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const [loading, setLoading] = useState(true);

    const login = async (username: string, password: string) => {
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            const response = await axios.post("https://api.helsy.com.co/iniciarSesion.php", formData);
            const { token, user } = response.data;

            setToken(token);
            setUser(user);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
        } catch (error: any) {
            console.error("Error de autenticación:", error?.response?.data || error.message);
            throw new Error("Credenciales inválidas o error de red.");
        }
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const checkToken = async () => {
        // Placeholder para cumplir con la interfaz (no implementado como se indicó)
        return;
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div>
                <Skeleton />
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                checkToken,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
