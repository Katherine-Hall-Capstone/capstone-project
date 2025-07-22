function CalendarStatus({ googleConnected }) {
    async function handleDisconnect() {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/disconnect`, {
                method: 'POST',
                credentials: 'include'
            })

            if(!res.ok) {
                throw new Error('Failed to disconnect Google Calendar')
            }

            const data = await res.json()
            alert(data.message)
            window.location.reload()
        } catch(error) {
            console.error('Error: ', error)
            alert('Problem disconnect Google Calendar')
        }
    }

    return(
        <div className="calendar-status">
            {googleConnected ? 
                (<button 
                    onClick={handleDisconnect}
                    className="mt-4 py-2 px-5 bg-slate-900 hover:bg-slate-600 duration-200 text-white font-semibold rounded-md cursor-pointer"
                >
                    Disconnect Google Calendar
                </button>) : 
                (<a href={`${import.meta.env.VITE_API_URL}/auth/google`}>
                    <button 
                        className="mt-4 py-2 px-5 bg-slate-900 hover:bg-slate-600 duration-200 text-white font-semibold rounded-md cursor-pointer"
                    >
                        Connect
                    </button>
                </a>)
            }
        </div>
    )
}

export default CalendarStatus