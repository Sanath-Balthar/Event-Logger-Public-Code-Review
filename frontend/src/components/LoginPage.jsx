import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import {  Box, FormControl, MenuItem, Select } from "@mui/material";
import kalmaneTechImg from "../assets/kalmanetech_Logo.png"
import { useEffect } from "react";


export default function LoginPage(){

    const authContext = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const isAuth = localStorage.getItem("Authenticated");
        // console.log("auth: ",isAuth);
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


    

    function signInHandler(event){
        console.log("Reached Signin");
        event.preventDefault();
        authContext.signIn();
    }

    function signupHandler(event){
        event.preventDefault();
        navigate("/SignUp");
    }

    function registerHandler(event){
        event.preventDefault();
        navigate("/CompanyRegistration");
    }

    /**
     * Function to handle forgot password functionality. Currently unimplemented.
     * @TODO Implement forgot password functionality.
     */
    function forgotPwdHandler(event){
        event.preventDefault();
        navigate("/ForgotPassword");
    }

    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100  ">
            {/* Heading Div*/}
            <img src={kalmaneTechImg} alt="Logo" className="h-[50px] bg-blue-100 mb-5"/>
                <div className="flex-row min-w-[500px] min-h-[500px] m-5 items-center justify-center shadow-xl rounded-xl bg-white">
                <div className="flex w-full h-[100px] justify-center items-center bg-blue-800 text-white rounded-t-xl">
                    <h1 className=' text-xl font-bold text-center'>Sign In to Event Logger Dashboard</h1>
                </div> 
                    <form className="flex flex-col pt-[50px] justify-center items-center "  onSubmit={signInHandler}>
                        <input type="text" placeholder="Company Name" name="CompanyName" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>authContext.setCompany(e.target.value)} required></input>
                        <input type="text" placeholder="Username" name="Username" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md  " onChange={(e)=>authContext.setUsername(e.target.value)} required></input>
                        <input type="password" placeholder="Password" name="Password" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md  " onChange={(e)=>authContext.setPassword(e.target.value)} autoComplete="off" required></input>
                        <Box sx={{ minWidth: 120, margin: 2}}>
                            <FormControl fullWidth>
                                {/* <InputLabel>Role</InputLabel> */}
                                <Select value={authContext.role} onChange={(e)=>{ authContext.setRole(e.target.value) }}>
                                    <MenuItem value={"Choose Role"}>Choose Role</MenuItem>
                                    <MenuItem value={"admin"}>Admin</MenuItem>
                                    <MenuItem value={"user"}>User</MenuItem>     
                                </Select>
                            </FormControl>
                        </Box>
                        <button type="submit" className=" w-[150px] text-white my-3 py-2 rounded bg-blue-600 hover:bg-blue-900 transition"> Submit</button>
                        <div className="pb-2" >
                            <button type="button" className=" w-[150px] text-white m-3 p-2 rounded bg-blue-600 hover:bg-blue-900 transition"  onClick={signupHandler}>Sign Up</button>
                            <button type="button" className=" w-[150px] text-white m-3 p-2 rounded bg-blue-600 hover:bg-blue-900 transition"  onClick={registerHandler}>Register Company</button>
                        </div>
                        <div className="pb-10" >
                            <button type="button" className=" w-[150px] text-white m-3 p-2 rounded bg-blue-600 hover:bg-blue-900 transition" onClick={forgotPwdHandler}>Forgot Password?</button>
                        </div>
                    </form>
                </div>

        </div>            
    )
}