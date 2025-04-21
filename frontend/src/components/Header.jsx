import PropTypes from "prop-types";
// import React from "react";

export const Header = ({heading})=>{


    // function onBack(event){
    //     event.preventDefault();
    //     navigate("/dashboard");
    // }

    return(
         <>
        {/* {
            isDashboard? */}
            <div className="flex h-[50px] lg:h-[100px] justify-center items-center  border-b-[5px] border-white text-white bg-blue-200">
                <h2 className="px-[20px] py-[5px]  lg:px-[75px] lg:py-[10px] rounded-lg font-bold text-sm lg:text-xl text-center text-blue-900 bg-white ">{heading}</h2>
                {/* <img src={kalmaneTechImg} alt="Logo" className="w-[350px] h-[60px] p-[5px] text-center bg-white rounded-2xl"/> */}
            </div> 
            
            {/* :(
                
                <div className="flex justify-start w-full bg-blue-200 border-b-[5px] border-white">
                    <button type="submit" className="w-[5%] h-[40px] mx-[5px] my-[20px] px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={onBack}>Back</button>
                    <div className="flex justify-center w-[95%] mx-[60px] my-[10px]">
                        <h2 className="w-1/2 p-[10px] rounded-lg font-bold text-xl text-center text-blue-900 bg-white ">{heading}</h2>
                    </div>
                </div>
                 <button type="submit" className="w-[5%] h-[40px] mx-[5px] my-[20px] px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={onBack}>Back</button>
                <h2 className="w-1/2 p-[10px] rounded-lg font-bold text-xl text-center text-blue-900 bg-white ">{heading}</h2> 
                
            )
        }      */}
        </>    
        
    )
}

// ✅ Add prop validation
Header.propTypes = {
        isDashboard: PropTypes.bool.isRequired, // Must be a boolean
        heading: PropTypes.string.isRequired,   // Must be a string
};

