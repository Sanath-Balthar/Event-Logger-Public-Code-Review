const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const EventKeywordsSchema = new mongoose.Schema({
                            id: ObjectId,
                            // index: Number,
                            keyword: String,
                            category: String,      
                        },{collection:"Event_Keywords"})

module.exports = (connection) => {
    return connection.model("Event_Keywords", EventKeywordsSchema);
  };;
