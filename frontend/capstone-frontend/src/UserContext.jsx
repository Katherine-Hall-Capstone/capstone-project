import { createContext, useState, useContext, useEffect } from "react"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading , setLoading] = useState(true)

    const fetchUser = async() => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, { credentials: "include" })
            const data = await res.json()

            if(data.id) {
                setUser(data)
            }
        } catch(error) {
            console.error("Failed to fetch user: ", error)
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => {
        fetchUser()
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)