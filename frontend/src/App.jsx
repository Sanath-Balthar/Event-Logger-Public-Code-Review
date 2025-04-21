import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import EventListProvider from './context/eventListContext'
import Customize from './Pages/Customize'
import WidgetEvents from './Pages/WidgetEvents'
import LoginPage from './Pages/LoginPage'
import AuthContextProvider from './context/AuthContext'
import SignUpPage from './Pages/SignUpPage'
import { SignUpRequests } from './Pages/SignUpRequests'
import SALoginPage from './Pages/SuperAdmin/SALoginPage'
import SADashboard from './Pages/SuperAdmin/SADashboard'
import { SASignUpRequests } from './Pages/SuperAdmin/SASignUpRequests'
import Contracts from './Pages/SuperAdmin/CompanyContractsPage'
import RegisterCompany from './Pages/RegisterCompany'
import ForgotPassword from './Pages/ForgotPassword'
import PasswordReset from './Pages/PasswordReset'

function App() {
   

  return (
    <>
      {/* <div>
        <h1 className='text-xl font-bold underline'>Event Logger Dashboard</h1>
      </div>
      */}
      
        <Router>
        <AuthContextProvider>
          <EventListProvider>
          <Routes>
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/SignUp" element={<SignUpPage/>}/>
            <Route path="/ForgotPassword" element={<ForgotPassword/>}/>
            <Route path="/password-reset/:token" element={<PasswordReset/>}/>
            <Route path="/CompanyRegistration" element={ <RegisterCompany/> }/>
            <Route path="/SASignIn" element={<SALoginPage/>}/>
            <Route
                path="/*"
                element={
                    <Routes>
                      <Route path='/dashboard' element={<Dashboard/>}></Route>
                      <Route path='/Customize' element={<Customize/>}></Route>
                      <Route path='/widgetEvents' element={<WidgetEvents/>}></Route>
                      <Route path='/requests' element={<SignUpRequests/>}></Route>
                      <Route path='/SAdashboard' element={<SADashboard/>}></Route>
                      <Route path='/SArequests' element={<SASignUpRequests/>}></Route>
                      <Route path='/SAContracts' element={<Contracts/>}></Route>
                    </Routes>
                }
              />
          </Routes>
          </EventListProvider>
        </AuthContextProvider>
        </Router>
        
    </>
  )
}

export default App
