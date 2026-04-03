const UserSettings = require("../models/UserSettings");

exports.getSettings = async (req, res) => {
  try {
    const userId = "test_user_123";

    let settings = await UserSettings.findOne({ userId });
    
    // If not found, create defaults
    if (!settings) {
      settings = new UserSettings({ userId });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSettings = async (req, res) => {
  try {
    const userId = "test_user_123";

    const existingSettings = await UserSettings.findOne({ userId });
    if (existingSettings) {
      return res.status(400).json({ message: "Settings already exist for this user." });
    }

    const newSettings = new UserSettings({ userId });
    await newSettings.save();
    
    res.status(201).json(newSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const userId = "test_user_123";

    const {
      emailNotifications,
      smsNotifications,
      inAppNotifications,
      theme,
      defaultCategoryFilter,
      defaultStatusFilter,
      refreshInterval,
      shareAnonymousUsageData
    } = req.body;

    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...(emailNotifications !== undefined && { emailNotifications }),
          ...(smsNotifications !== undefined && { smsNotifications }),
          ...(inAppNotifications !== undefined && { inAppNotifications }),
          ...(theme !== undefined && { theme }),
          ...(defaultCategoryFilter !== undefined && { defaultCategoryFilter }),
          ...(defaultStatusFilter !== undefined && { defaultStatusFilter }),
          ...(refreshInterval !== undefined && { refreshInterval }),
          ...(shareAnonymousUsageData !== undefined && { shareAnonymousUsageData })
        }
      },
      { new: true, upsert: true }
    );

    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
