import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import kalmaneTechImg from "../assets/kalmanetech_Logo.png"
import axios from "axios";
import { useEffect, useState } from "react";



export default function PasswordReset(){

    const API_URL = import.meta.env.VITE_BACKEND_API_URL;

    const authContext = useAuth();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

     

    async function onSubmit(event){
        console.log("Reached Submit");
        event.preventDefault();

        try{                
            // console.log("API URL:", API_URL); 
            if(password !== confirmPassword){
                alert("Passwords do not match");
                return;
            }
            const token = window.location.pathname.split("/").pop().trim();
            console.log("Token: ",token);
            const url = `${API_URL}/auth/password-reset/${token}`;
            const response = await axios.post(url,{password: confirmPassword},{headers: { "Content-Type": "application/json" } ,withCredentials  :true});
            // console.log("Username: "+username, "Password: " +password);
            if(response.status===200){
                // console.log("Login Time: "+ Date.now() )
                // localStorage.setItem("Login Time",Date.now())
                alert("Password has been reset. Please try to login now!")
                // alert("Success")
            }else{
                console.log("Login Failure: ",response.data)
                alert("Incorrect mail id")
                }
        }catch (error) {
            console.error('Error logging in:', error);
            if(error.response.status===401){
                alert("Incorrect mail id")
            }else{
                alert("An error occured at backend server. Please contact support!")
                }
        }
        
    }

    function onBack(event){
        event.preventDefault();
        navigate("/");
    }

    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100  ">
            {/* Heading Div*/}
            <img src={kalmaneTechImg} alt="Logo" className="h-[50px] bg-blue-100 mb-5"/>
                <div className="flex-row min-w-[500px] min-h-[500px] m-5 items-center justify-center shadow-xl rounded-xl bg-white">
                <div className="flex w-full h-[100px] justify-center items-center bg-blue-800 text-white rounded-t-xl">
                    <h1 className=' text-xl font-bold text-center'>Password Reset</h1>
                </div> 
                    <form className="flex flex-col pt-[50px] justify-center items-center "  onSubmit={onSubmit}>
                        {/* <input type="text" placeholder="Email id" name="email" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md  " onChange={(e)=>authContext.setEmail(e.target.value)} required></input> */}
                        <input type="text" placeholder="Password" name="Password" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>setPassword(e.target.value)} required autoComplete="off"></input>
                        <input type="password" placeholder="Password" name="Password" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>setConfirmPassword(e.target.value)} autoComplete="off" required></input>
                        <button type="submit" className=" w-[150px] text-white my-3 py-2 rounded bg-blue-600 hover:bg-blue-900 transition"> Submit</button>
                        <div className="pb-2" >
                            <button type="button" className=" w-[150px] text-white m-3 p-2 rounded bg-blue-600 hover:bg-blue-900 transition"  onClick={onBack}>Back to Login</button>
                        </div>
                    </form>
                </div>

        </div>            
    )
}