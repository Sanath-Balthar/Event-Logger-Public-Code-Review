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
import { SideBar } from "../components/SideBar";
import { Header } from "../components/Header";
import { CircularProgress } from "@mui/material";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;
const INVALID_TOKEN_ERROR = "Invalid token";
const UNAUTHORISED_ROLE_ERROR = "Unauthorized";

export default function Customize(){

    // const navigate = useNavigate();

    const eveContext = useEventContext();
    const authContext = useAuth();

    const [addKey, setaddKey] =  useState({keyword:"", category:""});
    const [widCat, setWidCat] = useState();
    const [widPriority, setWidPriority] = useState();
    const [editCat, setEditCat] = useState();
    const [loading, setLoading] = useState(false);

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
        console.log("Reached fetch keywords");
        await axios.get(`${API_URL}/event/getKeyWords`,{withCredentials:true})
        .then((response)=>{ 
            console.log("getKeyWords response: ",response.data);
            eveContext.setKeyword(response.data);
        })
        .catch((err)=>{            
            handleError(err);
        })         
    }

    async function fetchCategories() {
        console.log("Reached fetchCategories")
        await axios.get(`${API_URL}/event/getCategories`,{withCredentials:true})
        .then((response)=>{ 
            console.log("getCategories response: ", response.data); 
            authContext.setRole(response.data.role);
            eveContext.setCategories(response.data.categories);
            authContext.setIsAuthenticated(true);
        })
        .catch((err)=>{
            handleError(err);
        })         
    }

   

    // useEffect(()=>{
    //     eveContext.eventKeywords.map((element)=>{
    //         // console.log("Received keyword list: "+element.keyword)
    //     })
        
    // },[eveContext.eventKeywords])

        function handleError(err) {
        if (err.response !== undefined) {
            const errData = err.response.data.error;
            console.log("Error: " + errData);
            if (errData === INVALID_TOKEN_ERROR) {
                authContext.setIsAuthenticated(false);
                alert("Session Expired! Please login again");
                localStorage.removeItem("Authenticated");
                window.location.href = "/";
            } else if (errData === UNAUTHORISED_ROLE_ERROR) {
                authContext.setIsAuthenticated(false);
                alert("Forbidden, insufficient permissions!");
                localStorage.removeItem("Authenticated");
                window.location.href = "/";
            } else {
                alert("Issue at the backend server. Try again after logging out and logging in again or please contact support team");
            }
        } else {
            console.log("Error: " + err);
            alert("Issue at the backend server. Try again after logging out and logging in again or please contact support team");
        }
    }


// The onSave function sends the updated keywords to the backend server to save changes.
// It handles errors such as invalid tokens or unauthorized access and provides appropriate feedback to the user.
    async function onSave(event) {
        event.preventDefault();
        try {console.log("Reached onSave");
            if(eveContext.eventKeywords.length===0){
                alert("No keywords to save!");
                return;
            }    
            setLoading(true);                    
            const response = await axios.post(`${API_URL}/event/save`,{keywords: eveContext.eventKeywords},{withCredentials:true});
            if(response.status===200){
                alert("Changes saved!");
                console.log("Save response: ", response.data);
            }
        } catch (err) {
            handleError(err);
        } finally{
            setLoading(false);
        }
    }
        
    
    async function addKeyword(event) {
        event.preventDefault();
        setLoading(true);
        console.log("Reached addKeyword");
        const kwtoAdd = [{ keyword: addKey.keyword, category: addKey.category }];
        try {
            const response = await axios.post(`${API_URL}/event/addKeywords`, kwtoAdd, { withCredentials: true });
            console.log("Add Keyword response: ", response.data);
            if ((response.status === 200) && (response.data)) eveContext.setKeyword(response.data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    /**
     * Handles the submission of a new category by sending a POST request to the server.
     * Updates the categories in the context upon a successful response.
     */
    async function submitCategory(event){
        event.preventDefault();
        try {
            setLoading(true);
            console.log("Reached submitCategory");        
            const response = await axios.post(`${API_URL}/event/addCategory`, { name: widCat, priority: widPriority }, { withCredentials: true })
            if((response.status === 200) && (response.data)){
                console.log("addCategory Response: ", response.data);
                eveContext.setCategories(response.data);
            }
        } catch (err) {            
            handleError(err);
        } finally{
            setLoading(false);
        }
        // eveContext.setCategories((prev)=>([...prev, {name:widCat, priority:widPriority}]))
        // eveContext.categories.map((element)=> console.log("Category: "+element.name+"\n Priority: "+ (element.priority)))
    }

    // The onDeleteKW function deletes a keyword from the backend server and updates the local state.
    // It ensures that the keyword list is updated after deletion and handles errors such as invalid tokens or unauthorized access.
    async function onDeleteKW(event, delItem) {
        event.preventDefault();
        try {
            setLoading(true);
            console.log("Reached onDeleteKW");        
            const response = await axios.post(`${API_URL}/event/deleteKeyword`, delItem, { withCredentials: true });
            console.log("delete response: ", response.data);
            if (response.data) eveContext.setKeyword(response.data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    // The onDeleteCat function deletes a category from the backend server and updates the local state.
    // It also ensures that any keywords associated with the deleted category are updated accordingly.
    async function onDeleteCat(event, delCatItem) {
        event.preventDefault();
        try {
            setLoading(true);
            console.log("Reached onDeleteCat");
        
            const changedKWList = eveContext.eventKeywords.map((element) => {
                if (element.category === delCatItem.name) {
                    return { keyword: element.keyword, category: "Unassigned"};
                } else {
                    return element;
                }
            });
        
            const response = await axios.post(`${API_URL}/event/deleteCategory`, delCatItem, { withCredentials: true });
            console.log("DeleteCat response: ", response.data);
            if (response.data) eveContext.setCategories(response.data);

            const saveRes = await axios.post(`${API_URL}/event/save`,{keywords: changedKWList},{withCredentials:true});
            if(saveRes.status===200){
                alert("Changes saved!");
                console.log("Save response: ", saveRes.data);
                eveContext.setKeyword(saveRes.data);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="bg-blue-200 min-h-screen relative"> 
            {/* Heading Div*/}
            {/* <div className="flex h-[100px] justify-center items-center bg-blue-800 text-white">
                <h1 className=' text-2xl font-bold'>Customization Page</h1>
            </div>  */}
            <Header heading="Customization Page"/>


            <div className="flex flex-row h-full text-xs md:text-base">
                <div className="flex flex-row justify-start min-h-screen">
                    <SideBar/>
                </div>        
                {/* Main Content Div */}
                <div className="flex flex-col w-full h-full justify-center items-center">                
                    <div className="flex flex-col md:w-[500px] h-full justify-center">
                        <div className=" mx-3 mt-5 mb-2 p-[5px] md:m-5 md:p-[10px] bg-white border-collapse rounded-lg">
                            <table className="w-full h-full font-sans">
                                <thead className="w-full">
                                    <tr className=" w-full h-[40px]">
                                        {/* <th className="text-left px-[10px] py-[5px]">Index</th> */}
                                        <th className=" w-1/2 rounded-l-lg bg-blue-100">Keywords</th>
                                        <th className=" w-1/2 bg-blue-100">Category</th>
                                        <th className=" w-1/5 bg-blue-100">Priority</th>
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
                                                <td className="text-left md:px-[10px] py-[20px]">{item.keyword}</td>
                                                <td >
                                                    <Box sx={{ width: {"xs": "90px", "sm": "90px", "md": "120px"}, minWidth:{"sm":"120px"}, height:{"xs": "40px", "sm": "40px", "md": "50px"}}}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Category</InputLabel>
                                                            <Select data-testid="Category-Select1" value={item.category} label="Category" onChange={(e)=>{ setEditCat({keyword: item.keyword, category: e.target.value}) }} >
                                                            {
                                                                eveContext.categories.map((category)=>{
                                                                    return(
                                                                <MenuItem data-testid={`Category-Select1-${category.name}`} key={category.name} value={category.name}>
                                                                    <span className="text-xs md:text-base">{category.name}</span>
                                                                </MenuItem>
                                                                )})
                                                            }
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                </td>
                                                <td className="text-center md:px-[10px] py-[20px]">
                                                    {
                                                        eveContext.categories.map((category)=>{
                                                            if(item.category=== category.name){
                                                                return category.priority;
                                                            }
                                                        })
                                                    }
                                                </td>
                                                <td><button data-testid="deleteKW-button" className="flex items-center md:px-2 hover:bg-blue-900 hover:text-white rounded transition" ><span data-testid="deleteKW-span" onClick={(e)=>{onDeleteKW(e, item)}}><DeleteIcon/></span></button></td>
                                            </tr>
                                        )
                                    })
                                )
                                    : <></>
                                }
                            </tbody>
                            </table>
                        </div>
                        <button type="submit" className="mx-20 mb-7 py-[2px] md:mx-40 md:mb-5 md:px-6 md:py-[2px] bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={onSave}>Save</button>
                    </div>

                    {/* Add Keyword Div */}
                    <div className="flex justify-center">
                        <form onSubmit={addKeyword} className="flex flex-col">
                                <div className="md:flex md:flex-row w-[200px] md:w-full md:mt-4 md:h-[50px]">
                                    <input type="text" placeholder="Keyword" required onChange={(e)=>setaddKey({keyword: e.target.value, category: ""})} className="mx-8 py-1 md:mx-2 text-center border rounded-lg"></input>
                                    <Box className="mx-[60px] mt-2 md:mx-0 md:mt-0" sx={{ width: {"xs": "90px", "sm": "90px", "md": "120px"}, height:{"xs": "40px", "sm": "40px", "md": "50px"}}}>
                                        <FormControl fullWidth>
                                            <InputLabel className="text-xs md:text-base">Category</InputLabel>
                                            <Select data-testid="Category-Select2" value={addKey.category} onChange={(e)=>{ setaddKey({keyword: addKey.keyword, category: e.target.value}) }} >
                                                {
                                                    eveContext.categories.map((category)=>{
                                                        return(
                                                    <MenuItem  data-testid={`AddKeyword-${category.name}`}  key={`AddKeyword-${category.name}`} value={category.name}>
                                                        <span className="text-xs md:text-base">{category.name}</span>
                                                    </MenuItem>
                                                    )})
                                                }
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </div>
                                <button type="submit" className="mx-7 mt-[30px] mb-7 px-6 py-[2px] md:mx-[66px] md:mt-[20px]  bg-green-500 text-white rounded hover:bg-green-600 transition">Add Keyword</button>
                        </form>
                    </div>
                    <div className="flex justify-center border-collapse p-[10px] rounded-lg bg-white">
                        <table className="w-1/2 font-sans ">
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
                                            <>
                                                <td className="text-left px-[10px] py-[5px]" >{arrEvent.name}</td>
                                                <td className="text-center px-[10px] py-[5px]" >{arrEvent.priority}</td>
                                                {arrEvent.name!=="Unassigned"?
                                                (
                                                <td><button data-testid="deleteCat-button" className="flex items-center px-2 hover:bg-blue-900 hover:text-white rounded transition" ><span data-testid="deleteCat-span" onClick={(e)=>{onDeleteCat(e, arrEvent)}}><DeleteIcon/></span></button></td>
                                                ):<></>
                                                }
                                            </>

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
                    <div className="mt-5">
                        <form onSubmit={submitCategory} className="flex flex-col items-center" >
                                <input type="text" required placeholder="Category Name" onChange={(e)=>setWidCat(e.target.value)} className="mb-2  h-[30px] text-center border rounded-lg"></input>
                                <input type="number" required placeholder="Priority Number" onChange={(e)=>setWidPriority(Number(e.target.value))} className="h-[30px] text-center border rounded-lg"></input>
                                <button type="submit" className="my-4 md:m-5 px-5 py-[2px] bg-green-500 text-white rounded hover:bg-green-600 transition">Add Category-Widget</button>
                        </form>
                    </div>
                </div>
                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
                        <div className="flex flex-col items-center">
                            <CircularProgress />
                            <p className="text-white mt-2">Loading...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

