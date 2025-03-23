import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useEventContext} from "../context/eventListContext";
// import { ArrowDropDown } from "@mui/icons-material";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { SideBar } from "./SideBar";
import { Header } from "./Header";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function Customize(){

    // const navigate = useNavigate();

    const eveContext = useEventContext();
    const authContext = useAuth();

    const [addKey, setaddKey] =  useState({keyword:"", category:""});
    const [widCat, setWidCat] = useState();
    const [widPriority, setWidPriority] = useState();
    const [editCat, setEditCat] = useState();

    let updatedKeyArr = [];
    // let updatedEventList = [];


    useEffect(()=>{
        // send get request every 10 minutes to backend to fetch keywords,Categories
        fetchKeywords();
        fetchCategories()
        // const interval = setInterval(()=>{
        //     fetchKeywords();
        //     fetchCategories()

        // },900000)
        
        // return () => clearInterval(interval);
    
            // Disabled warning about missing dependency since 
    // this code is designed to use a single dependency
    // eslint-disable-next-line 
    },[])


    useEffect(()=>{

        if(editCat){
            
            // This hook will store those keywords whose category property has been changed into updatedKeyArr array.
            // All the elements inside the updatedKeyArr must be updated in the mongoDB when "save button" is clicked. This has been updated in the onSave function below

            updatedKeyArr = eveContext.eventKeywords.map((element)=>{
                if(element.keyword===editCat.keyword){
                    return {keyword: element.keyword, category: editCat.category}
                }else{
                    return element
                }
            })

            eveContext.setKeyword(updatedKeyArr);

            // console.log("Updated key array: "+updatedKeyArr);


            // The below will change the category property of all events as set by user and store the eventList into updatedEventList array.  
            // All the elements inside the updatedEventList must be updated in the mongoDB when "save button" is clicked. This has been updated in the onSave function below
            // updatedEventList = eveContext.eventList.map((element)=>{
            //     if(element.eventName===editCat.keyword){
            //         let updatedEvent = {eventName: element.eventName, eventDate: element.eventDate, category: editCat.category}
            //         return updatedEvent
            //     }else{
            //         return element
            //     }
            // })
        }    

    },[editCat])


    async function fetchKeywords() {

        console.log("Reached fetch keywords")
        axios.get(`${API_URL}/event/getKeyWords`,{withCredentials:true})
        .then((response)=>{ 
            console.log("getKeyWords response: ",response.data);
            eveContext.setKeyword(response.data);})
        .catch((err)=>{
            
            const errData = err.response.data.error;
            console.log("Error in fetchKeywords: ",errData)
            
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
        axios.get(`${API_URL}/event/getCategories`,{withCredentials:true})
        .then((response)=>{ 
            console.log("getCategories response: ", response.data); 
            authContext.setRole(response.data.role);
            eveContext.setCategories(response.data.categories);
            authContext.setIsAuthenticated(true);
            
        })
        .catch((err)=>{
            
            const errData = err.response.data.error;
            console.log("Error in fetchCategories: "+errData)
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

   

    // useEffect(()=>{
    //     eveContext.eventKeywords.map((element)=>{
    //         // console.log("Received keyword list: "+element.keyword)
    //     })
        
    // },[eveContext.eventKeywords])


    function onSave(event){
        event.preventDefault();          
    //    send post request to save the data
        console.log("Reached onSave")
        axios.post(`${API_URL}/event/save`,{keywords: eveContext.eventKeywords},{withCredentials:true})
        .then((response)=>{ 
            console.log("Save response: ",response.data)})
        .catch((err)=>{
           
            const errData = err.response.data.error;
            console.log("Error in onSave: "+errData)
            
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
        
    
    function addKeyword(event){
        event.preventDefault();   
        console.log("Reached addKeyword")
        const kwtoAdd = [{keyword: addKey.keyword, category:addKey.category}]
        axios.post(`${API_URL}/event/addKeywords`,kwtoAdd,{withCredentials:true})
        .then((response)=>{ 
            console.log("Add Keyword response: ",response.data)
            if(response.data) eveContext.setKeyword(response.data);})
        .catch((err)=>{
            
            const errData = err.response.data.error;
            console.log("Error in addKeyword: "+errData)
            
            if(errData=="Invalid token"){
                alert("Session Expired! Please login again")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }else if(errData=="Unauthorized"){
                alert("Forbidden, insufficient permissions!")
                window.location.href="/dashboard"
            }
        })   
    }

    function submitCategory(event){
        event.preventDefault();

        // console.log("temp category: "+widCat)
        // console.log("temp priority: "+widPriority)

        console.log("Reached submitCategory")
        axios.post(`${API_URL}/event/addCategory`,{name:widCat, priority:widPriority},{withCredentials:true})
        .then((response)=>{ 
            console.log("addCategory Response: ",response.data); 
            if(response.data) eveContext.setCategories(response.data);
        })
        .catch((err)=>{
            
            const errData = err.response.data.error;
            console.log("Error in submitCategory: "+errData)
            
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

        // eveContext.setCategories((prev)=>([...prev, {name:widCat, priority:widPriority}]))
        // eveContext.categories.map((element)=> console.log("Category: "+element.name+"\n Priority: "+ (element.priority)))
    }

    function onDeleteKW(event,delItem){
        event.preventDefault();
        // setDelKW(delItem);
        // let updatedKWList = eveContext.eventKeywords.map((element)=>element.keyword===delItem.keyword?"":element).filter((element)=>element!=="")
        // eveContext.setKeyword(updatedKWList)

        console.log("Reached onDeleteKW")
        axios.post(`${API_URL}/event/deleteKeyword`,delItem,{withCredentials:true})
        .then((response)=>{ 
            console.log("delete response: ",response.data); 
            if(response.data) eveContext.setKeyword(response.data);
        })
        .catch((err)=>{
            
            const errData = err.response.data.error;
            console.log("Error in onDeleteKW: "+errData)
            
            if(errData=="Invalid token"){
                alert("Session Expired! Please login again")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }else if(errData=="Unauthorized"){
                alert("Forbidden, insufficient permissions!")
                window.location.href="/dashboard"
            }
        })   
    }

    function onDeleteCat(event,delCatItem){
        event.preventDefault();

        console.log("Reached onDeleteCat")
        axios.post(`${API_URL}/event/deleteCategory`,delCatItem,{withCredentials:true})
        .then((response)=>{ 
            console.log("DeleteCat response: ",response.data);
            if(response.data) eveContext.setCategories(response.data);
        })
        .catch((err)=>{
            
            const errData = err.response.data.error;
            console.log("Error in onDeleteCat: "+errData)
            
            if(errData=="Invalid token"){
                alert("Session Expired! Please login again")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }else if(errData=="Unauthorized"){
                alert("Forbidden, insufficient permissions!")
                window.location.href="/dashboard"
            }
        }) 
    }

    return(
        <div className="bg-blue-200 min-h-screen"> 
            {/* Heading Div*/}
            {/* <div className="flex h-[100px] justify-center items-center bg-blue-800 text-white">
                <h1 className=' text-2xl font-bold'>Customization Page</h1>
            </div>  */}
            <Header heading="Customization Page"/>
            <div className="flex flex-row h-full">
                <div className="flex flex-row justify-start">
                    <SideBar/>
                </div>                
                <div className="flex flex-col w-full h-full justify-center items-center">                
                    <div className="flex flex-row w-full h-full justify-center">
                        <div className="m-5 p-[10px]  bg-white border-collapse rounded-lg">
                            <table className="w-full h-full font-sans ">
                                <thead className="w-full">
                                    <tr className=" w-full h-[40px]">
                                        {/* <th className="text-left px-[10px] py-[5px]">Index</th> */}
                                        <th className=" w-1/2 rounded-l-lg bg-blue-100">Keywords</th>
                                        <th className=" w-1/2 bg-blue-100">Category</th>
                                        <th className="w-1/5 bg-blue-100">Priority</th>
                                        <th className="rounded-r-lg bg-blue-100"></th>
                                    </tr>
                                </thead>
                                <tbody className=" w-full">
                                {/* <tr> */}
                                {
                                    eveContext.eventKeywords.length!==0?(
                                        eveContext.eventKeywords.map((item)=>{
                                            // console.log("Keyword: "+item.keyword)
                                        return(
                                            <tr key={item.keyword}>
                                                {/* <td className="text-left px-[10px] py-[5px]">{item.index}</td> */}
                                                <td className="text-left px-[10px] py-[10px]">{item.keyword}</td>
                                                <td>
                                                    <Box sx={{ minWidth: 120}}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Category</InputLabel>
                                                            <Select value={item.category} label="Category" onChange={(e)=>{ setEditCat({keyword: item.keyword, category: e.target.value}) }} >
                                                            {
                                                                eveContext.categories.map((category)=>{
                                                                    return(
                                                                <MenuItem key={category.name} value={category.name}>
                                                                    {category.name}
                                                                </MenuItem>
                                                                )})
                                                            }
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                </td>
                                                <td className="text-center px-[10px] py-[5px]">
                                                    {
                                                        eveContext.categories.map((category)=>{
                                                            if(item.category=== category.name){
                                                                return category.priority;
                                                            }
                                                        })
                                                    }
                                                </td>
                                                <td><button data-testid="deleteKW-button" className="flex items-center px-2 hover:bg-blue-900 hover:text-white rounded transition" ><span onClick={(e)=>{onDeleteKW(e, item)}}><DeleteIcon/></span></button></td>
                                            </tr>
                                        )
                                    })
                                )
                                    : <></>
                                }
                            </tbody>
                            </table>
                        </div>
                        <button type="submit" className="m-5 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={onSave}>Save</button>
                    </div>
                    <div className="flex justify-center">
                        <form onSubmit={addKeyword} className="flex flex-col">
                                <div className="flex flex-row h-[50px]">
                                    <input type="text" placeholder="Keyword" required onChange={(e)=>setaddKey({keyword: e.target.value, category: ""})} className="mx-2 text-center border rounded-lg"></input>
                                    <Box sx={{ minWidth: 120}}>
                                        <FormControl fullWidth>
                                            <InputLabel>Category</InputLabel>
                                            <Select data-testid="Category-Select" value={addKey.category} onChange={(e)=>{ setaddKey({keyword: addKey.keyword, category: e.target.value}) }} >
                                                {
                                                    eveContext.categories.map((category)=>{
                                                        return(
                                                    <MenuItem key={category.name} value={category.name}>
                                                        {category.name}
                                                    </MenuItem>
                                                    )})
                                                }
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </div>
                                <button type="submit" className="m-5 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Add Keyword</button>
                        </form>
                    </div>
                    <div className="flex justify-center border-collapse p-[10px] rounded-lg bg-white">
                        <table className="w-1/2 font-sans">
                        <thead className="w-full">
                            <tr className=" w-full">
                                {/* <th className="text-left px-[10px] py-[5px]">Index</th> */}
                                <th className="p-[10px] rounded-l-lg bg-blue-100">Category</th>
                                <th className="p-[10px]  bg-blue-100">Priority</th>
                                <th className="p-[10px]  rounded-r-lg bg-blue-100"></th>
                                {/* <th className="text-left px-[10px] py-[5px]">Category</th>
                                <th className="text-left px-[10px] py-[5px]">Priority</th> */}
                            </tr>
                        </thead>
                        <tbody className=" w-full">
                            {/* <tr> */}
                            {
                                eveContext.categories.length!==0?(
                                    eveContext.categories.map((arrEvent,index)=>{
                                    return(
                                        <tr key={index}>
                                            {/* <td className="text-left px-[10px] py-[5px]">{index+1}</td> */}
                                        {
                                            // arrEvent.map((element,index)=>{
                                                // return(
                                                <>
                                                    <td className="text-left px-[10px] py-[5px]" >{arrEvent.name}</td>
                                                    <td className="text-center px-[10px] py-[5px]" >{arrEvent.priority}</td>
                                                    {/* {arrEvent.name!=="High" && arrEvent.name!=="Moderate" && arrEvent.name!=="Low"? */}
                                                    <td><button data-testid="deleteCat-button" className="flex items-center px-2 hover:bg-blue-900 hover:text-white rounded transition" ><span onClick={(e)=>{onDeleteCat(e, arrEvent)}}><DeleteIcon/></span></button></td>
                                                    {/* :<></> */}
                                                    
                                                </>
                                                // )
                                            // })
                                        }
                                    </tr>
                                    )
                                })
                            )
                                : <></>
                            }
                            {/* </tr> */}
                        </tbody>
                        </table>
                
                    </div>
                    <div className="flex justify-center">
                        <form onSubmit={submitCategory} >
                                <input type="text" required placeholder="Category Name" onChange={(e)=>setWidCat(e.target.value)} className="mx-2 h-[30px] text-center border rounded-lg"></input>
                                <input type="number" required placeholder="Priority Number" onChange={(e)=>setWidPriority(Number(e.target.value))} className="mx-2 h-[30px] text-center border rounded-lg"></input>
                                <button type="submit" className="m-5 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Add Category-Widget</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

