import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()
const API = import.meta.env.VITE_API_URL

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    })
    const [token, setToken] = useState(() => localStorage.getItem('token') || null)

    async function login(ten, mat_khau) {
        const res = await axios.post(`${API}/api/auth/login`, { ten, mat_khau })
        setUser(res.data.user)
        setToken(res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        localStorage.setItem('token', res.data.token)
        return res.data.user
    }

    function logout() {
        setUser(null)
        setToken(null)
        localStorage.clear()
    }

    function updateUser(newUser) {
        setUser(newUser)
        localStorage.setItem('user', JSON.stringify(newUser))
    }

    // Tự động bắt lỗi 401/403 từ tất cả các API để đá văng ra ngoài
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // Tránh báo lỗi liên tục ở màn hình login nếu gọi sai mk
                    if (!error.config.url.includes('/api/auth/login')) {
                        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!');
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)