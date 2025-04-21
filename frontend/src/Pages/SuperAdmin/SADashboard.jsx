// import React from "react"
// import { useAuth } from "../../context/AuthContext";
import { Header } from "../../components/Header";
import { SASideBar } from "./SASideBar";
import { SASignUpRequests } from "./SASignUpRequests";

// const API_URL = import.meta.env.VITE_BACKEND_API_URL;


export default function SADashboard(){

    // const authContext = useAuth();

    // let navigate = useNavigate();

    


    return (

        
        <div className=" min-h-screen">
            
            {/* Heading Div*/}
            <Header heading="KalmaneTech Logo"/>
            {/* Body Section */}
            <div className="flex flex-row bg-blue-200">
                    <SASideBar/>                    
                    {/* Main Content Section */}
                    <div className="flex-col w-full">
                        <div>
                            <h2 className="mx-[60px] my-[10px] p-[10px] rounded-lg font-bold text-sm md:text-xl text-center text-blue-900 bg-white ">SuperAdmin Dashboard</h2>
                        </div>
                        <div className="flex flex-row w-full md:px-10">
                            {/* New company admin request Section */}
                            <div className="w-[100%] p-3 md:p-5">
                                <SASignUpRequests/>
                            </div>
                            {/* Contracts Section */}
                            {/* <div className="flex-row w-[40%] h-1/2">
                                <div>
                                    Company Contracts that are expiring..
                                </div>
                            </div> */}
                        </div>
                    </div>
            </div>        
        </div>
    )
}