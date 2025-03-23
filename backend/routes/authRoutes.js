
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userAuth, signUp,connectDB, setReqAppr, fetchReq } = require("../functions/dbFunctions");
const { authMiddleware,authorizeRoles } = require("./middleware");
const sendMail = require("../functions/sendMail");

const router = express.Router();

router.post("/CompanyRegistration", async (req,res)=>{
    console.log("Reached SignUP ");
    
    try {
        const {company,primary_admin,password,email} = req.body;
        const  primary_admin_trim = primary_admin.trim();
        const  company_trim = company.trim();
        const  email_trim = email.trim();
        const  password_trim = password.trim();
        console.log(primary_admin_trim); console.log(company_trim); console.log(email_trim);
        

        // Connect to comapnies DB to check if company is already registered.
        // Company_Details collection contains only the company name and its mode (enable/disable)
        // Primary_Admins contain the Primary admin deatils 
        const [Company_Details,Primary_Admins] = await connectDB("companies");
        if(!(Company_Details && Primary_Admins)){ return res.status(500).send({ message: 'An error occurred on the DB' }); }
        
        
        // Company Registration check. 
        const companyCheck = await userAuth(Company_Details,{company_name: company_trim});
        console.log("companyCheck: ",companyCheck)
        if(!companyCheck){
             Company_Details.create({company_name: company_trim})
            .then((result)=>{console.log("Company added: ",result);})
            .catch((err)=>{
                console.log("Error in adding company: ",err);
                return res.status(500).send({ message: 'An error occurred on the DB'});
            });
            
            Primary_Admins.create({company_name:company_trim, username: primary_admin_trim, password:password_trim, role: "admin", email: email_trim })
            .then((result)=>{
                console.log("Admin approval requested: ",result);
                return res.status(200).send({message: "Company Registerion sent for approval"}); 
            })
            .catch((err)=>{
                console.log("Error in adding admin: ",err);
               return res.status(500).send({ message: 'An error occurred on the DB'});
            });
        }else{
           return res.status(409).send({message: "Company already registered"})
        }

       
    } catch (error) {
        console.error("Error in registraion: ",error)
        return res.status(500).send({ message: 'An error occurred on the DB' });
    }
});

router.post("/SignUp", async (req,res)=>{
    console.log("Reached SignUP ");
    
    try {
        const {username,password,role,company,email} = req.body;
        const  username_trim = username.trim();
        const  password_trim = password.trim();
        const  role_trim = role.trim();
        const  company_trim = company.trim();
        const  email_trim = email.trim();
        console.log(username_trim); console.log(password_trim);  console.log(role_trim);  console.log(company_trim); console.log(email_trim);
        
        const pass_bcrypt = await bcrypt.hash(password_trim,10);

        // Connect to comapnies DB to check if company is already registered.
        // Company_Details collection contains only the company name and its mode (enable/disable)
        // Primary_Admins contain the Primary admin deatils 
        const [Company_Details,Primary_Admins] = await connectDB("companies");
        if(!(Company_Details && Primary_Admins)){ return res.status(500).send({ message: 'Sign Up failed. Error occured at backend server!' }); }
        
        
        // Company Registration check. 
        const companyCheck = await userAuth(Company_Details,{"company_name": company_trim});
        console.log("companyCheck: ",companyCheck)
        if(!companyCheck){
            return res.status(400).send({ message: 'Company has not been registered. Please register the company!' });
        }
        
        // Company approval check.
        if(companyCheck && companyCheck.mode===false){return res.status(405).send({ message: 'Company Subscription Ended. Please renew and then try to SignUp!'});}

        /** if Company name alread exists in the company DB, then its not 1st admin request for the company
             This new admin/user request must go to all admins
             */
    
        const DbName = company_trim +"_EventLogger";
        const dbModels = await connectDB(DbName)
        const User = dbModels[0]
        console.log("User Model: ",User)
    
    
        const authRes = await userAuth(User,{"username": username_trim});
        console.log("UsernameCheck: "+authRes)
    
        if (!authRes) {
            const signupcheck = await signUp(User,{username: username_trim, password: pass_bcrypt, role: role_trim, email: email_trim, company_name:company_trim });
            console.log(signupcheck);
    
            if(signupcheck){
                return res.status(200).send({message: "SignUp Successfull"});   
            }else{
                return res.status(500).send({ message: 'Sign Up failed. Error occured at backend server!' });
            }
        }
        else {
            // Return  error if username already exists
            return res.status(401).send({message: 'User Name already exists'});
        }
    } catch (error) {
        console.error("Error in Sign UP: ",error)
        return res.status(500).send({ message: 'Sign Up failed. Error occured at backend server!' });
    }
});

router.post("/SignIn", async (req,res)=>{
    try {
        console.log("Reached Signin");
    
        const { username, password, role, company } = req.body;
        const  username_trim = username.trim();
        const  password_trim = password.trim();
        const role_trim = role.trim();
        const company_trim = company.trim();
        // console.log("Request Body:", req.body);
        console.log("Username: "+username_trim, " Password: " +password_trim+ " Role: "+role_trim, " Company: "+company_trim);

        // Connect to comapnies DB and check if company already exists, If not create it.
        const [Company_Details,Primary_Admins] = await connectDB("companies");
        console.log("Company_Details in sign in: ",Company_Details)
        if(!Company_Details){ return res.status(500).send({ message: 'Sign In failed. Error occured at backend server!' }); }

        const companyCheck = await userAuth(Company_Details,{"company_name": company_trim});
        console.log("companyCheck: ",companyCheck)
        if(!companyCheck){
            return res.status(400).send({ message: 'Company has not been registered. Please register the company!' });
        }

        if(companyCheck && companyCheck.mode===false){return res.status(405).send({ message: 'Company Subscription Ended. Please renew and then try to Sign In!'});}
    
        const dbName = company_trim +"_EventLogger";
        const dbModels = await connectDB(dbName)
        const User = dbModels[0]
        console.log("User Model: ",User)
    
        const findUser = await User.findOne({"username": username_trim,"role":role_trim});
    
        if(!findUser) {
            return res.status(401).send({ error: "Invalid username or role" });
        }
        if(!findUser.approved) {
            return res.status(403).send({ error: "Account not approved by admin" });
        }
        
        console.log("Password hash in DB: "+findUser.password)
        const isMatch = await bcrypt.compare(password_trim, findUser.password);
        console.log("Password match: "+isMatch)
        if (!isMatch) return res.status(401).send({ error: "Invalid password" });

        // console.log("Models for cookie token: ",dbModels)
    
        const token = jwt.sign({ username: username_trim, role: role_trim, dbName: dbName }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1hr" });
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
        return res.status(500).send({ message: 'Sign In failed. Error occured at backend server!' });
    }     
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { company,email } = req.body;
        const company_trim = company.trim();
        const email_trim = email.trim();
        if (!company_trim || !email_trim) return res.status(400).send({ message: "Email is required" });

        const DbName = company_trim +"_EventLogger";
        const dbModels = await connectDB(DbName)
        const User = dbModels[0]
        console.log("User Model: ",User)
        const response = await User.findOne({ company_name: company_trim, email: email_trim });
        if (!response) return res.status(401).send({ message: "User not found" });

        const token = jwt.sign({ company_name: company_trim ,email: email_trim  }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "10m" });

        const origin = process.env.ORIGIN;

        const resetLink = `${origin}/password-reset/token=${token}`;

        const mailBody =  `<h1>Reset Your Password</h1>
        <p>Click on the following link to reset your password:</p>
        <a href="${resetLink}">Password Reset Link</a>
        <p>The link will expire in 10 minutes.</p>`;

        // if (!email || !data) {
        //     throw new Error("Invalid Request - Check email id");
        // }
    
            const mailOptions = {
                from: "sanathabalthar@gmail.com",
                to: email_trim,
                subject: "Password Reset Request",
                html: mailBody
            };

        await sendMail(mailOptions)
        .then((response)=>{
            if(response){
                return res.status(200).send({ message: "Password reset link has been sent to your email"});
            }else{
                return res.status(500).send({ message: "An error occured at backend server"});
            }
        })

    } catch (error) {
        console.error("Error in forgot password: ",error)
        return res.status(500).send({ message: "An error occured at backend server"});
    }
})

router.post("/password-reset/:token", async (req, res) => {
    try {
        const { password } = req.body;    
        const token = req.params.token.split("token=")[1];
        console.log("Token received: "+token);
        const password_trim = password.trim();
        if (!token) return res.status(400).send({ message: "Token is required" });
        if (!password_trim) return res.status(400).send({ message: "Password is required" });

        const pass_bcrypt = await bcrypt.hash(password_trim,10);
        const decoded =jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const DbName = decoded.company_name +"_EventLogger";
        const dbModels = await connectDB(DbName)
        const User = dbModels[0]
        console.log("User Model: ",User)
        const response = await User.findOneAndUpdate({ company_name: decoded.company_name, email: decoded.email },{password: pass_bcrypt},{new:true});
        if (!response){
            return res.status(401).send({ message: "User not found" });
        }else{
            return res.status(200).send({ message: "Password reset successful" });
        }
    } catch (error) {
        console.error("Error in reset password: ",error)
        return res.status(500).send({ message: "An error occured at backend server"});
    }

})

// 🔴 Logout Route (Clears Cookie)
router.post("/signout", (req, res) => {
    res.clearCookie("jwt");
    res.status(200).send({ message: "Logged out" });
});

// Only for Admin - To approve new user signup requests
router.get("/fetchSignUpRequest", authMiddleware,authorizeRoles(["admin"]), async (req,res)=>{
    console.log("Reached fetch signup request after middleware auth")
    const User_model = req.models[0]
    fetchReq(User_model)
    .then((result)=>{ 
        if(result){
           return res.status(200).send({requests: result, role: req.user.role});
        }else{
           return res.status(500).send({message: "An error occured at backend server"});
        }       
        
    })
    .catch((error)=>{
        console.log("Error in fetch Signup Requests: ", error)
       return res.status(500).send({message: "An error occured at backend server"});
    })
})

router.post("/setSignUpRequest", authMiddleware,authorizeRoles(["admin"]), async (req,res)=>{
    const { username, apprStatus } = req.body;
    const  username_trim = username.trim();
    const User_model = req.models[0];
    // const  apprStatus_trim = apprStatus.trim();   -- apprStatus is booleand and cannot be trimmed.

    const company_name = req.user.dbName.split("_")[0]

    console.log("Company name after extracting: ",company_name)

    const email = await User_model.findOne({company_name: company_name, username: username_trim})
    .then((result)=>{
        if(!result){
           return res.status(500).send({message: "An error occured at backend server"});
        }else{
            return result.email;
        }
    })
    

    await setReqAppr(User_model,company_name, username_trim,apprStatus)
    .then(async(result)=>{
        if(result){
            console.log("Request approved: ",result)             
        }else{
            res.status(500).send({message: "An error occured at backend server"});
        }
    })
    .catch((error)=>{
        console.log("Error in set Request Approval: ", error)
        res.status(500).send({message: "An error occured at backend server"});
    })

    
    if(apprStatus){
        const mailOptions = {
            from: "sanathabalthar@gmail.com",
            to: email,
            subject: "Sign Up Request approved",
            text: "Your Sign Up request has been approved by admin. Please proceed to login to your account!"
        };
        await sendMail(mailOptions)
        .then((response)=>{
            if(response==="Mail sent!"){
                console.log("Mail sent!")
            }
        })
        .catch((error)=>{
        console.log("Error while sending mail: "+error)
        })
     }else{
        const mailOptions = {
            from: "sanathabalthar@gmail.com",
            to: email,
            subject: "Sign Up Request rejected",
            text: "Your Sign Up request has been rejected by admin. Please get in touch with your admin for further information!"
        };
        await sendMail(mailOptions)
        .then((response)=>{
            if(response==="Mail sent!"){
                console.log("Mail sent!")
            }
        })
        .catch((error)=>{
        console.log("Error while sending mail: "+error)
        })
     }

     let requests = await fetchReq(User_model)
     if(requests){
         res.status(200).send(requests)
     }   
    
})


module.exports = router;