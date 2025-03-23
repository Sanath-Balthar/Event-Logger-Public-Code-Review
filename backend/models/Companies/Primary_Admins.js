const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const Primary_Admins_Schema = new mongoose.Schema({
                    id: ObjectId,
                    company_name: String,
                    username: String,
                    password: String,
                    role: String,
                    email: String,
                    approved: { type: Boolean, default: false } // 🆕 New field for admin approval
                }, { collection: "Primary_Admins" });


module.exports = (connection) => {
    return connection.model("Primary_Admins", Primary_Admins_Schema);
};

