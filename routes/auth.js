const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const verifyToken = (req, res, next) => {
  const bearerHeader = req.header("Authorization");

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, "your_jwt_secret", (err, authData) => {
      if (err) {
        res.status(200).json({ err, statis: false });
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    res.status(200).json({ err: "bearerHeader undefined", statis: false });
  }
};

// Sign up
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);

  try {
    let userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res
        .status(200)
        .json({ msg: "User with this email already exists", status: false });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(200)
        .json({ msg: "User already exists", status: false });
    }

    user = new User({
      username,
      email,
      password,
      type: null,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(200).json({ msg: "User created successfully", status: true });
  } catch (err) {
    console.error(err.message);
    res.status(200).json({ mgs: "Server error", status: false });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });

    if (!user) {
      return res
        .status(200)
        .json({ message: "Invalid credentials", status: false });
    }
    let isAdmin = user.type === "admin" ? true : false;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .json({ message: "Invalid password", status: false });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, "your_jwt_secret", { expiresIn: "24h" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        admin: isAdmin,
        message: "successfully Login",
        status: true,
      });
    });
  } catch (err) {
    res.status(200).json({ message: "Server error", status: false });
  }
});

// User data
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ data: users });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//remove user
router.delete("/remove/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: `User with ID ${id} not found` });
    }

    await User.deleteOne({ _id: id });
    res
      .status(200)
      .json({ message: `User with ID ${id} removed successfully` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//update user
// router.put("/update", async (req, res) => {
//   const { userName, userEmail, userId } = req.body;
//   console.log(req.body);
//   try {
//     const user = await User.findOne({ _id: userId });
//     console.log(user);
//     if (!user) {
//       return res.status(404).json({ error: `User not found` });
//     }
//     await User.updateOne(
//       { _id: userId },
//       { $set: { username: userName, email: userEmail } }
//     );
//     res.status(200).json({ message: "user successfully updated" });
//   } catch (err) {
//     res.status(500).json({ error: err });
//   }
// });

router.put("/update", verifyToken, async (req, res) => {
  const { userName, userEmail } = req.body;
  const userId = req.authData.user.id;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: `User not found`, status: false });
    }
    await User.updateOne(
      { _id: userId },
      { $set: { username: userName, email: userEmail } }
    );
    res
      .status(200)
      .json({ message: "user successfully updated", status: true });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.post("/user", verifyToken, async (req, res) => {
  const userId = req.authData.user.id;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: `User not found`, status: false });
    }

    res.status(200).json({
      message: "user successfully updated",
      status: true,
      userName: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
