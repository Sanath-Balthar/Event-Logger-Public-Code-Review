const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const CompanySchema = new mongoose.Schema({
                    id: ObjectId,
                    company_name: String,
                    mode: { type: Boolean, default: false } // 🆕 New field for admin approval
                }, { collection: "Company_Details" });

module.exports = (connection) => {
    return connection.model('Company_Details', CompanySchema);
  };

