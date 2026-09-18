const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
      required: true,
      index: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    referrer: {
      type: String,
      default: "Direct",
      trim: true,
    },

    deviceType: {
      type: String,
      enum: ["Mobile", "Desktop", "Tablet", "Unknown"],
      default: "Unknown",
    },

    ipHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Click", clickSchema);