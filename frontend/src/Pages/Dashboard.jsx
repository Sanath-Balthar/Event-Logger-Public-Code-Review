import { useEffect } from "react"
import ListEvents from "../components/ListEvents";
import Widgets from "../components/Widgets";
import { useEventContext } from "../context/eventListContext";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { SideBar } from "../components/SideBar";
// import { colors } from "@mui/material";
// import { WidthFull } from "@mui/icons-material";
import { Header } from "../components/Header";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;


export default function Dashboard(){

    const eveContext =  useEventContext() ;
    const authContext = useAuth();

    useEffect(()=>{
 
        fetchRecentEvents();
        fetchCategories();
        // send get request every 15 minutes to backend to fetch recent events.
        // const interval = setInterval(fetchRecentEvents,900000)
        
        // return () => clearInterval(interval);

        // Disabled warning about missing dependency since 
    // this code is designed to use a single dependency
    // eslint-disable-next-line 
    },[])



 

    async function fetchRecentEvents() {

        console.log("Reached fetch Recent Events")
       await axios.get(`${API_URL}/event/getRecentEvents`,{withCredentials:true})
        .then((response)=>{ 
            console.log("response: ",response.data);
            authContext.setRole(response.data.role)
            authContext.setCompany(response.data.company);
            authContext.setIsAuthenticated(true);
            if(!response.data.recentEvents) return;
            eveContext.setREvents(response.data.recentEvents);
            
        })
            
        .catch((err)=>{
            if (err.response!==undefined) {
                const errData = err.response.data.error;
                console.log("Error in fetchRecentEvents: "+errData)
                if(errData=="Invalid token"){
                    alert("Session Expired! Please login again")
                    localStorage.removeItem("Authenticated");
                    window.location.href="/"
                }else if(errData=="Unauthorized"){
                    alert("Forbidden, insufficient permissions!")
                    localStorage.removeItem("Authenticated");
                    window.location.href="/dashboard"
                }
                else{
                    alert("Issue at the backend server. Try again after logging out and logging in again or please contact support team")
                }
            }else{
                console.log("Error in fetchRecentEvents: "+err)   
                alert("Issue at the backend server. Try again after logging out and logging in again or please contact support team")
            }
        })         
    }

    async function fetchCategories() {

        console.log("Reached fetchCategories")
       await axios.get(`${API_URL}/event/getCategories`,{withCredentials:true})
        .then((response)=>{ 
            console.log("Category response: ",response.data); 
            eveContext.setCategories(response.data.categories);})
        .catch((err)=>{
            if (err.response!==undefined) {
                const errData = err.response.data.error;
                console.log("Error in fetchRecentEvents: "+errData)
                if(errData=="Invalid token"){
                    alert("Session Expired! Please login again")
                    localStorage.removeItem("Authenticated");
                    window.location.href="/"
                }else if(errData=="Unauthorized"){
                    alert("Forbidden, insufficient permissions!")
                    localStorage.removeItem("Authenticated");
                    window.location.href="/dashboard"
                }
                else{
                    alert("Issue at the backend server. Try again after logging out and logging in again or please contact support team")
                }
            }else{
                console.log("Error in fetchRecentEvents: "+err)   
                alert("Issue at the backend server. Try again after logging out and logging in again or please contact support team")
            }
        })         
    }

    // useEffect(()=>{

    //     eveContext.recentEvents.map((element)=>{
    //         console.log("Recent Events in Dashboard useEffect: "+ element.eventName);
    //     })
    // },[eveContext.recentEvents])

   
    


    return (

        
        <div className=" min-h-screen">
            
            {/* Heading Div*/}
            <Header heading={authContext.company}/>
            {/* Body Section */}
            <div className="flex flex-row bg-blue-200">
                    <SideBar/>                    
                    {/* Main Content Section */}
                    <div className="flex-col w-full">
                        <div>
                            <h2 className="ml-[40px] mx-[40px] my-[4px] p-[2px] lg:mx-[60px] lg:my-[10px] lg:p-[10px] rounded-lg font-bold text-sm lg:text-xl text-center text-blue-900 bg-white ">Security Events Dashboard</h2>
                        </div>
                        <div className="flex flex-col lg:flex lg:flex-row w-full px-2 lg:px-10">
                            {/* Event List Section */}
                            <div className="w-[100%] p-1 lg:w-[60%] lg:p-5">
                            {
                                // eveContext.recentEvents.map((element)=>{
                                //     console.log("Recent Events in Dashboard useEffect: "+ element.eventName);
                                // })
                        
                            }
                                <ListEvents eventList= {eveContext.recentEvents} isDashboard={true}/>
                            </div>
                            {/* Widgets Section */}
                            <div className="flex-row lg:w-[40%] lg:h-1/2">
                                <div>
                                    <Widgets/>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>        
        </div>
    )
}