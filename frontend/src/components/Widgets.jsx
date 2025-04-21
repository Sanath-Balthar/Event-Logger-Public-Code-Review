// import FireplaceTwoToneIcon from '@mui/icons-material/FireplaceTwoTone';
import PrivacyTipTwoToneIcon from '@mui/icons-material/PrivacyTipTwoTone';
// import DeleteIcon from '@mui/icons-material/Delete';
// import NotificationImportantTwoToneIcon from '@mui/icons-material/NotificationImportantTwoTone';
// import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';
// import NotificationsNoneTwoToneIcon from '@mui/icons-material/NotificationsNoneTwoTone';
// import LocalFireDepartmentTwoToneIcon from '@mui/icons-material/LocalFireDepartmentTwoTone';
import { useEffect, useState } from 'react';
import { useEventContext } from '../context/eventListContext';
import { useNavigate } from 'react-router-dom';
// import Box from '@mui/material/Box';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';


export default function Widgets(){

    const eveContext = useEventContext();

    const navigate = useNavigate();

    // const [isCreateWidget, setWidgetCreate] = useState(false);
    // const [tempWidgetName, setTempWName] = useState();
    // const [tempWidCat, setTempWidCat] = useState("");

    const [widgets,setWidgets]= useState([{name: "All Events"}]);

    

    useEffect(()=>{
        let tempWidgets = eveContext.categories.map((element)=>{
            return {name: element.name}
        })
        setWidgets(([{name: "All Events"},...tempWidgets]));  
    },[eveContext.categories])



    function onWidgetClick(event,widgetName){
        event.preventDefault();
        localStorage.setItem("Widget",widgetName);
        eveContext.setselWidget(widgetName);
        console.log("Widget Clicked: "+widgetName)
        navigate("/widgetEvents")
    }

    // function onDelete(event,delWidget){
    //     event.preventDefault();
    //     let updatedWidgets = eveContext.cusWidgets.filter((element)=>delWidget!==element.name)
    //     eveContext.setCustWidgets(updatedWidgets)
    // }


    return(
        <div>
            <div className='grid grid-cols-2 gap-2 m-5 p-5 text-center bg-white shadow rounded-md '>
                {/* <div className='flex justify-left'>
                        <PrivacyTipTwoToneIcon className="bg-white-500 " sx={{width:35, height:35}}/>
                        <p className="flex items-center px-2"><span>All Events</span></p>
                </div>         */}
            {
                widgets.map((element)=>{
                    return(
            
                    <div className='flex justify-left m-2' key={element.name}>
                        <PrivacyTipTwoToneIcon className="bg-white-500" sx={{width:{xs:20, sm:20, md:35, lg:35, xl:35}, height:{xs:20, sm:20, md:35, lg:35, xl:35}}}/>
                        <button className="flex items-center md:px-2 text-sm md:text-base hover:bg-blue-900 hover:text-white rounded transition" onClick={(event)=>onWidgetClick(event,element.name)}><span>{element.name}</span></button>
                    </div>           
                    )
                    }
                )
            }
            {/* {
                eveContext.cusWidgets.length!==0?  
                (eveContext.cusWidgets.map((element)=>{
                    return(
            
                    <div className='flex justify-left m-2' key={element.name}>
                        <PrivacyTipTwoToneIcon className="bg-white-500 " sx={{width:35, height:35}}/>
                        <button className="flex items-center px-2 hover:bg-blue-900 hover:text-white rounded transition" onClick={(event)=>onWidgetClick(event,element.category)}><span>{element.name}</span></button>
                        <button className="flex items-center px-2 hover:bg-blue-900 hover:text-white rounded transition" ><span onClick={(e)=>{onDelete(e, element.name)}}><DeleteIcon/></span></button>
                    </div>           
                    )
                    }
                )):<></>
            } */}
            </div>
            {/* <div className="flex flex-col m-5 items-center">
                {
                    isCreateWidget?
                    (<button type="submit" className="mb-4 px-6 py-2 w-1/2 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={(e)=>{setWidgetCreate(!isCreateWidget)}} >Close</button>):
                    (<button type="submit" className="mb-4 px-6 py-2 w-1/2 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={(e)=>{setWidgetCreate(!isCreateWidget)}} >Add Widget</button>)
                }
                {isCreateWidget?
                (
                    <div className='flex flex-col items-center'>
                        <div className='flex flex-row'>
                            <input className='m-2 text-center rounded' placeholder='Widget Name' onChange={(e)=>{setTempWName(e.target.value)}} ></input>
                            <Box sx={{ minWidth: 120}}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select value={tempWidCat} label="Category" onChange={(e)=>{ setTempWidCat(e.target.value)}} >
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
                        <button className="mt-3 px-6 py-2 w-1/2 bg-green-500 text-white rounded hover:bg-green-600 transition" type='submit' onClick={(e)=>{eveContext.setCustWidgets((prev)=>[...prev, {name:tempWidgetName, category:tempWidCat}])}} >Submit</button>
                    </div>
                ):
                (<></>)}
            </div> */}
        </div>

    )
}