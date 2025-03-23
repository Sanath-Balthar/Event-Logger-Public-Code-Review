import {Box, FormControl, MenuItem, Select } from "@mui/material";
import { useAuth } from "../context/AuthContext";
// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import kalmaneTechImg from "../assets/kalmanetech_Logo.png"
import { useEffect } from "react";
// import axios from "axios";

// const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function SignUpPage(){
    const authContext = useAuth();
    const navigate = useNavigate();

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



    async function onSignUpHandler(event){
        console.log("Reached SignUP");
        event.preventDefault();
        authContext.signUp();
    }

    function onBack(event){
        event.preventDefault();
        navigate("/");
    }

    return(       
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 ">
        {/* Heading Div*/}
             <img src={kalmaneTechImg} alt="Logo" className="h-[50px] bg-blue-100 mb-5"/>
             <div className="flex-row min-w-[500px] min-h-[500px] m-5 items-center justify-center shadow-xl rounded-xl bg-white">
                <div className="flex w-full h-[100px] justify-center items-center bg-blue-800 text-white rounded-t-xl">
                    <h1 className=' text-xl font-bold text-center'>Sign Up to Event Logger Dashboard</h1>
                </div> 

                {/* <div className="flex flex-col pt-[10px] justify-center items-center">
                    <input type="text" placeholder="Search companies" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md"
                        onChange={onSearchHandler}/>
                    {searchResults.length > 0 && (
                        <ul className="list-none">
                        {searchResults.map((company,index) => (
                            <li key={index} onClick={(e)=>authContext.setCompany(company.company_name)}>{company.company_name}</li>
                        ))}
                        </ul>
                    )}
                    
                    {
                        showAddComp?
                        (<>
                            <input type="text" placeholder="Company Name" name="New Company" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>authContext.setCompany(e.target.value)} required></input>
                            <button type="button" onClick={onAddCompanyHandler} className=" w-[100px] text-white my-3 p-2  rounded bg-blue-600 hover:bg-blue-900 transition">Submit</button>
                        </>
                        )
                        :<button type="submit" onClick={()=>setShowAddComp(true)} className="w-[50%] h-[40px] mx-[5px] my-[20px] px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition">Add New Company</button>
                    }
                </div> */}

                <form className="flex flex-col pt-[20px] justify-center items-center"  onSubmit={onSignUpHandler}>
                    <input type="text" placeholder="Company Name" name="CompanyName" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>authContext.setCompany(e.target.value)} required></input>
                    <input type="text" placeholder="Email" name="Email" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>authContext.setEmail(e.target.value)} required></input>
                    <input type="text" placeholder="Username" name="Username" className="text-center m-3 border-2 border-gray-400 focus:border-black rounded-md " onChange={(e)=>authContext.setUsername(e.target.value)} required></input>
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
                    <button type="submit" className=" w-[100px] text-white my-3 p-2  rounded bg-blue-600 hover:bg-blue-900 transition"> Sign Up</button>
                    <button type="submit" onClick={onBack} className=" w-[120px] text-white my-1 mb-5 p-2 rounded bg-blue-600 hover:bg-blue-900 transition"> Back to Login</button>
                </form>
             </div>

    </div>   

    )
}