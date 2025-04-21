const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config.json");
const { default: mongoose } = require("mongoose");

const verifyJWToken = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        console.log("token received: "+token)
        if (!token) return res.status(401).json({ error: "Invalid token" });
    
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        req.user = decoded; // Store user info in request  
        // console.log("Middleware decoded user: ",req.user);
        const connection = mongoose.connections.filter((element)=>{return element.name===req.user.dbName})
        // console.log("Existing DB connection name: ",connection[0])
        const models = Object.values(connection[0].models);
        // console.log("Middleware Models: ",models); 
        req.models = models;   
          
        next();
    } catch (error) {
        console.log("Error in verifyJWToken: ",error)
        return res.status(401).json({ error: "Invalid token" });
    }
};

const authorizeRoles = (roles) => {
    return (req, res, next) => {
       try {
         // console.log("Middleware Models: ",req.user.models);
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ error: "Unauthorized" });
            }
            next();
       } catch (error) {
        console.log("Error in verifyJWToken: ",error)
        return res.status(403).json({ error: "Unauthorized" });
       }
    };
};


module.exports={verifyJWToken,authorizeRoles}