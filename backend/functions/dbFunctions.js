const mongoose = require("mongoose");
const config = require("../config.json");
const bcrypt = require("bcryptjs");
// const User = require("../models/Company_EventLogger/User");
// const All_Events = require("../models/Company_EventLogger/AllEvents");
// const Event_Keywords = require("../models/Company_EventLogger/EventKeywords");
// const Categories = require("../models/Company_EventLogger/Categories");
// const CompanyModelFunc = require("../models/Companies/CompanyDetails.js");

    
async function connectDB(companyDB){
    try {
        const cloud_URL = `mongodb+srv://${config.user}:${config.password}@${config.cluster}/${companyDB}?retryWrites=true&w=majority&appName=Cluster0`
        // const dbConnectcheck =  mongoose.connections;
        
        // let DbArr =  dbConnectcheck.map((element)=>{
        //                     console.log("Exisiting DB connections: ",element.name);
        //                     return element.name;
        //                 }).filter((element)=>{return element!=="undefined"})

        const existingConnection =  mongoose.connections.filter((element)=>{return element.name===companyDB})
        

        // if(DbArr.length!==0 && DbArr.includes(companyDB)){
        if(existingConnection.length !==0){
            // existingConnection will be an array with single element since company name is unique. Hence using existingConnection[0]
            const models = Object.values(existingConnection[0].models);
            console.log( existingConnection[0].name ," DB is already connected");
            return models;
        }else{
            let newConnection = mongoose.createConnection(cloud_URL);
            await newConnection.asPromise();
            const dbName = newConnection.db.databaseName;
            console.log("DB connection established: ",dbName);
            if(companyDB==="companies"){
                const Company_Details = require("../models/Companies/CompanyDetails")(newConnection);
                const Primary_Admins = require("../models/Companies/Primary_Admins")(newConnection);
                // console.log("DB Name: ", connection.name);
                console.log("Company DB models: ",Company_Details, Primary_Admins);    
                return [Company_Details,Primary_Admins];                 
            }else{
                const User = require("../models/Company_EventLogger/User")(newConnection);
                const All_Events = require("../models/Company_EventLogger/AllEvents")(newConnection);
                const Event_Keywords = require("../models/Company_EventLogger/EventKeywords")(newConnection);
                const Categories = require("../models/Company_EventLogger/Categories")(newConnection);

                console.log("DB models: ",User," ",All_Events," ",Event_Keywords," ",Categories);
                return [User, All_Events, Event_Keywords, Categories];
            }                
        }             
        
    } catch (error) {
        console.log("Connection failed. Error: " + error);
        return false;
    }
    
}

async function signUp(User,userCred){
    const signupcheck =  User.create(userCred).
        then(() => {
            console.log( "User added");
            return true;
        })
        .catch((err)=>{ 
            console.log("Error: "+err);
            return false;
        }); 

        return signupcheck;
} 

async function fetchReq(User) {
    console.log("Model inside fetchSUReq: ",User)
    return await User.find({approved:false})
    .then((result)=>{
        console.log("Find requests result:", result)
        if(result && result.length!==0){
            let reqArr = result.map((element)=>{
                console.log("Sign Up requests: ", element.username )
                return {company:element.company_name, username: element.username, role:element.role , approval: element.approved}
            }) 
            return reqArr; 
        }else{
            return [];
            // empty array is truthy in "if condition"
        }     
    })
    .catch((error)=>{
        console.log("Error in fetch Signup Requests: ", error)
        return false;
    })

    
    
}

async function setReqAppr(User,company, username, apprStatus) {
   try {
     if(apprStatus){
         let updateCheck = await User.findOneAndUpdate({company_name: company, username:username },{approved:apprStatus},{new:true})
         if(updateCheck){
            return true
         }else{
             return false
         }
     }else{
         let deleteCheck = await User.deleteOne({company_name: company, username:username})
         if(deleteCheck.deletedCount!==0){
             return true
         }else{
             return false
         }
     }
   } catch (error) {
    console.log("Error in setReqAppr: ", error)
    return false;
   }
    
}

async function changeMode(Company_Details, company, mode){
    try {
            const afterChange = await Company_Details.findOneAndUpdate({company_name:company },{mode:mode},{new:true})
            if(afterChange){
             const result = await Company_Details.find()     
             let companies =[];
             if(result && result.length!==0){
                companies = result.map((element)=>{
                    return {company: element.company_name, mode: element.mode }
                })
             }
             return companies;          
             
            }else{ 
                console.log("Company not found or failed to update")
                return false;
            }            

    } catch (error) {
        console.log("Error in changeMode: ",error);
        return false;
    }
}

async function userAuth(User, searchValue){

    try {
        const res =await User.findOne(searchValue)
        console.log("DB result is "+res)
        if(res && res.length!==0){
            // console.log("DB result is "+res)
            // const passCheck = await bcrypt. compare(password,res.password)
            return res;
        }else{
            return false
        }
    } catch (error) {
        console.log("Error in userAuth: "+error);
            return false
    }

    }

async function addEvents(All_Events, eventData){

    const addEventCheck =  All_Events.create(eventData)
      .then(() => {
            console.log( "Event added");
            return true;
        })
        .catch((err)=>{ 
            console.log("Error: "+err);
            return false;
        }); 
        return addEventCheck;
} 

async function getKWList(Event_Keywords){

        const kwList = await Event_Keywords.find()
        .then((result)=>{
            // console.log("Keyword List: "+result);
            let resKWList = [];
            if(result && result.length!==0){
                resKWList = result.map((element)=>{
                    return {keyword: element.keyword, category: element.category}
                })
            }            
            return resKWList;
        })
        .catch((error)=>{
            console.log("Error: "+error);
            return [];
        });
        return kwList;
        
}

async function addKeywords(Event_Keywords,kwList) {

    let updateFlag = false;
    const updateCheck = kwList.map((element,index)=>{
        // console.log("Add Keyword:"+element.keyword)
        return Event_Keywords.find({keyword:element.keyword}).
        then((result)=>{
            // console.log("Result: "+result.length);
            if(result && result.length===0){
                Event_Keywords.create({keyword:element.keyword, category:element.category})
                if(index===kwList.length-1){
                    updateFlag = true;
                }
            }else{
                console.log("Keyword already exists");
                updateFlag = false;
            }
        })
        .catch((err)=>{
            console.log("Error: "+err);
            updateFlag = false;
        })
    }) 
    
    await Promise.all(updateCheck);

    console.log("Add keywords: "+updateFlag);

    return updateFlag;
    
}

async function updateKWcategory(Event_Keywords,kwList){
    
    let updateFlag = false;
    
    let updateChecks = kwList.map((element,index)=>{
        // console.log("Keyword: "+element.keyword+" Category: "+element.category);
        return Event_Keywords.findOneAndUpdate({keyword:element.keyword},{category:element.category},{new:true}).
        then((result)=>{
           console.log("Keyword Category updated: ",result);
           if(index===kwList.length-1){
            updateFlag = true;
        }
           return true;
        })
        .catch((err)=>{
            console.log("Error: "+err);
            updateFlag = false;
            return false;
        })
        

    })

    
    await Promise.all(updateChecks);

    return updateFlag;
    
}

async function updateEventCat(All_Events, kwList){
    
    let updateFlag = false;
    console.log("Reached updateEventCat. No of categories to be updated: " + kwList.length);
    let updateChecks = kwList.map(async(element,index)=>{
        // console.log("Reached updateEventCat ");
        console.log("eventName: "+element.keyword+" Category: "+element.category);
        return All_Events.updateMany({eventName:element.keyword},{category:element.category}).
        then((result)=>{
           console.log("Event Category updated: ",result);
           if(index===kwList.length-1){
            updateFlag = true;
        }
           return true;
        })
        .catch((err)=>{
            console.log("Error: "+err);
            updateFlag = false;
            return false;
        })
        

    })

    await Promise.all(updateChecks);

    return updateFlag;
    
}

async function addCategory(Categories,newCat){

    const addCatCheck = await Categories.find({name:newCat.name})
    .then(async(result)=>{
        if(result && result.length===0){
            await Categories.create({name: newCat.name, priority: newCat.priority})
            return true;
        }else{
            console.log("Category already exists");
            return false;
        }
    }).catch((err)=>{    
        console.log("Error: "+err);
        return false;
    });

    return addCatCheck;
}

async function fetchCategories(Categories){
    const catList = await Categories.find()
    .then((result)=>{
        console.log("Category List: "+result);
        let resCatList = []
        if(result && result.length!==0){
            resCatList = result.map((element)=>{
                return {name: element.name, priority: element.priority}
            })
        }
        
        return resCatList;
    }).catch((err)=>{    
        console.log("Error: "+err);
        throw new Error("Error while fetching category list")
        // return [];
    });
    return catList;
}

async function delCategory(Categories, delCat){
    let delCheck;
    const delCount = await Categories.deleteOne({name:delCat.name})
    if(delCount.deletedCount>0){
        console.log("Category deleted");
        delCheck = true;
    }else{
        delCheck = false;
    }
    return delCheck;
    
}

async function getRecentEvents(model){
    try{
        const latestEvents = await model.find()
        .sort({ timestamp: -1 })
        .limit(10)

        let newRecentEvents = latestEvents.map((element)=>{  
            // let newTS =new Date(element.timeStamp).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            // console.log("timestamp type: "+typeof(newTS))
            let newElement = {eventName:element.eventName,category:element.category,timeStamp:element.timeStamp}
            // console.log("New Element: "+newElement.eventName+" "+newElement.category+" "+newElement.timeStamp);
            return newElement;
        })

        return newRecentEvents;
    } 
        catch (error) {
            console.log("Error: "+error);
            return false
        }
}

async function getAllEvents(model){
    try{
        const allEvents = await model.find()
        .sort({ timestamp: -1 })

        let newEvents = allEvents.map((element)=>{  
            let newTS =new Date(element.timeStamp).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            // console.log("timestamp type: "+typeof(element.timeStamp))
            let newElement = {eventName:element.eventName,category:element.category,timeStamp:newTS}
            // console.log("New Element: "+newElement.eventName+" "+newElement.category+" "+newElement.timeStamp);
            return newElement;
        })

        return newEvents;
    } 
        catch (error) {
            console.log("Error: "+error);
            return false
        }
}

async function deleteKW(Event_Keywords, delItem){
    const deleteKWCheck = Event_Keywords.deleteOne({keyword:delItem.keyword}).
    then(()=>{
        console.log("KW deleted");
        return true;
    })
    .catch((err)=>{
        console.log("Error: "+err);
        return false;
    });
    return deleteKWCheck;
}

async function deleteEvents(All_Events){
    console.log("Reached All Events delete db function");
    const deleteEventCheck = All_Events.deleteMany({}).
    then(()=>{
        console.log("All Events deleted");
        return true;
    })
    .catch((err)=>{
        console.log("Error: "+err);
        return false;
    });
    return deleteEventCheck;
}


module.exports={connectDB, signUp,fetchReq, setReqAppr,changeMode, userAuth,addEvents,deleteEvents,getAllEvents,getRecentEvents,addKeywords,updateKWcategory,updateEventCat,getKWList,deleteKW,addCategory,fetchCategories,delCategory}