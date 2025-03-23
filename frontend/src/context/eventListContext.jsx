import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

export const EventListContext = createContext();

export default function EventListProvider({children}){

    const [eventList, setList] = useState([]);
    const [eventKeywords,setKeyword] = useState([]);
    const [categories, setCategories] = useState([])

    const [cusWidgets,setCustWidgets]= useState([]);
    
    const [selWidget, setselWidget] = useState();
    const [recentEvents, setREvents] = useState([]);

    return(
        <EventListContext.Provider value={{eventList,setList,eventKeywords,setKeyword,categories,setCategories,cusWidgets,setCustWidgets,selWidget,setselWidget,recentEvents,setREvents}}>
            {children}
        </EventListContext.Provider>
    )
}

// ✅ Validate 'children' correctly
EventListProvider.propTypes = {
    children: PropTypes.node.isRequired, // Accepts any valid React children
  };

export const useEventContext = ()=> useContext(EventListContext);