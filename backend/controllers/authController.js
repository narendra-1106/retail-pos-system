const User = require("../models/User");
const Otp = require("../models/Otp");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const twilio = require("twilio");


// REGISTER USER

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role: requestedRole } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ message: "Name, password and email or phone are required" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const usersCount = await User.countDocuments();

    // Determine who is creating this user. If first user ever, allow creating admin.
    let creatorIsAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        if (decoded && decoded.role === "admin") creatorIsAdmin = true;
      } catch (e) {
        // ignore
      }
    }

    if (usersCount > 0 && !creatorIsAdmin) {
      return res.status(403).json({ message: "Only admin can create new users" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleToSet = usersCount === 0 ? (requestedRole === "admin" ? "admin" : "admin") : (requestedRole === "admin" && creatorIsAdmin ? "admin" : "user");

    const user = await User.create({ name, email, phone, password: hashedPassword, role: roleToSet });

    res.status(201).json({ message: "User Registered Successfully", user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOGIN USER

const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const secret = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, secret, { expiresIn: "1d" });

    res.status(200).json({ message: "Login Successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// OTP helpers and handlers
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (req, res) => {
  try {
    const { identifier } = req.body; // email or phone
    if (!identifier) return res.status(400).json({ message: "Identifier required" });

    const otpCode = generateOtpCode();
    const hashed = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // remove old OTPs for identifier
    await Otp.deleteMany({ identifier });

    await Otp.create({ identifier, otpHash: hashed, expiresAt });

    // send via email if looks like email
    if (identifier.includes("@")) {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: identifier,
          subject: "Your OTP Code",
          text: `Your OTP code is ${otpCode}. It expires in 10 minutes.`
        });
      } else {
        console.log(`OTP for ${identifier}: ${otpCode}`);
      }
    } else {
      // phone number -> use Twilio if available
      if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM) {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        await client.messages.create({
          body: `Your OTP code is ${otpCode}`,
          from: process.env.TWILIO_FROM,
          to: identifier
        });
      } else {
        console.log(`OTP for ${identifier}: ${otpCode}`);
      }
    }

    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) return res.status(400).json({ message: "Identifier and OTP required" });

    const record = await Otp.findOne({ identifier });
    if (!record) return res.status(400).json({ message: "OTP not found or expired" });

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ identifier });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.attempts >= 5) {
      await Otp.deleteMany({ identifier });
      return res.status(400).json({ message: "Too many attempts" });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      record.attempts = (record.attempts || 0) + 1;
      await record.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // valid - remove otp
    await Otp.deleteMany({ identifier });

    // find or create user
    let user;
    if (identifier.includes("@")) {
      user = await User.findOne({ email: identifier });
      if (!user) {
        user = await User.create({ name: identifier.split("@")[0], email: identifier });
      }
    } else {
      user = await User.findOne({ phone: identifier });
      if (!user) {
        user = await User.create({ name: identifier, phone: identifier });
      }
    }

    const secret = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, secret, { expiresIn: "1d" });

    res.status(200).json({ message: "OTP verified", token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  sendOtp,
  verifyOtp
};