import { useEffect, useState } from "react";
// import { useEventContext } from "../context/eventListContext";
// import { SecurityUpdateWarningSharp } from "@mui/icons-material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import dayjs from "dayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from "axios";
import SortIcon from '@mui/icons-material/Sort';
import PropTypes from "prop-types";
import { CircularProgress } from "@mui/material";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function ListEvents({eventList, isDashboard}){

        // console.log("Passed Events: "+isDashboard)

        const [sortOrder,setSortOrder] = useState();
        const [sortColumn, setSortColumn] = useState();
        const [data, setData] = useState(eventList);
        const [startDate, setStartDate] = useState(null);
        const [endDate, setEndDate] = useState(null);
        const [loading, setLoading] = useState(false);
        // const hasUE1run = useRef(false);

        useEffect(()=>{
            setData(eventList)
            // sortOrder = ""
            if(eventList.length!==0){
                handleSort("timeStamp")
            }
    // Disabled warning about missing dependency since 
    // this code is designed to use a single dependency
    // eslint-disable-next-line 
        },[ eventList])


        // console.log("ListEvents Rendered")

        // console.log("Sorted Data: "+sortedData)

        // sortedData.map((element)=>{console.log("Events inside ListEvents component: "+element.eventName)})

     const handleSort = (column)=>{
        console.log("Column: "+column);
        const order = (sortColumn===column && sortOrder==="asc")? "desc" : "asc";

        console.log("order: "+order);

        const sortedData = [...eventList].sort((a,b)=>{
            // console.log("a[column]: "+a[column]+" b[column]: "+b[column]);
            return order === "asc"? a[column]>b[column]? 1 : -1 : a[column]<b[column]? 1 : -1
        })

        setData(sortedData);
        setSortOrder(order);
        setSortColumn(column);
    }

    const handleFilter = () => {
        const filteredData =  eventList.filter(row => {
            const rowDate = new Date(row.timeStamp);
            console.log("Type of TimeStamp: "+rowDate)
            console.log("Start Date: "+startDate)
            console.log("end Date: "+new Date(endDate))
            if(startDate===null && endDate===null){
                return true
            }else if(startDate===null && endDate!==null){
                return  rowDate <= new Date(endDate)
            }else if(startDate!==null && endDate===null){
                return  rowDate >=new Date(startDate)
            }else{
                return (rowDate >= new Date(startDate)) && (rowDate <= new Date(endDate))
            }
        });

        console.log("Filtered Data: "+filteredData)
        filteredData.map((element)=>{console.log("Filter data: "+element.eventName+" "+element.timeStamp)})
        setData(filteredData);
    };

    const startDateChange = (newValue)=>{
        // event.preventDefault();
        console.log("Startdate new value: "+new Date(newValue))
        setStartDate(newValue);
    }

    const endDateChange = (newValue)=>{
        // event.preventDefault();
        setEndDate(newValue);
    }

    const downloadData = () => {
        const text = data.map(element => `${element.timeStamp}, ${element.eventName}, ${element.category}`).join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const now = new Date();
        const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"};
        const formattedDate = new Intl.DateTimeFormat("en-IN", options).format(now).replace(/[/, ]/g, "-").replace(/:/g, "-");
        console.log("File name", `event_log_${formattedDate}.txt`)
        link.download = `event_log_${formattedDate}.txt`;
        link.click();
    };

    const sendEmail = async () => {
        try {
            const email = prompt("Enter recipient email:");
            if (!email) return alert("Email is required");
    
            console.log("Reached sendEmail")
            setLoading(true);
    
            // Generate the text file as a Blob
            const text = data.map(element => `${element.timeStamp}, ${element.eventName}, ${element.category}`).join("\n");
            const blob = new Blob([text], { type: "text/plain" });

            const now = new Date();
            const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"};
            const formattedDate = new Intl.DateTimeFormat("en-IN", options).format(now).replace(/[/, ]/g, "-").replace(/:/g, "-");
            console.log("File name", `event_log_${formattedDate}.txt`)
    
            // Create a FormData object
            const formData = new FormData();
            formData.append("email", email); // Add the recipient email
            formData.append("file", blob, `event_log_${formattedDate}.txt`); // Add the file with a name
    
            console.log("Filename generated: ",`event_log_${formattedDate}.txt`)
    
            const response = await axios.post(`${API_URL}/sendMail`,formData,{withCredentials:true, headers: {
                "Content-Type": "multipart/form-data", // Required for file uploads
            },})

            setLoading(false);
            console.log("response: "+response.data);
            if(response.status===200){alert("Mail Sent!")}
            else{alert("Mail not sent. Check the email id submitted")}

        } catch (error) {
            const errData = error.response.data.error;
            console.log("Error in sendEmail: ",error)
            
            if(errData=="Invalid token"){
                alert("Session Expired! Please login again")
                localStorage.removeItem("Authenticated");
                window.location.href="/"
            }else if(errData=="Unauthorized"){
                alert("Forbidden, insufficient permissions!")
                window.location.href="/dashboard"
            }else if(error.response.status===550){
                alert("Invalid email id")
            }else if (error.response.status===554){
                alert("Mail not sent! Try again after sometime or contact support team")
            }else{
                alert("Issue at the backend server. Try again after logging out and logging in again or please contact support team")
            }
        } 

    };

    return(

            <div className="w-full text-xs lg:text-base relative">
                {
                    !isDashboard?
                    (
                <div className="flex flex-col items-center m-2">
                    {/* <label className="m-2">Start Date: <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required /></label>
                    <label className="m-2">End Date: <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required/></label> */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <div className="bg-white m-5" >
                            <DateTimePicker  label="Start Date"               
                                onChange={startDateChange}
                                viewRenderers={{
                                    hours: renderTimeViewClock,
                                    minutes: renderTimeViewClock,
                                    seconds: renderTimeViewClock,
                                }}/>
                        </div>
                        <DateTimePicker className="bg-white" label="End Date"
                            onChange={endDateChange}
                            viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock,
                                seconds: renderTimeViewClock,
                            }} />
                    </LocalizationProvider>
                    <button onClick={handleFilter} className="m-5 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Filter Events</button>
                </div>
                    ):<></>
                }
                <div className="flex justify-center overflow-auto p-2 rounded-lg bg-white">
                    <table className="w-full font-sans">
                        <thead className="w-full ">
                            <tr className="w-full">
                                {/* <th className="text-left px-[10px] py-[5px]" onClick={()=>{handleSort("index")}}>Index</th> */}
                                {/* <th className="text-left px-[10px] py-[5px]">Date</th> */}
                                <th className="rounded-l-lg bg-blue-100 " onClick={()=>{handleSort("timeStamp")}}>
                                    <span className="flex flex-row justify-start items-center text-left my-[10px] ">
                                        <SortIcon className="mx-1"/><p className="mx-1">Time Stamp</p>
                                    </span>
                                </th>
                                <th className="bg-blue-100 " onClick={()=>{handleSort("eventName")}}>
                                    <span className="flex flex-row justify-start items-center text-left  my-[10px]  ">
                                    <SortIcon/> <p className="mx-1">Events</p>
                                    </span>
                                </th>
                                <th className="rounded-r-lg bg-blue-100" onClick={()=>{handleSort("category")}}>
                                    <span className="flex flex-row justify-center lg:justify-start items-center text-left   my-[10px]">
                                    <SortIcon/> <p className="mx-1">Category</p>
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className=" w-full h-full">
                            {/* <tr> */}
                            {
                                data.length!==0?(
                                    data.map((arrEvent,index)=>{
                                        // console.log("Inside List Events: Event Index: "+arrEvent.index+"\n Event name: "+arrEvent.eventName)
                                    return(
                                        <tr className="h-full" key={index}>
                                            {/* <td className="text-left px-[10px] py-[5px]">{arrEvent.index}</td> */}
                                            <td className=""><span className="flex text-left w-full  my-[10px]">{new Date(arrEvent.timeStamp).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}</span></td>
                                            <td><span className="flex text-left w-full my-[10px]">{arrEvent.eventName}</span></td>
                                            <td className="text-center lg:text-left"><span className="lg:flex w-full my-[10px]">{arrEvent.category===""?"Unassigned":arrEvent.category}</span></td>
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
                {
                    !isDashboard?
                (<>
                    <div className="m-2 flex justify-center">
                        <button className="m-5 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={downloadData}>Download as Text</button>
                    </div>
                    <div className="pb-[50px] flex justify-center">
                        <button className="m-5 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={sendEmail}>Share via Email</button>
                    </div>
                </>
                ):<></>
                }
                {loading && (
                    <div className=" fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
                        <div className="flex flex-col items-center">
                            <CircularProgress />
                            <p className="text-white mt-2">Loading...</p>
                        </div>
                    </div>
                )}
            </div>
    )

}


ListEvents.propTypes = {
        isDashboard: PropTypes.bool.isRequired, // Must be a boolean
        eventList: PropTypes.array.isRequired   // Must be a array
};
