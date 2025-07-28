import ClientSearchForm from '../DashComponents/ClientSearchForm'
import ClientAppointments from '../DashComponents/ClientAppointments'
import ClientReviews from '../DashComponents/ClientReviews'
import ClientPreferences from '../DashComponents/ClientPreferences'
import SlidingTabs from '../DashComponents/SlidingTabs'

const tabs = ['Search', 'Appointments', 'My Reviews', 'My Preferences']
const components = {
    'Search': <ClientSearchForm />, 
    'Appointments': <ClientAppointments />, 
    'My Reviews': <ClientReviews />, 
    'My Preferences': <ClientPreferences />
}

function ClientDashPage() {    
    return(
        <SlidingTabs tabs={tabs} components={components} />
    )
}

export default ClientDashPage