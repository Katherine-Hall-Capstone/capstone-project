import { createContext, useState, useContext, useEffect } from "react"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading , setLoading] = useState(true)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { credentials: "include" })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                setUser(data);
            }
        })
        .finally(() => setLoading(false))
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)