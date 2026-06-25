import { createContext, useContext, useState } from 'react'
import axios from 'axios'

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

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)