import ProviderAvailability from '../DashComponents/ProviderAvailability'
import ProviderAppointments from '../DashComponents/ProviderAppointments'
import ProviderReviews from '../DashComponents/ProviderReviews'
import SlidingTabs from '../DashComponents/SlidingTabs'

const tabs = ['My Service Details', 'Appointments', 'My Reviews']
const components = {
    'My Service Details': <ProviderAvailability />, 
    'Appointments': <ProviderAppointments />, 
    'My Reviews': <ProviderReviews />, 
}

function ProviderDashPage() {
    return(
        <SlidingTabs tabs={tabs} components={components} />
    )
}

export default ProviderDashPage