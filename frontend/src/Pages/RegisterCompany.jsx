// import {Box, FormControl, MenuItem, Select } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import kalmaneTechImg from "../assets/kalmanetech_Logo.png"
import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function RegisterCompany(){
    const authContext = useAuth();
    const navigate = useNavigate();
    const [admin, setAdmin] = useState("");
    const [company, setCompany] = useState("");
    const [adminEmail, setEmail] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        const isAuth = localStorage.getItem("Authenticated");
        if(isAuth){
            const confirmLogout = window.confirm("Are you sure you want to log out?")
            if(confirmLogout){
                authContext.signout();
            }else{
                navigate(-1);
            }
        }
    // Disabled warning about missing dependency since 
    // this code is designed to use a single dependency
    // eslint-disable-next-line 
      }, []);


    

    const companyRegisterHandler = async (event)=>{
        event.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/auth/CompanyRegistration`,{company: company, primary_admin: admin, password: password, email: adminEmail}, {withCredentials:true});
            if(response.status===200){
                alert("Registration request sent for approval!");
            }else if(response.status===409){
                alert("Company already registered");
            }
          } catch (error) {
            console.error(error);
            if(error.response!==undefined){
                if(error.response.status===500){
                    alert("Registration failed. Please contact support team!")
                }else if(error.response.status===409){
                    alert("Company already registered");
                }else{
                    alert("Registration failed. Please contact support team!")
                }
            }else{
                alert("Registration failed. Please contact support team!")
            }
          }
    }

    function onBack(event){
        event.preventDefault();
        navigate("/");
    }

    return(       
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 ">
        {/* Heading Div*/}
             <img src={kalmaneTechImg} alt="Logo" className="h-[50px] bg-blue-100 mb-5"/>
             <div className="flex-row md:min-w-[500px] md:min-h-[500px] m-5 items-center justify-center shadow-xl rounded-xl bg-white">
                <div className="flex w-full h-[50px] md:h-[100px] justify-center items-center bg-blue-800 text-white rounded-t-xl">
                    <h1 className='text-sm md:text-xl font-bold text-center'>Company Registration Form</h1>
                </div> 

                <form className="flex flex-col pt-[20px] justify-center items-center"  onSubmit={companyRegisterHandler}>
                    <input type="text" placeholder="Company Name" name="CompanyName" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>setCompany(e.target.value)} required></input>
                    <input type="text" placeholder="Admin Email" name="AdminEmail" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>setEmail(e.target.value)} required></input>
                    <input type="text" placeholder="Admin Username" name="AdminUsername" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>setAdmin(e.target.value)} required></input>
                    <input type="password" placeholder="Admin Password" name="AdminPassword" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>setPassword(e.target.value)} autoComplete="off" required></input>
                    <button type="submit" className=" w-[100px] text-white my-3 p-2  rounded bg-blue-600 hover:bg-blue-900 transition"> Register</button>
                    <button type="submit" onClick={onBack} className=" w-[120px] text-white my-1 mb-5 p-2 rounded bg-blue-600 hover:bg-blue-900 transition"> Back to Login</button>
                </form>
             </div>
    </div>   

    )
}