import { useContext, useState } from "react";
import axios from "axios";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
// const dotenv = require("dotenv");

// dotenv.config();

export const AuthContext = createContext();

export default function AuthContextProvider({children}){

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    // const [fullName, setFullName] = useState("");
    // const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const [accessToken, setToken] = useState("");
    const [role, setRole] = useState("Choose Role");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [company,setCompany] = useState("");

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_BACKEND_API_URL;

    async function signIn(){
        console.log("Reached Signin");
            try{                
                // console.log("API URL:", API_URL); 
                const url = `${API_URL}/auth/SignIn`;
                console.log("Reached Signin");
                const response = await axios.post(url,{username:username, password:password, role:role, company:company},{headers: { "Content-Type": "application/json" } ,withCredentials  :true});
                // console.log("Username: "+username, "Password: " +password);
                if(response.status===200){
                    // console.log("Login Time: "+ Date.now() )
                    localStorage.setItem("Authenticated", true)
                    setIsAuthenticated(true);
                    navigate("/dashboard");
                    // alert("Success")
                }else{
                    console.log("Login Failure: ",response.data)
                    localStorage.removeItem("Authenticated")
                    setIsAuthenticated(false);
                    alert("Incorrect credentials or role")
                  }
            }catch (error) {
                console.error('Error logging in:', error);
                if(error.response.status===401){
                    alert("Invalid credentials or role!")
                }else if(error.response.status===400){
                    alert("Company has not been registered. Please register the company!")
                }else if(error.response.status===403){
                    alert("Account has not been approved by admin. Please wait for approval or contact admin!")
                }else if(error.response.status===405){
                    alert("Company Subscription Ended. Please renew and then try to SignIn!")
                }else{
                    alert("Sign In Failed. An error occured at backend server. Please contact support!")
                  }
            }
    }

    async function signUp(){

        const url2 = `${API_URL}/auth/SignUp`;

            try{
                if(role==="Choose Role"){
                    alert("Please select the role!")
                    return;
                }
                const response = await axios.post(url2,{username:username, password:password, role:role, company:company, email: email},{withCredentials:true});
                // console.log("Username: "+username, "Password: " +password, "email: "+email);
                console.log("Response data: ",response.data.message);
                if(response.status===200){
                    alert("Sign Up Request sent to admin. Please try to login after request approval!")
                }else{
                    alert("Sign Up failed")
                }
                
            }catch (error) {
                console.error('Error logging in:', error.response.status);
                if(error.response.status===401){
                    alert("User Name already exists. Please use a different username!")
                }else if(error.response.status===400){
                    alert("Company has not been registered. Please register the company!")
                }else if(error.response.status===405){
                    alert("Company Subscription Ended. Please renew and then try to SignUp!")
                }else{
                    alert("'Sign Up failed. An error occured at backend server. Please contact support team!'")
                }
            }
       
    }

    async function signout() {
        try{
            const logoutRes = await axios.post(`${API_URL}/auth/signout`,{},{withCredentials:true});
            console.log("LogoutStatus: "+logoutRes.status);
            // if(logoutRes.status===200){
                localStorage.clear();
                setIsAuthenticated(false);
                window.location.href = "/";
            // }
        }catch(error) {
            console.error('Error logging out:', error);
            localStorage.clear();
            setIsAuthenticated(false);
            window.location.href = "/";
        }
    }


    return (
        <AuthContext.Provider value={{username,setUsername,email,setEmail,password,setPassword,signIn,signUp,isAuthenticated, setIsAuthenticated,role,setRole,signout,company,setCompany}}>
            {children}
        </AuthContext.Provider>
    );

}

// ✅ Validate 'children' correctly
AuthContextProvider.propTypes = {
    children: PropTypes.node.isRequired, // Accepts any valid React children
  };

export const useAuth = ()=>{
    return useContext(AuthContext);
}