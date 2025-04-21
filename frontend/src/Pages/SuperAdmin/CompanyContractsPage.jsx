import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext";
import { SASideBar } from "./SASideBar";
import axios from "axios";
import { Header } from "../../components/Header";
import { CircularProgress } from "@mui/material";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;


export default function Contracts(){

    const [compDetails, setCompanies] = useState([]);
    const [compMode, setMode] = useState([]);
    const [loading, setLoading] = useState(false);

    const authContext = useAuth();

    useEffect(()=>{
        fetchCompanies();
        // Disabled warning about missing dependency since 
    // this code is designed to use a single dependency
    // eslint-disable-next-line 
    },[])


    useEffect(()=>{
        console.log("State update due to setMode")
    },[compMode])


    const fetchCompanies = async ()=>{
        try {
            const response = await axios.get(`${API_URL}/superAdmin/fetchCompanies`,{withCredentials:true})
            console.log("Fetch Companies response: ", response.data)
            if(response.status===200){
                setCompanies(response.data)
                authContext.setIsAuthenticated(true);
            }else{
                console.log("Failed to fetch companies")
            }
        } catch (error) {
            console.log("Failed to fetch companies: ", error)
            if(error.response!==undefined){
                if(error.response.status===401 || error.response.status===403){
                    localStorage.removeItem("Authenticated");
                    authContext.setIsAuthenticated(false);
                    alert("Session Expired. Please login again!");
                    window.location.href="/SASignIn"
                }else{
                    alert("An error occured at backend server. Please try to login back again or Please contact support team!")
                }
            }else{
                alert("An error occured at backend server. Please try to login back again or Please contact support team!")
            }
            
        }
    }

    const onModeChange= (company,changedMode )=>{
// Dont use event.preventDefault() on radio buttons. It prevents its default behaviour
        setMode((prevModes)=>
           { const existingCompanyIndex = prevModes.findIndex((element)=>element.company === company);
            if(existingCompanyIndex!==-1){
                const updatedCompMode = [...prevModes];
                updatedCompMode[existingCompanyIndex].mode=changedMode;
                return updatedCompMode;
            }else{
               return [...prevModes,{company: company, mode: changedMode}]
            } 
        })
       
    }

    const onSave = async(event)=>{
        event.preventDefault();
        try {
            if(compMode.length===0) {alert("Please make changes in the mode and then click on Save!");  return }
            compMode.map((element)=>{
                console.log("Company: ", element.company,", Mode: ",element.mode)
            })
            setLoading(true);
            const response = await axios.post(`${API_URL}/superAdmin/modeChange`,[...compMode], {withCredentials:true})
            console.log("Fetch Companies response: ", response.data)
            setLoading(false);
            if(response.status===200){
                setCompanies(response.data)
            }else{
                console.log("Failed to fetch companies")
            }
        } catch (error) {
            setLoading(false);
            console.log("Failed to fetch companies: ", error)
            if(error.response!==undefined){
                if(error.response.status===401 || error.response.status===403){
                    localStorage.removeItem("Authenticated");
                    authContext.setIsAuthenticated(false);
                    alert("Session Expired. Please login again!");
                    window.location.href="/SASignIn"
                }else{
                    alert("An error occured at backend server. Please try to login back again or Please contact support team!")
                }

            }else{
                alert("An error occured at backend server. Please try to login back again or Please contact support team!")
            }
            
        }
    }

    return (
        
        <div className=" min-h-screen">            
            {/* Heading Div*/}
            <Header heading="Company Contracts"/>
            {/* Body Section */}
            <div className="flex flex-row bg-blue-200">
                {/* SideBar div */}
                    <div className="flex flex-row justify-start">
                        <SASideBar/>
                    </div>                     
                    {/* Main Content Section */}
                    <div className="flex flex-col justify-start items-center mt-10 px-1 w-full md:px-0 md:min-w-[95%] text-xs md:text-base overflow-auto   ">
                            <div className="w-full md:w-1/2 p-1 bg-white rounded-lg">
                                {
                                    compDetails.length===0
                                    ?<h2 className="text-center font-bold">No companies to display</h2>
                                    :
                                    <table className="w-full font-sans ">
                                    <thead>
                                        <tr>
                                            <th className="rounded-l-lg bg-blue-100 ">
                                                <span className="flex flex-row justify-center items-center text-left px-1 my-[10px] ">Index
                                                </span>
                                            </th>
                                            <th className="bg-blue-100 ">
                                                <span className="flex flex-row justify-center items-center text-left px-1 my-[10px] ">Company
                                                </span>
                                            </th>
                                            <th className="bg-blue-100 ">
                                                <span className="flex flex-row justify-center items-center text-left px-1 my-[10px] ">Existing Mode
                                                </span>
                                            </th>
                                            <th className="rounded-r-lg bg-blue-100 ">
                                                <span className="flex flex-row justify-center items-center text-left px-1 my-[10px] ">Change Mode
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            compDetails.map((element,index)=>{
                                                let selectedMode = compMode.find((item)=>item.company === element.company)
                                                if(!selectedMode){
                                                    selectedMode = element;
                                                }
                                                
                                                return(
                                                    <tr key={element.company} className="w-full">
                                                        <td><span className="flex justify-center my-[10px]">{index+1}</span></td>
                                                        <td><span className="flex justify-center my-[10px]">{element.company}</span></td>
                                                        <td><span className="flex justify-center my-[10px]">{element.mode?"Enabled":"Disabled"}</span></td>
                                                        <td><span className="flex justify-center my-[10px]">
                                                            { console.log("Company: ", selectedMode.company, ", mode: ",selectedMode.mode)}
                                                            <label className="px-2"><input type="radio" name={`mode-${element.company}`} value="enable" checked={selectedMode.mode==true}  onChange={()=>{onModeChange(element.company,true)}}/>Enable</label>
                                                            <label className="px-2"><input type="radio" name={`mode-${element.company}`} value="disable" checked={selectedMode.mode==false} onChange={()=>{onModeChange(element.company,false)}}/>Disable</label>
                                                        </span></td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                    </table>
                                }
                            
                            </div>
                            <button type="submit" onClick={onSave} className="m-5 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition" >Save Mode</button>
                    </div>
            </div>
            {loading && (
                <div className=" fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
                    <div className="flex flex-col items-center">
                        <CircularProgress/>
                        <p className="text-white mt-2">Loading...</p>
                    </div>
                </div>
            )}        
        </div>
    )
}