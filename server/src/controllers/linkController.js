const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const crypto = require("crypto");
const Link = require("../models/Link");
const Click = require("../models/Click");

const RESERVED_SLUGS = new Set([
  "api", "admin", "login", "signup", "logout", "register", "forgot-password",
  "reset-password", "refresh", "users", "links", "r", "bio", "dashboard",
  "settings", "profile", "favicon.ico"
]);

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidSlug = (slug) => /^[a-zA-Z0-9_-]+$/.test(slug);

const getDeviceType = (userAgent = "") => {
  const ua = userAgent.toLowerCase();
  if (ua.includes("ipad") || ua.includes("tablet") || (ua.includes("android") && !ua.includes("mobile"))) {
    return "Tablet";
  }
  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("ipod") || ua.includes("android")) {
    return "Mobile";
  }
  if (ua) {
    return "Desktop";
  }
  return "Unknown";
};

const hashIp = (ip) => {
  return crypto.createHash("sha256").update(ip || "unknown").digest("hex");
};

const getServerBaseUrl = (req) => {
  if (process.env.SERVER_URL) return process.env.SERVER_URL.replace(/\/$/, "");
  if (req) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.get("host");
    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`;
    }
  }
  return process.env.NODE_ENV === "production"
    ? "https://shortlink-bio-hub.onrender.com"
    : `http://localhost:${process.env.PORT || 5000}`;
};

const createLink = async (req, res) => {
  try {
    const { destinationUrl, customSlug } = req.body;

    if (!destinationUrl) {
      return res.status(400).json({
        success: false,
        message: "Destination URL is required",
      });
    }

    if (!isValidUrl(destinationUrl)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid HTTP or HTTPS URL",
      });
    }

    let shortCode;
    let isCustom = false;

    if (customSlug) {
      const cleanSlug = customSlug.trim();
      if (RESERVED_SLUGS.has(cleanSlug.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "This slug is reserved",
        });
      }

      if (!isValidSlug(cleanSlug)) {
        return res.status(400).json({
          success: false,
          message: "Custom slug can contain only letters, numbers, hyphens and underscores",
        });
      }

      if (cleanSlug.length < 3 || cleanSlug.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Custom slug must be between 3 and 30 characters",
        });
      }

      const existingLink = await Link.findOne({ shortCode: cleanSlug });
      if (existingLink) {
        return res.status(409).json({
          success: false,
          message: "This custom slug is already taken",
        });
      }

      shortCode = cleanSlug;
      isCustom = true;
    } else {
      let isUnique = false;
      while (!isUnique) {
        shortCode = nanoid(6);
        const existingLink = await Link.findOne({ shortCode });
        if (!existingLink) {
          isUnique = true;
        }
      }
    }

    const link = await Link.create({
      userId: req.userId,
      destinationUrl,
      shortCode,
      isCustom,
    });

    const serverUrl = getServerBaseUrl(req);
    const shortUrl = `${serverUrl}/r/${shortCode}`;

    return res.status(201).json({
      success: true,
      message: "Short link created successfully",
      link: {
        id: link._id,
        destinationUrl: link.destinationUrl,
        shortCode: link.shortCode,
        shortUrl,
        isCustom: link.isCustom,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    console.error("Create link error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMyLinks = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (page - 1) * limit;

    const filter = { userId: req.userId };

    if (search.trim()) {
      filter.$or = [
        { destinationUrl: { $regex: search.trim(), $options: "i" } },
        { shortCode: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [links, totalLinks, allUserLinks] = await Promise.all([
      Link.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Link.countDocuments(filter),
      Link.find({ userId: req.userId }).select("_id"),
    ]);

    const allUserLinkIds = allUserLinks.map((l) => l._id);
    const pageLinkIds = links.map((l) => l._id);

    const [clickCounts, totalClicks] = await Promise.all([
      pageLinkIds.length > 0
        ? Click.aggregate([
            { $match: { linkId: { $in: pageLinkIds } } },
            { $group: { _id: "$linkId", count: { $sum: 1 } } },
          ])
        : [],
      allUserLinkIds.length > 0
        ? Click.countDocuments({ linkId: { $in: allUserLinkIds } })
        : 0,
    ]);

    const clickMap = {};
    clickCounts.forEach((c) => {
      clickMap[c._id.toString()] = c.count;
    });

    const serverUrl = getServerBaseUrl(req);
    const formattedLinks = links.map((link) => ({
      id: link._id,
      destinationUrl: link.destinationUrl,
      shortCode: link.shortCode,
      shortUrl: `${serverUrl}/r/${link.shortCode}`,
      isCustom: link.isCustom,
      clicks: clickMap[link._id.toString()] || 0,
      createdAt: link.createdAt,
    }));

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalLinks,
      totalPages: Math.ceil(totalLinks / limit),
      totalClicks,
      links: formattedLinks,
    });
  } catch (error) {
    console.error("Get links error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSingleLink = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    const link = await Link.findOne({ _id: id, userId: req.userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    const clicks = await Click.countDocuments({ linkId: link._id });

    return res.status(200).json({
      success: true,
      link: {
        id: link._id,
        destinationUrl: link.destinationUrl,
        shortCode: link.shortCode,
        shortUrl: `${getServerBaseUrl(req)}/r/${link.shortCode}`,
        isCustom: link.isCustom,
        clicks,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get single link error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    const link = await Link.findOne({ _id: id, userId: req.userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    await Link.deleteOne({ _id: id, userId: req.userId });
    await Click.deleteMany({ linkId: id });

    return res.status(200).json({
      success: true,
      message: "Link deleted successfully",
    });
  } catch (error) {
    console.error("Delete link error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const redirectLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await Link.findOne({ shortCode });
    if (!link) {
      return res.status(404).send("Short link not found");
    }

    const userAgent = req.get("user-agent") || "";
    const referrer = req.get("referer") || req.get("referrer") || "Direct";
    const forwardedIp = req.headers["x-forwarded-for"];
    const ip = forwardedIp?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const deviceType = getDeviceType(userAgent);
    const ipHash = hashIp(ip);

    // Asynchronously log click
    setImmediate(async () => {
      try {
        await Click.create({
          linkId: link._id,
          timestamp: new Date(),
          referrer,
          deviceType,
          ipHash,
        });
      } catch (clickError) {
        console.error("Async click tracking error:", clickError);
      }
    });

    return res.redirect(302, link.destinationUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).send("Server error");
  }
};

const getLinkAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid link ID format",
      });
    }

    const link = await Link.findOne({ _id: id, userId: req.userId });
    if (!link) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    const totalClicks = await Click.countDocuments({ linkId: id });

    const clicksOverTime = await Click.aggregate([
      { $match: { linkId: link._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          clicks: 1,
        },
      },
    ]);

    const topReferrers = await Click.aggregate([
      { $match: { linkId: link._id } },
      {
        $group: {
          _id: "$referrer",
          clicks: { $sum: 1 },
        },
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          referrer: "$_id",
          clicks: 1,
        },
      },
    ]);

    const deviceDistribution = await Click.aggregate([
      { $match: { linkId: link._id } },
      {
        $group: {
          _id: "$deviceType",
          clicks: { $sum: 1 },
        },
      },
      { $sort: { clicks: -1 } },
      {
        $project: {
          _id: 0,
          device: "$_id",
          clicks: 1,
        },
      },
    ]);

    const topDevice = deviceDistribution.length > 0 ? deviceDistribution[0].device : null;
    const topReferrer = topReferrers.length > 0 ? topReferrers[0].referrer : null;

    return res.status(200).json({
      success: true,
      link: {
        id: link._id,
        shortCode: link.shortCode,
        shortUrl: `${getServerBaseUrl(req)}/r/${link.shortCode}`,
        destinationUrl: link.destinationUrl,
      },
      analytics: {
        totalClicks,
        clicksOverTime,
        topReferrers,
        deviceDistribution,
        referrers: topReferrers,
        devices: deviceDistribution,
        topDevice,
        topReferrer,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createLink,
  getMyLinks,
  getSingleLink,
  deleteLink,
  redirectLink,
  getLinkAnalytics,
};