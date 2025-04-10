import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import TuneIcon from '@mui/icons-material/Tune';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { Dashboard, Delete, Grading } from "@mui/icons-material";
import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const SideBar = ()=>{

    const authContext = useAuth();
    const navigate = useNavigate()
    const location = useLocation();
     const [isSidebar, setSideBar] = useState(false);
    
   
     

    function onCustomize(event){
            event.preventDefault();
            navigate("/Customize");
        }
    
    function onDashboard(event){
        event.preventDefault();
        navigate("/Dashboard");
    }
    
    async function onDeleteEvents(event){
        event.preventDefault();

        console.log("Reached delete Events")
        axios.post(`${API_URL}/event/deleteAllEvents`,{},{withCredentials:true})
        .then(()=>{
            console.log("Deleted events");
        })
        .catch((err)=>{
            const errData = err.response.data.error;
            console.log("Error in onDeleteEvents: ",errData)
            
            if(errData=="Invalid token"){
                alert("Session Expired! Please login again")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }else if(errData=="Unauthorized"){
                alert("Forbidden, insufficient permissions!")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }
        })
    }
    
    function onSignUpRequest(event){
        event.preventDefault();
        navigate("/requests")
    }

    async function onLogout(event){
        event.preventDefault();
        console.log("Logout path: ", location.pathname)
        const confirmLogout =window.confirm("Are you sure you want to logout?")
        if(confirmLogout){
            await authContext.signout();
        }
        
    }

    return(
        <div className="flex flex-col items-center">
           { 
           isSidebar?(
            <div className="flex flex-col items-center w-[210px] min-h-screen pt-5 bg-blue-900 border-r-[5px] border-white">                    

                    <button data-testid="sidebar-button" type="button" onClick={()=>setSideBar(!isSidebar)} ><MenuOpenIcon fontSize="large" className="flex justify-center p-1 mx-[22px]  text-white bg-blue-900 rounded hover:bg-blue-100 hover:text-black transition"/></button>
                    
                    <button  data-testid="dashboard-button" className="flex flex-row w-[90%] my-1 mt-2 justify-center py-2 text-white font-bold bg-blue-900 rounded-md hover:bg-blue-100 hover:text-black transition" onClick={onDashboard}><Dashboard/><p>Dashboard</p></button>
                {   
                    authContext.role==="admin"?(
                    <>
                        <button data-testid="customize-button" className="flex flex-row w-[90%] my-1 justify-center py-2 text-white font-bold bg-blue-900 rounded-md hover:bg-blue-100 hover:text-black transition" onClick={onCustomize}><TuneIcon/><p>Customize</p></button>
                        <button data-testid="signupRequest-button" className="flex flex-row w-[90%] my-1 justify-center py-2 text-white font-bold bg-blue-900 rounded-md hover:bg-blue-100 hover:text-black transition" onClick={onSignUpRequest}><Grading></Grading><p className=""> SignUp Requests</p></button>
                        {   
                            process.env.NODE_ENV==="development" ?
                            <button data-testid="Delete-button" className="flex flex-row w-[90%] my-1 justify-center py-2 text-white font-bold bg-blue-900 rounded-md hover:bg-blue-100 hover:text-black transition" onClick={onDeleteEvents}><Delete/> <p className=""> Delete All Events</p></button>
                            :<></>
                        }
                    </>
                    ):<></>
                }
                <button data-testid="logout-button" className="flex flex-row my-1 justify-start w-[90%] my-1 justify-center py-2 text-white font-bold bg-blue-900 rounded-md hover:bg-blue-100 hover:text-black transition" onClick={onLogout}><LogoutIcon className="mx-1"/><p className="mx-1">LogOut</p></button>                 
            </div>
            ):
            <div className="flex flex-col items-center w-[50px] min-h-screen pt-5 bg-white">                    
                <div className="flex flex-row pb-2 justify-center text-center">
                    <button data-testid="sidebar-button" type="button" onClick={()=>setSideBar(!isSidebar)} className="mx-2"><MenuIcon fontSize="large" className="text-black p-1  rounded hover:bg-blue-900 hover:text-white transition"/></button>
                </div> 
                <button data-testid="dashboard-button" className="flex flex-row justify-center  text-black my-1 py-2 rounded  hover:bg-blue-900 hover:text-white transition" onClick={onDashboard}><Dashboard className="mx-1" /></button>
                        
                {   
                    authContext.role==="admin"?(
                    <>
                        <button data-testid="customize-button"  className="flex flex-row justify-center  text-black my-1 py-2 rounded  hover:bg-blue-900 hover:text-white transition" onClick={onCustomize}><TuneIcon className="mx-1" /></button>
                        <button data-testid="signupRequest-button" className="flex flex-row justify-center  text-black my-1 py-2 rounded  hover:bg-blue-900 hover:text-white transition" onClick={onSignUpRequest}><Grading className="mx-1"/></button>
                        {   
                            process.env.NODE_ENV==="development" ?
                            <button data-testid="Delete-button" className="flex flex-row justify-center  text-black my-1 py-2 rounded  hover:bg-blue-900 hover:text-white transition" onClick={onDeleteEvents}><Delete className="mx-1"/></button>
                            :<></>
                        }
                        
                    </>
                    ):<></>
                }
                <button data-testid="logout-button" className="flex flex-row justify-center text-black my-1 py-2 rounded hover:bg-blue-900 hover:text-white transition" onClick={onLogout}><LogoutIcon className="mx-1"/></button>                 
            </div>
            }
          
        </div>
    )
}