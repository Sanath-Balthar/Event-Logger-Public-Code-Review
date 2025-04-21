const express = require("express");
const https  = require("https");
// const { createConnection } = require("net");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const path = require('path');
const authRoutes = require("./routes/authRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js")
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require('fs');
const { verifyJWToken, authorizeRoles } = require("./routes/middleware.js");
const superAdminRoutes = require("./routes/superAdminRoutes.js");
const sendMail = require("./functions/sendMail.js");
const multer = require("multer");
const upload = multer(); // Use multer to handle file uploads



const startServer = () => {
    const app = express();

    const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : process.env.NODE_ENV === 'stage' ? '.env.stage' : '.env';
    dotenv.config({ path: envFile, override: true });

    console.log("🔍 Loading environment from:", envFile);
    console.log("🔍 Current NODE_ENV:", process.env.NODE_ENV);

    const origin = process.env.ORIGIN;


    app.use(cors({
        origin: origin,
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
        credentials: true, // If you want to allow cookies or authorization headers
        allowedHeaders: ["Content-Type", "Authorization"], // ✅ Explicitly allow headers
    }));
    app.use(express.json()); 
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));

    console.log("Reached before routes")
    app.use("/auth",authRoutes);
    app.use("/event",eventRoutes);
    app.use("/superAdmin", superAdminRoutes)
    app.post("/sendMail", verifyJWToken,authorizeRoles(["admin"]) , upload.single("file"), async(req,res)=>{
        
        try { 
                const email = req.body.email;
                const file = req.file; // Access the uploaded file

                if (!file) {
                    return res.status(400).json({ error: "No file uploaded" });
                }

                console.log("Email: " + email);
                console.log("File received: " + file.originalname);

                // const textData = data.map(element => `${element.timeStamp}, ${element.eventName}, ${element.category}`).join("\n");

                const mailOptions = {
                    from: "sanathabalthar@gmail.com",
                    to: email,
                    subject: "Event Data",
                    text: "Please find the attached event log file.",
                    attachments: [
                        {
                            filename: file.originalname, // Use the original file name
                            content: file.buffer, // Use the file buffer
                        },
                    ],
                };

                const response = await sendMail(mailOptions);
                console.log("sendMail function Response: "+response)
                if(response==="Mail sent!"){
                    return res.status(200).send("Mail sent!")
                }
                
            } catch (error) {
                console.log("Error while sending mail: ",error)
                if(error.status===550){
                    return res.status(550).json({error:"Invalid Request - Check email id"});
                }else if(error.status===554){
                    return res.status(554).json({error:"Transaction failed"});
                }else{
                    return res.status(500).json({error:"An error occured at backend server"})
                }
                
            }
    })


    app.get("/test", async(req,res)=>{
        res.json({ message: "Hello from AWS Lightsail Backend!" });
    })

    console.log("Reached after routes")
    const port = process.env.PORT;
    const hostname = process.env.HOST_NAME;

    return new Promise((resolve, reject) => {
        const server = app.listen(port,hostname,function(err){
            if(err){
                console.log("Error ", err);
            }else{
                console.log("Web Server is now running on Port: ",port, "in the environment: ",process.env.NODE_ENV,", hostname: ",hostname, ", origin: ",origin );
                resolve(server);
            }
        });
    })

}

module.exports = startServer;