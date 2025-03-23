import { useEffect } from "react"
import ListEvents from "./ListEvents";
import Widgets from "./Widgets";
import { useEventContext } from "../context/eventListContext";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { SideBar } from "./SideBar";
// import { colors } from "@mui/material";
// import { WidthFull } from "@mui/icons-material";
import { Header } from "./Header";

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
            const errData = err.response.data.error;
            console.log("Error in getRecentEvents: ",errData)
            authContext.setIsAuthenticated(false);
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

    async function fetchCategories() {

        console.log("Reached fetchCategories")
       await axios.get(`${API_URL}/event/getCategories`,{withCredentials:true})
        .then((response)=>{ 
            console.log("Category response: ",response.data); 
            eveContext.setCategories(response.data.categories);})
        .catch((err)=>{
            const errData = err.response.data.error;
            console.log("Error in fetchCategories: ",errData)
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
                            <h2 className="mx-[60px] my-[10px] p-[10px] rounded-lg font-bold text-xl text-center text-blue-900 bg-white ">Security Events Dashboard</h2>
                        </div>
                        <div className="flex flex-row w-full px-10">
                            {/* Event List Section */}
                            <div className="w-[60%] p-5">
                            {
                                // eveContext.recentEvents.map((element)=>{
                                //     console.log("Recent Events in Dashboard useEffect: "+ element.eventName);
                                // })
                        
                            }
                                <ListEvents eventList= {eveContext.recentEvents} isDashboard={true}/>
                            </div>
                            {/* Widgets Section */}
                            <div className="flex-row w-[40%] h-1/2">
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