const Bio = require("../models/Bio");

const RESERVED_USERNAMES = new Set([
  "api", "admin", "administrator", "login", "signup", "logout", "register",
  "forgot-password", "reset-password", "refresh", "users", "links", "r",
  "bio", "dashboard", "settings", "profile", "favicon.ico", "health", "auth",
  "null", "undefined", "app", "help", "support", "terms", "privacy", "about", "contact"
]);

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidUsername = (username) => /^[a-zA-Z0-9_-]+$/.test(username);

const THEME_MAP = {
  "minimal-light": "minimal-light",
  "minimal light": "minimal-light",
  "dark-slate": "dark-slate",
  "dark slate": "dark-slate",
  "gradient": "gradient",
  "cyberpunk": "cyberpunk",
  "velvet-crimson": "velvet-crimson",
  "emerald-matrix": "emerald-matrix",
};

const normalizeTheme = (theme) => {
  if (!theme || typeof theme !== "string") return null;
  return THEME_MAP[theme.trim().toLowerCase()] || null;
};

const validateSocialLinks = (socialLinks) => {
  if (!Array.isArray(socialLinks)) {
    return { valid: false, message: "Social links must be an array" };
  }

  for (let i = 0; i < socialLinks.length; i++) {
    const item = socialLinks[i];
    if (!item || typeof item !== "object") {
      return { valid: false, message: `Social link at index ${i} is invalid` };
    }
    if (!item.platform || typeof item.platform !== "string" || !item.platform.trim()) {
      return { valid: false, message: `Social link at index ${i} requires a platform name` };
    }
    if (!item.url || typeof item.url !== "string" || !isValidUrl(item.url.trim())) {
      return { valid: false, message: `Social link '${item.platform}' must have a valid URL` };
    }
  }

  return { valid: true };
};

const validateCustomLinks = (links) => {
  if (!Array.isArray(links)) {
    return { valid: false, message: "Custom links must be an array" };
  }

  for (let i = 0; i < links.length; i++) {
    const item = links[i];
    if (!item || typeof item !== "object") {
      return { valid: false, message: `Link at index ${i} is invalid` };
    }
    if (!item.title || typeof item.title !== "string" || !item.title.trim()) {
      return { valid: false, message: `Link at index ${i} requires a title` };
    }
    if (!item.url || typeof item.url !== "string" || !isValidUrl(item.url.trim())) {
      return { valid: false, message: `Link '${item.title}' must have a valid URL` };
    }
  }

  return { valid: true };
};

const createBio = async (req, res) => {
  try {
    const {
      username,
      displayName,
      bio,
      avatarUrl,
      theme,
      socialLinks,
      links,
      isPublic,
    } = req.body;

    const existingUserBio = await Bio.findOne({ userId: req.userId });
    if (existingUserBio) {
      return res.status(409).json({
        success: false,
        message: "You already have a bio profile. Please update your existing profile.",
      });
    }

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters",
      });
    }

    if (!isValidUsername(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers, hyphens and underscores",
      });
    }

    if (RESERVED_USERNAMES.has(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: "This username is reserved",
      });
    }

    const existingBio = await Bio.findOne({ username: cleanUsername });
    if (existingBio) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken",
      });
    }

    let finalAvatarUrl = "";
    if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim()) {
      const trimmed = avatarUrl.trim();
      const isDataUri = trimmed.startsWith("data:image/");
      if (!isDataUri && !isValidUrl(trimmed)) {
        return res.status(400).json({
          success: false,
          message: "Avatar URL must be a valid URL or image string",
        });
      }
      finalAvatarUrl = trimmed;
    }

    let normalizedTheme = "minimal-light";
    if (theme) {
      const parsedTheme = normalizeTheme(theme);
      if (!parsedTheme) {
        return res.status(400).json({
          success: false,
          message: "Invalid theme selected",
        });
      }
      normalizedTheme = parsedTheme;
    }

    if (socialLinks !== undefined) {
      const check = validateSocialLinks(socialLinks);
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.message });
      }
    }

    if (links !== undefined) {
      const check = validateCustomLinks(links);
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.message });
      }
    }

    const newBio = await Bio.create({
      userId: req.userId,
      username: cleanUsername,
      displayName: displayName ? displayName.trim() : "",
      bio: bio ? bio.trim() : "",
      avatarUrl: finalAvatarUrl,
      theme: normalizedTheme,
      socialLinks: socialLinks || [],
      links: links || [],
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Bio profile created successfully",
      bio: newBio,
    });
  } catch (error) {
    console.error("Create bio error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateBio = async (req, res) => {
  try {
    const {
      username,
      displayName,
      bio,
      avatarUrl,
      theme,
      socialLinks,
      links,
      isPublic,
    } = req.body;

    const userBio = await Bio.findOne({ userId: req.userId });
    if (!userBio) {
      return res.status(404).json({
        success: false,
        message: "Bio profile not found",
      });
    }

    if (username !== undefined) {
      const cleanUsername = username.trim().toLowerCase();

      if (cleanUsername !== userBio.username) {
        if (cleanUsername.length < 3 || cleanUsername.length > 30) {
          return res.status(400).json({
            success: false,
            message: "Username must be between 3 and 30 characters",
          });
        }

        if (!isValidUsername(cleanUsername)) {
          return res.status(400).json({
            success: false,
            message: "Username can only contain letters, numbers, hyphens and underscores",
          });
        }

        if (RESERVED_USERNAMES.has(cleanUsername)) {
          return res.status(400).json({
            success: false,
            message: "This username is reserved",
          });
        }

        const usernameCollision = await Bio.findOne({
          username: cleanUsername,
          _id: { $ne: userBio._id },
        });

        if (usernameCollision) {
          return res.status(409).json({
            success: false,
            message: "This username is already taken",
          });
        }

        userBio.username = cleanUsername;
      }
    }

    if (displayName !== undefined) {
      userBio.displayName = displayName.trim();
    }

    if (bio !== undefined) {
      userBio.bio = bio.trim();
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl && typeof avatarUrl === "string" && avatarUrl.trim()) {
        const trimmed = avatarUrl.trim();
        const isDataUri = trimmed.startsWith("data:image/");
        if (!isDataUri && !isValidUrl(trimmed)) {
          return res.status(400).json({
            success: false,
            message: "Avatar URL must be a valid URL",
          });
        }
        userBio.avatarUrl = trimmed;
      } else {
        userBio.avatarUrl = "";
      }
    }

    if (theme !== undefined) {
      const parsedTheme = normalizeTheme(theme);
      if (!parsedTheme) {
        return res.status(400).json({
          success: false,
          message: "Invalid theme selected",
        });
      }
      userBio.theme = parsedTheme;
    }

    if (socialLinks !== undefined) {
      const check = validateSocialLinks(socialLinks);
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.message });
      }
      userBio.socialLinks = socialLinks;
    }

    if (links !== undefined) {
      const check = validateCustomLinks(links);
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.message });
      }
      userBio.links = links;
    }

    if (isPublic !== undefined) {
      userBio.isPublic = Boolean(isPublic);
    }

    await userBio.save();

    return res.status(200).json({
      success: true,
      message: "Bio profile updated successfully",
      bio: userBio,
    });
  } catch (error) {
    console.error("Update bio error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMyBio = async (req, res) => {
  try {
    const userBio = await Bio.findOne({ userId: req.userId });

    if (!userBio) {
      return res.status(404).json({
        success: false,
        message: "Bio profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      bio: userBio,
    });
  } catch (error) {
    console.error("Get my bio error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getPublicBio = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    const bioDoc = await Bio.findOne({
      username: cleanUsername,
      isPublic: true,
    });

    if (!bioDoc) {
      return res.status(404).json({
        success: false,
        message: "Bio profile not found",
      });
    }

    const activeLinks = (bioDoc.links || [])
      .filter((link) => link.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((link) => ({
        id: link._id,
        title: link.title,
        url: link.url,
        icon: link.icon || "",
      }));

    return res.status(200).json({
      success: true,
      bio: {
        username: bioDoc.username,
        displayName: bioDoc.displayName || bioDoc.username,
        bio: bioDoc.bio || "",
        avatarUrl: bioDoc.avatarUrl || "",
        theme: bioDoc.theme || "minimal-light",
        socialLinks: bioDoc.socialLinks || [],
        links: activeLinks,
        createdAt: bioDoc.createdAt,
        updatedAt: bioDoc.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get public bio error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createBio,
  updateBio,
  getMyBio,
  getPublicBio,
  isValidUsername,
  isValidUrl,
  normalizeTheme,
};
