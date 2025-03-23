import { Check, Clear } from "@mui/icons-material"
import axios from "axios";
import { useEffect, useState } from "react";
import { Header } from "./Header";
// import { useNavigate } from "react-router-dom";
import { SideBar } from "./SideBar";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const SignUpRequests=()=>{

    // API to go to user credentials collection in DB and fetch documents which have "approved" field as false.
    // Those user names which are not approved should be listed in a table and given an approve/reject button next to them.
    // Approve/Reject button will change the "approve" field in the DB.

    const [requests, setRequests]= useState([]);
    const authContext = useAuth();
    
    useEffect(()=>{
        const fetchSuRequest = async()=>{

            axios.get(`${API_URL}/auth/fetchSignUpRequest`,{withCredentials:true})
        .then((result)=>{
            console.log("result : ", result)
            let reqs = result.data.requests;
            console.log("Logged In User role: ", result.data.role);
            authContext.setRole(result.data.role)
            authContext.setIsAuthenticated(true);
            if(reqs.length!==0){
                reqs.map((element)=>{
                    console.log("Sign Up requests: ", element.username, " : ", element.role )
                })
                setRequests(reqs);
            }
            
        })
        .catch((error)=>{
            console.log("Error in Signup request: ", error)
            if(error.response.data.error=="Invalid token"){
                authContext.setIsAuthenticated(false);
                alert("Session Expired! Please login again")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }else if(error.response.data.error=="Unauthorized"){
                authContext.setIsAuthenticated(false);
                alert("Forbidden, insufficient permissions!")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }
        })
        }

        fetchSuRequest();
    // Disabled warning about missing dependency since 
    // this code is designed to use a single dependency
    // eslint-disable-next-line 
    },[])


    async function onApprove(event,username,status) {
        event.preventDefault();
        axios.post(`${API_URL}/auth/setSignUpRequest`,{username: username, apprStatus: status},{withCredentials:true})
        .then((result)=>{
            if(result.data === false){ 
                alert("Failed to update! Please contact administrator!")
                return;
            } 
            console.log("result : ", result)
            let reqs = result.data
            reqs.map((element)=>{
                console.log("Sign Up requests: ", element.username, " : ", element.role )
            })
            setRequests(reqs);
        })
        .catch((error)=>{
            console.log("Error in Signup request: ", error)
        })

    }

    


    return(
        <div className="flex flex-col w-full min-h-screen">
             {/* Heading Div*/}
            <Header heading="Sign Up Requests Approval Page"/>     


            <div className="flex flex-row h-full bg-blue-200">

                {/* SideBar div */}
                <div className="flex flex-row justify-start">
                    <SideBar/>
                </div>  

                {/* Requests table div */}
                <div className="flex justify-center items-start mt-10 min-w-[95%] overflow-auto   ">
                    <div className="w-1/3 p-1 bg-white rounded-lg">
                        {
                            requests.length===0
                            ?<h2 className="text-center font-bold">No Sign Up Requests to be approved</h2>
                            :
                            <table className="w-full font-sans  ">
                            <thead>
                                <tr>
                                    <th className="rounded-l-lg bg-blue-100 ">
                                        <span className="flex flex-row justify-center items-center text-left my-[10px] ">Index
                                        </span>
                                    </th>
                                    <th className="bg-blue-100 ">
                                        <span className="flex flex-row justify-center items-center text-left my-[10px] ">Requests
                                        </span>
                                    </th>
                                    <th className="bg-blue-100 ">
                                        <span className="flex flex-row justify-center items-center text-left my-[10px] ">Role
                                        </span>
                                    </th>
                                    <th className="rounded-r-lg bg-blue-100 ">
                                        <span className="flex flex-row justify-center items-center text-left my-[10px] ">Accept/Reject
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            {console.log("Request: ", requests)}
                                {
                                    requests.length===0?<></>:(requests.map((element,index)=>{
                                        return(
                                            <tr key={element.username} className="w-full">
                                                <td><span className="flex justify-center  my-[10px]">{index+1}</span></td>
                                                <td><span className="flex justify-center  my-[10px]">{element.username}</span></td>
                                                <td><span className="flex justify-center  my-[10px]">{element.role}</span></td>
                                                <td><span className="flex justify-center  my-[10px]">
                                                    <button className="min-w-[10%] h-[40px] mx-[5px]  px-1 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={(e)=>{onApprove(e, element.username,true)}} ><Check ></Check></button>
                                                    <button className="min-w-[10%] h-[40px] mx-[5px] px-1 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition" onClick={(e)=>{onApprove(e, element.username,false)}}><Clear></Clear></button></span></td>
                                            </tr>
                                        )
                                    }))
                                }
                            </tbody>
                            </table>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}