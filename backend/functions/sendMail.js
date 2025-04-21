const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const { stat } = require("fs");

dotenv.config();

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMail = async (mailOptions) => {

        try {
        
            let mailResponse = await transporter.sendMail(mailOptions);
            console.log("Mail Response: ", mailResponse.response);
            return "Mail sent!";
    } catch (error) {
        console.log("Error while sending mail in sendMail: ", error);
        // console.log("Error while sending mail in sendMail, message: ", error.message);
        if(error.message==="No recipients defined"){
            const customError = new Error("Email id invalid");
            customError.status = 550; // Attach the status code
            throw customError;
        }else{
            const customError = new Error("Transaction failed");
            customError.status = 554; // Attach the status code
            throw customError;
        }
        
    }
};

module.exports = sendMail;