import Setting from '../models/Setting.js';

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    settings.restaurantName = req.body.restaurantName || settings.restaurantName;
    settings.phoneNumber = req.body.phoneNumber || settings.phoneNumber;
    settings.email = req.body.email || settings.email;
    settings.address = req.body.address || settings.address;
    settings.openingHours = req.body.openingHours || settings.openingHours;
    settings.deliveryCharges = req.body.deliveryCharges !== undefined ? req.body.deliveryCharges : settings.deliveryCharges;
    settings.taxPercentage = req.body.taxPercentage !== undefined ? req.body.taxPercentage : settings.taxPercentage;
    settings.facebookLink = req.body.facebookLink !== undefined ? req.body.facebookLink : settings.facebookLink;
    settings.instagramLink = req.body.instagramLink !== undefined ? req.body.instagramLink : settings.instagramLink;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

export { getSettings, updateSettings };
