const express = require("express");
const { fetchReq, setReqAppr, connectDB, changeMode, signUp, userAuth } = require("../functions/dbFunctions");
const { authMiddleware, authorizeRoles } = require("./middleware");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { default: mongoose } = require("mongoose");
const sendMail = require("../functions/sendMail");

const router = express.Router();

router.post("/SignIn", async (req,res)=>{
    try {
        console.log("Reached Signin");
    
        const { username, password } = req.body;
        const  username_trim = username.trim();
        const  password_trim = password.trim();
        // console.log("Request Body:", req.body);
        console.log("Username: "+username_trim, " Password: " +password_trim);

        // Connect to comapnies DB and check if company already exists, If not create it.
        const [Company_Details,Primary_Admins] = await connectDB("companies");
        if(!(Company_Details && Primary_Admins)){  return res.status(401).send({ message: 'Sign In failed!' }); }
    
        const findUser = await Primary_Admins.findOne({"username": username_trim,"password": password_trim, "company_name":"KalmaneTech", "role": "SuperAdmin"});
    
        if(!findUser) {
            return res.status(401).send({ error: "Invalid username or role" });
        }
        
        console.log("Password in DB: "+findUser.password)
        // const isMatch = await bcrypt.compare(password_trim, findUser.password);
        // console.log("Password match: "+isMatch)
        // if (!isMatch) return res.status(401).send({ error: "Invalid password" });

        // console.log("Models for cookie token: ",dbModels)
    
        const token = jwt.sign({ username: username_trim, role: "SuperAdmin", dbName: "companies" }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1hr" });
        console.log("Token sent: "+token);
    
        // Assigning refresh token in http-only cookie 
        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 3600000 /* 1hr = 3600000 milliseconds*/
        });
        return res.status(200).send({message: "Login Successfull"});      
    } catch (error) {
        console.log("Error in Sign In: "+error)
        return res.status(401).send({ error: "Invalid cred" });
    }     
});

// Only for SuperAdmin - To approve new user signup requests
router.get("/PrimaryAdminRequests", authMiddleware,authorizeRoles(["SuperAdmin"]), async (req,res)=>{
    console.log("Reached PrimaryAdminRequests after middleware auth")
    const Primary_Admins = req.models[1]
    console.log("Db model: ", Primary_Admins )
    await fetchReq(Primary_Admins)
    .then((result)=>{
        if(!result){
            return res.status(500).send({message: "An error occured at backend server"})
        }else{
            return res.status(200).send({requests: result, role: req.user.role});
        }
    })
    .catch((error)=>{
        console.log("Error in fetch Signup Requests: ", error)
        return res.status(500).send({message: "An error occured at backend server"})
    })
})

router.post("/setPrimaryAdminRequest", authMiddleware,authorizeRoles(["SuperAdmin"]), async (req,res)=>{
   try {
     const {company, username, apprStatus } = req.body;
     const  company_trim = company.trim();
     console.log("Company: ",company_trim)
     const  username_trim = username.trim();
 
     const Company_Details =req.models[0]
     const Primary_Admins = req.models[1];
     // const  apprStatus_trim = apprStatus.trim();   -- apprStatus is booleand and cannot be trimmed.
     
    console.log("Company name after extracting: ",company_trim," Username: ",username_trim," ApprStatus: ",apprStatus, "Models: ",Company_Details, Primary_Admins)

     const [password,email] = await Primary_Admins.findOne({company_name: company_trim, username: username_trim})
     .then((result)=>{
         console.log("result: ",result);
         if(!result){
            return res.status(401).send(false);
         }else{
            console.log("Password: ",result.password," Email: ",result.email);
             return [result.password, result.email];
         }
     })
 
     if(apprStatus){
         await changeMode(Company_Details, company_trim, apprStatus)
         .then((result)=>{
             console.log("setPrimaryAdminRequest changemode: ",result)
             if(!result){
                return res.status(401).send(false);
             }
         })
 
         await Primary_Admins.findOneAndUpdate({company_name: company_trim, username: username_trim},{password:""},{new:true})
         .then((result)=>{
             if(!result){
                return res.status(401).send(false);
             }else{
                console.log(result);
             }
         })         

         const pass_bcrypt = await bcrypt.hash(password,10);
         console.log("Password: ", password,", pass bcrypt: ",pass_bcrypt,", email: ",email)
 
             // Upon superadmin approval, creating a new DB and creating 1st admin in that DB
             const DbName = company_trim +"_EventLogger";
             const dbModels = await connectDB(DbName)
             const User = dbModels[0]
             console.log("User Model: ",User)
 
             const authRes = await userAuth(User,{username: username_trim});
             console.log("UsernameCheck: "+authRes)
 
             if(!authRes){
                 const signupcheck = await signUp(User,{username: username_trim, password: pass_bcrypt, role: "admin", email: email, company_name:company_trim, approved: true });
                 console.log(signupcheck);
                 if(!signupcheck){
                     return res.status(500).send({ message: 'An Error occured at backend server!' });
                 }
             }
 
     }else{
         await Company_Details.deleteOne({company_name: company_trim})
         .then( (result)=>{
             console.log("Company deletion: ",result)            
             if(result.deletedCount===0){
                 return res.status(401).send(false);
             }
         })
         .catch((error)=>{
             console.log("Error in company delete: ",error)
             return res.status(500).send(false);
         })
         
 
     }
 
     await setReqAppr(Primary_Admins,company_trim, username_trim,apprStatus)
     .then(async(result)=>{
         console.log("Updated Primary Admins approval, Rem requests: ", result)
         if(result){
             console.log("Request approved: ",result)              
         }else{
             return res.status(500).send({message: "An error occured at backend server"});
         }
     })
     .catch((error)=>{
         console.log("Error in set Request Approval: ", error)
         return res.status(500).send({message: "An error occured at backend server"});
     })

     if(apprStatus){
        const mailOptions = {
            from: "sanathabalthar@gmail.com",
            to: email,
            subject: "Company Registration approved",
            text: "Your Registration request has been approved by Kalmanetech. Please proceed to login to your account!"
        };
        
         await sendMail(mailOptions)
         .then((response)=>{
             if(response==="Mail sent!"){
                 console.log("Mail sent!")
             }
         }).catch ((error)=>{
        console.log("Error while sending mail in catch sendMail: "+error)
       })
       
     }else{
        const mailOptions = {
            from: "sanathabalthar@gmail.com",
            to: email,
            subject: "Company Registration rejected",
            text: "Your Registration request has been rejected by Kalmanetech. Please get in touch with your point of contact at Kalmanetech for further information!"
        };
        await sendMail(mailOptions)
        .then((response)=>{
            if(response==="Mail sent!"){
                console.log("Mail sent!")
            }
        }).catch ((error)=>{
            console.log("Error while sending mail in catch sendMail: "+error)
           })
     }

     let requests = await fetchReq(Primary_Admins)
        if(requests){
            return res.status(200).send(requests)
        }  

        

   } catch (error) {
    console.log("Error in set Request Approval: ", error)
         return res.status(500).send({message: "An error occured at backend server"});
   }
    
})

router.get("/fetchCompanies",authMiddleware,authorizeRoles(["SuperAdmin"]),async(req,res)=>{

    try {
        console.log("Reached Fetch Companies")
        const Company_Details = req.models[0];
        console.log("Company model", Company_Details);
        // const dbName = req.user.dbName;
        // const company = dbName.split("_")[0];
    
        Company_Details.find()
        .then((result)=>{
            console.log("Company result", result)
            if(result){
                const companies = result.map((element)=>{
                    return {company: element.company_name, mode: element.mode }
                })
                return res.status(200).send(companies)
            }else{
                let company = []
                return res.status(200).send(company)
            }
            
        })
        .catch((error)=>{
            console.log("Error in companies fetch", error)
            return res.status(500).send({ message: 'An Error occured at backend server!' });
        })
    } catch (error) {
        console.log("Error in companies fetch: ", error)
         return res.status(500).send({message: "An error occured at backend server"});
    }
})

router.post("/modeChange",authMiddleware,authorizeRoles(["SuperAdmin"]),async(req,res)=>{
try {
    
        console.log("Reached mode Change")
        const companyArr = req.body;
        // const  company_trim = company.trim();
        console.log("Company: ",companyArr)
    
        const Company_Details = req.models[0];
        console.log("Company model", Company_Details);
        // const dbName = req.user.dbName;
        // const company = dbName.split("_")[0];

        companyArr.map(async(element)=>{
            await Company_Details.findOneAndUpdate({company_name: element.company},{mode: element.mode},{new:true})
            .then((result)=>{
                console.log("Company result", result)
                if(!result){
                    return res.status(500).send({ message: 'An Error occured at backend server!' });
                }
                
            })
            .catch((error)=>{
                console.log("Error in companies fetch", error)
                return res.status(500).send({ message: 'An Error occured at backend server!' });
            })
        })
    
       
} catch (error) {
    console.log("Error in companies fetch", error)
}
})

module.exports = router;