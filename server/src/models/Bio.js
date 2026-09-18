const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const customLinkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const bioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },

    theme: {
      type: String,
      enum: [
        "minimal-light",
        "dark-slate",
        "gradient",
        "cyberpunk",
        "velvet-crimson",
        "emerald-matrix",
      ],
      default: "dark-slate",
    },

    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },

    links: {
      type: [customLinkSchema],
      default: [],
    },

    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bio", bioSchema);
