const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../models/AdminSchema");
const Sclass = require('../models/SclassSchema.js');
const Student = require('../models/StudentSchema.js');
const Mentor = require('../models/MentorSchema.js');
const Course = require('../models/CourseSchema.js');
const Notice = require('../models/NoticeSchema.js');
const Complain = require('../models/ComplainSchema.js');

const router = express.Router();

// POST /auth/register
router.post("/AdminReg", async (req, res) => {
  try {
      const admin = new Admin({
          ...req.body
      });

      const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
      const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

      if (existingAdminByEmail) {
          res.send({ message: 'Email already exists' });
      }
      else if (existingSchool) {
          res.send({ message: 'School name already exists' });
      }
      else {
          let result = await admin.save();
          result.password = undefined;
          res.send(result);
      }
  } catch (err) {
      res.status(500).json(err);
  }
});

router.get("/Admin/:id", async (req, res) => {
  try {
      let Admin = await admin.findById(req.params.id);
      if (Admin) {
          Admin.password = undefined;
          res.send(Admin);
      }
      else {
          res.send({ message: "No admin found" });
      }
  } catch (err) {
      res.status(500).json(err);
  }
})


//get all authenticated users
router.get('/', async (req, res) => {
  try {
  const Admin = await admin.find();
    res.json(Admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/login
router.post("/AdminLogin",async (req, res) => {
 try {
  if (req.body.email && req.body.password) {
    let admin = await Admin.findOne({ email: req.body.email });
    if (admin) {
        const passwordMatch = await bcrypt.compare(req.body.password, admin.password);
        if (passwordMatch) {
            admin.password = undefined;
            res.send(admin);
        } else {
            res.send({ message: "Invalid password" });
        }
    } else {
        res.send({ message: "User not found" });
    }
} else {
    res.send({ message: "Email and password are required" });
}
const payload = {
  Admin: {
    name: Admin.name,
    id: Admin._id,
    institution_Name:Admin.institutionName,
    role: Admin.role,
  },
};

jwt.sign(
  payload,
  process.env.JWT_SECRET,
  { expiresIn: "1h" },
  (err, token) => {
    if (err) throw err;
    res.json({ token });
  }
)
  
}catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
})


// GET /auth/logout
router.get("/logout", (req, res) => {
  res.json({ msg: "Admin logged out successfully" });
});

module.exports = router;