import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'Account already exists. Please login.' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: 'customer'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Add a new staff member
// @route   POST /api/users/staff
// @access  Private/Boss
const addStaff = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!['admin', 'kitchen', 'driver'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role assignment' });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'Account already exists.' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  user.lastLogin = new Date();
  user.deviceInfo = req.headers['user-agent'] || 'Unknown Device';
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      favorites: user.favorites,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.vehicleDetails !== undefined) user.vehicleDetails = req.body.vehicleDetails;
      if (req.body.isOnline !== undefined) user.isOnline = req.body.isOnline;
      if (req.body.emergencyContact !== undefined) user.emergencyContact = req.body.emergencyContact;
      if (req.body.dateOfBirth !== undefined) user.dateOfBirth = req.body.dateOfBirth;
      if (req.body.vehicleType !== undefined) user.vehicleType = req.body.vehicleType;
      if (req.body.vehicleBrand !== undefined) user.vehicleBrand = req.body.vehicleBrand;
      if (req.body.vehicleModel !== undefined) user.vehicleModel = req.body.vehicleModel;
      if (req.body.insuranceStatus !== undefined) user.insuranceStatus = req.body.insuranceStatus;
      if (req.body.licenseNumber !== undefined) user.licenseNumber = req.body.licenseNumber;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        vehicleDetails: updatedUser.vehicleDetails,
        isOnline: updatedUser.isOnline,
        emergencyContact: updatedUser.emergencyContact,
        dateOfBirth: updatedUser.dateOfBirth,
        vehicleType: updatedUser.vehicleType,
        vehicleBrand: updatedUser.vehicleBrand,
        vehicleModel: updatedUser.vehicleModel,
        insuranceStatus: updatedUser.insuranceStatus,
        licenseNumber: updatedUser.licenseNumber,
        lastLogin: updatedUser.lastLogin,
        deviceInfo: updatedUser.deviceInfo,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: error.message || 'Server Error Updating Profile' });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query.role = 'customer';
    }
    const users = await User.find(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === 'boss') {
        return res.status(400).json({ message: 'Cannot delete a boss account' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// @desc    Update user (including role and isDisabled)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      if (req.body.isDisabled !== undefined) {
        user.isDisabled = req.body.isDisabled;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isDisabled: updatedUser.isDisabled,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export { authUser, registerUser, addStaff, getUserProfile, updateUserProfile, getUsers, deleteUser, updateUser };
