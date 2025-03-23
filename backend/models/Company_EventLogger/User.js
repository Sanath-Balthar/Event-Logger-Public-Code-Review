const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const UserSchema = new mongoose.Schema({
                    id: ObjectId,
                    username: String,
                    password: String,
                    role: String,
                    email: String,
                    company_name: String,
                    approved: { type: Boolean, default: false } // 🆕 New field for admin approval
                }, { collection: "User_credentials" });


module.exports = (connection) => {
    return connection.model("User", UserSchema);
  };

