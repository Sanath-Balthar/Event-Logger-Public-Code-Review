const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

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
            console.log("Mail Response: ", mailResponse);
            return "Mail sent!";
    } catch (error) {
        console.log("Error while sending mail in sendMail: " + error);
        throw new Error("Mail Error");
    }
};

module.exports = sendMail;