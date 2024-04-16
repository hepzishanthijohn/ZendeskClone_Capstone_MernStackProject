const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../models/AdminSchema");
const router = express.Router();

// POST /auth/register
router.post("/register", async (req, res) => {
  const { name, email, password,institutionName } = req.body;

  try {
    let Admin = await admin.findOne({ email });
    if (Admin) {
      return res.status(400).json({ msg: "Admin already exists" });
    }

    Admin = new admin({
      name,
      email,
      password,
      institutionName
    });

    await Admin.save();
    // const payload = {
    //     user: {
    //       id: user._id,
    //     },
    //   };
    res.status(201).json({ msg: "Admin registered successfully" });

    

    // jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }),
    //   (err, token) => {
    //     if (err) throw err;
    //     res.json({ token });
    //   };
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
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
router.post("/login", async (req, res) => {
  const {email, password} = req.body;
  const name =req.body;

  try {
    let Admin = await admin.findOne({ email });
    if (!Admin) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }else{
      console.log(Admin.name)
    }

    const isMatch = await bcrypt.compare(password, Admin.password,console.log(Admin.name));
    
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
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
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// GET /auth/logout
router.get("/logout", (req, res) => {
  res.json({ msg: "Admin logged out successfully" });
});

module.exports = router;