import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import EventListProvider from './context/eventListContext'
import Customize from './components/Customize'
import WidgetEvents from './components/WidgetEvents'
import LoginPage from './components/LoginPage'
import AuthContextProvider from './context/AuthContext'
import SignUpPage from './components/SignUpPage'
import { SignUpRequests } from './components/SignUpRequests'
import SALoginPage from './components/SuperAdmin/SALoginPage'
import SADashboard from './components/SuperAdmin/SADashboard'
import { SASignUpRequests } from './components/SuperAdmin/SASignUpRequests'
import Contracts from './components/SuperAdmin/CompanyContractsPage'
import RegisterCompany from './components/RegisterCompany'
import ForgotPassword from './components/ForgotPassword'
import PasswordReset from './components/PasswordReset'

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
