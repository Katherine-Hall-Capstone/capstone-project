function CalendarStatus({ googleConnected }) {
    return(
        <div className="calendar-status">
            {googleConnected ? 
                (<p>Calendar connected</p>) : 
                (<a href={`${import.meta.env.VITE_API_URL}/auth/google`}>
                    <button>Connect Google Calendar</button>
                </a>)
            }
        </div>
    )
}

export default CalendarStatus