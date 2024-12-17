const db = require("../model/db"); // Import your DB connection
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  const foundUser = await db.getUserByUsername(username);
  console.log(foundUser);

  if (!foundUser || foundUser.length == 0 || !foundUser[0].active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser[0].password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        name: foundUser[0].name,
        username: foundUser[0].username,
        roles: foundUser[0].roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser[0].username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    // secure: process.env.NODE_ENV === "production", // TO TURN OFF WHEN DEPLOY!!
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Send accessToken containing username and roles
  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  console.log("Refreshing");
  const cookies = req.cookies;
  console.log(cookies);
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundUser = await db.getUserByUsername(decoded.username);

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            name: foundUser[0].name,
            username: foundUser[0].username,
            roles: foundUser[0].roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    }
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
