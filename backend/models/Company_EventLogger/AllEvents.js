const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

const AllEventsSchema = new mongoose.Schema({
                        id: ObjectId,
                        // index: Number,
                        eventName: String,
                        category: String,
                        timeStamp: Date        
                    },{collection:"All_Events"});

module.exports = (connection) => {
    return connection.model("AllEvents", AllEventsSchema);
  };

