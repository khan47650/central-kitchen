const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, default: null },
         duration: { type: String, enum: ["1 day", "1 week", "1 month"], default: "1 week" }

    },
    { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);