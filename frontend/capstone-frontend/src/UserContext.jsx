import { createContext, useState, useContext, useEffect } from "react"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        fetch("http://localhost:3000/auth/me", { credentials: "include" })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                setUser(data);
            }
        })
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)