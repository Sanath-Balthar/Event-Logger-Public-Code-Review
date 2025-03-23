// import { useNavigate } from "react-router-dom";
import { useEventContext } from "../context/eventListContext";
import ListEvents from "./ListEvents";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { SideBar } from "./SideBar";
import { Header } from "./Header";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function WidgetEvents(){

    // const navigate = useNavigate();
    const eveContext = useEventContext();
    const authContext = useAuth();
    // const selectedWidget =  eveContext.selWidget;

    const selectedWidget = localStorage.getItem("Widget");
    let allEvents = eveContext.eventList;
    let selWidgetEvents;

    
    useEffect(()=>{
        fetchAllEvents();
        // Disabled warning about missing dependency since 
    // this code is designed to use a single dependency
    // eslint-disable-next-line 
    },[])
    


    async function fetchAllEvents() {

        console.log("Reached fetch All Events")
        axios.get(`${API_URL}/event/getAllEvents`,{withCredentials:true})
        .then((response)=>{ 
            console.log("response: "+response.data); 
            authContext.setRole(response.data.role)
            if(response.data.allEvents){
                eveContext.setList(response.data.allEvents);
                
            } })
        .catch((err)=>{
            
            const errData = err.response.data.error;
            console.log("Error in fetchAllEvents: "+errData)
            
            if(errData=="Invalid token"){
                authContext.setIsAuthenticated(false);
                alert("Session Expired! Please login again")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }else if(errData=="Unauthorized"){
                authContext.setIsAuthenticated(false);
                alert("Forbidden, insufficient permissions!")
                window.location.href="/dashboard"
            }
            
        })         
    }


    // To check which Widget was clicked and display events accordingly
    
    
    if(selectedWidget==="All Events" ){
        selWidgetEvents = allEvents;
    }else{
        selWidgetEvents= allEvents.filter((element)=>{
            // console.log("Filter Element category: "+element.category+" Selected Widget category: "+selectedWidget)
            return element.category===selectedWidget
        })
    }
        

    // selWidgetEvents.map((element)=>console.log("Widget Events:"+element.eventName ))
    

    return(
        <div className="bg-blue-200 w-full min-h-screen">
            {/* Heading Div*/}
            <Header heading={`Events generated with ${selectedWidget} category`}/>

            {/* <button type="submit" className="m-5 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={onBack}>Back</button> */}

            <div className="flex flex-row w-full justify-start">
                 <div>
                    <SideBar/>
                </div> 
                <div className="flex flex-row w-full justify-center items-center">
                    <div className="flex-row w-1/2  h-full justify-center items-center">
                        <ListEvents eventList= {selWidgetEvents} isDashboard={false}/>
                    </div>
                </div>
            </div>

        </div>
    )

}