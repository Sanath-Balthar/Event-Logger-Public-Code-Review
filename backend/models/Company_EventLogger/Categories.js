const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const CategoriesSchema = new mongoose.Schema({
                        id: ObjectId,
                        name: String,
                        priority: Number,      
                    },{collection:"Categories"})


module.exports = (connection) => {
    return connection.model("Categories", CategoriesSchema);
  };