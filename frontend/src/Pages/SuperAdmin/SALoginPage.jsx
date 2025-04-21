import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"
// import { Box, FormControl, MenuItem, Select } from "@mui/material";
import kalmaneTechImg from "../../assets/kalmanetech_Logo.png"
import axios from "axios";
import { useEffect } from "react";


export default function SALoginPage(){

    const authContext = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loginCheck();
          // Disabled warning about missing dependency since 
    // this code is designed to use a single dependency
    // eslint-disable-next-line 
      }, []);

      const loginCheck = async ()=>{
        try {
            const isAuth = localStorage.getItem("Authenticated");
            if(isAuth){
                const confirmLogout = window.confirm("Are you sure you want to log out?")
                if(confirmLogout){
                    const logoutRes = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/auth/signout`,{},{withCredentials:true});
                    console.log("LogoutStatus: "+logoutRes.status);
                    // if(logoutRes.status===200){
                        localStorage.removeItem("Authenticated");
                        window.location.href = "/SASignIn";
                    // }
                }else{
                    navigate(-1);
                }
            }
        } catch (error) {
                console.log(error);
                localStorage.removeItem("Authenticated");
                window.location.href = "/SASignIn";
        }
      }


    async function signInHandler(event){
        try {
            console.log("Reached Signin");
            event.preventDefault();
            const url = `${import.meta.env.VITE_BACKEND_API_URL}/superAdmin/SignIn`;
            console.log("URL: ",url )
            const response = await axios.post(url,{username:authContext.username, password:authContext.password},{headers: { "Content-Type": "application/json" } ,withCredentials  :true});
            // console.log("Username: "+username, "Password: " +password);
            if(response.status===200){
                console.log("Success Login")
                localStorage.setItem("Authenticated", true)
                authContext.setIsAuthenticated(true);
                navigate("/SAdashboard");
                // alert("Success")
            }else{
                console.log("Login Failure: ",response.data)
                authContext.setIsAuthenticated(false);
                alert("Incorrect credentials")
              }
        } catch (error) {
            console.log("Login Failure: ",error)
            if(error.response.status===401){
                authContext.setIsAuthenticated(false);
                localStorage.removeItem("Authenticated");
                alert("Incorrect credentials")
            }else{
                alert("Login Failure: Issue at backend Server")
            }
   
        }
    }

    /**
     * Function to handle forgot password functionality. Currently unimplemented.
     * @TODO Implement forgot password functionality.
     */
    // function forgotPwdHandler(){

    // }

    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100  ">
            {/* Heading Div*/}
            <img src={kalmaneTechImg} alt="Logo" className="h-[50px] bg-blue-100 mb-5"/>
                <div className="flex-row md:min-w-[500px] md:min-h-[500px] m-5 items-center justify-center shadow-xl rounded-xl bg-white">
                <div className="flex w-full h-[50px] md:h-[100px] justify-center items-center bg-blue-800 text-white rounded-t-xl">
                    <h1 className=' md:text-xl p-2 font-bold text-center'>Sign In to SuperAdmin Dashboard</h1>
                </div> 
                    <form className="flex flex-col pt-[50px] justify-center items-center "  onSubmit={signInHandler}>
                        <input type="text" placeholder="Username" name="Username" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md  " onChange={(e)=>authContext.setUsername(e.target.value)} required></input>
                        <input type="password" placeholder="Password" name="Password" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md  " onChange={(e)=>authContext.setPassword(e.target.value)} required></input>
                        <button type="submit" className=" w-[150px] text-white my-3 py-2 rounded bg-blue-600 hover:bg-blue-900 transition"> Submit</button>
                        {/* <div className="pb-10" >
                            <button type="button" className=" w-[150px] text-white m-3 p-2 rounded bg-blue-600 hover:bg-blue-900 transition" onClick={forgotPwdHandler}>Forgot Password?</button>
                        </div> */}
                    </form>
                </div>

        </div>            
    )
}