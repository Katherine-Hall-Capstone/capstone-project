import { FcGoogle } from "react-icons/fc"

function CalendarStatus({ googleConnected }) {
    async function handleDisconnect() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/disconnect`, {
                method: 'POST',
                credentials: 'include'
            })

            if(res.ok) {
                window.location.reload()
            } else {
                console.error('Failed to disconnect Google Calendar')
            }
        } catch(error) {
            console.error('Error: ', error)
        }
    }

    return(
        <div>
            {googleConnected ? 
                (<button 
                    onClick={handleDisconnect}
                    className="client-pref-g"
                >
                    Disconnect 
                    <span className="text-lg"><FcGoogle /></span>
                </button>) : 
                (<a href={`${import.meta.env.VITE_API_URL}/auth/google`}>
                    <button 
                        className="client-pref-g"
                    >
                        Connect
                        <span className="text-lg"><FcGoogle /></span>
                    </button>
                </a>)
            }
        </div>
    )
}

export default CalendarStatus