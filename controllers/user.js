const { User, Category, Account } = require("../models");
const {
  generateAccessToken,
  verifyRefreshToken,
  generateRefreshToken,
} = require("../helpers/jwt");
const { comparePassword } = require("../helpers/bcrypt");

class UserController {
  static async signUp(req, res, next) {
    try {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      const accessTokenPayload = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
      const refreshTokenPayload = {
        ...accessTokenPayload,
        token_version: newUser.token_version,
      };
      const accessToken = generateAccessToken(accessTokenPayload);

      let defaultCategories = [
        { name: "Food", icon: "Utensils" },
        { name: "Snacks", icon: "Croissant" },
        { name: "Coffee", icon: "Coffee" },
        { name: "Grocery", icon: "Carrot" },
        { name: "Entertainment", icon: "Film" },
        { name: "Shopping", icon: "Shopping-cart" },
        { name: "Mortgage", icon: "Home" },
        { name: "Academic", icon: "Graduation-cap" },
        { name: "Transportation", icon: "Car" },
        { name: "Book", icon: "Book" },
        { name: "Beauty", icon: "Lipstick" },
        { name: "Donation", icon: "Hand-holding-heart" },
        { name: "Healthcare", icon: "Stethoscope" },
        { name: "Pet", icon: "Paw" },
        { name: "Gift", icon: "Gift" },
        { name: "Salary", icon: "Money" },
      ];
      defaultCategories = defaultCategories.map((defaultCategory) => ({
        ...defaultCategory,
        UserId: newUser.id,
      }));

      await Category.bulkCreate(defaultCategories);
      await Account.create({
        name: "Cash",
        current_balance: 0,
        UserId: newUser.id,
      });

      res.cookie("jid", generateRefreshToken(refreshTokenPayload), {
        httpOnly: true,
      });
      res.status(201).json({ access_token: accessToken });
    } catch (error) {
      next(error);
    }
  }

  static signIn(req, res, next) {
    User.findOne({
      where: {
        email: req.body.email,
      },
    })
      .then((user) => {
        if (user) {
          let passwordMatched = comparePassword(
            req.body.password,
            user.password
          );

          if (passwordMatched) {
            const accessTokenPayload = {
              id: user.id,
              name: user.name,
              email: user.email,
            };
            const refreshTokenPayload = {
              ...accessTokenPayload,
              token_version: user.token_version,
            };

            const accessToken = generateAccessToken(accessTokenPayload);
            res.cookie("jid", generateRefreshToken(refreshTokenPayload), {
              httpOnly: true,
            });
            res.status(200).json({ access_token: accessToken });
          } else {
            next({
              status: 400,
              message: "Invalid email/password",
            });
          }
        } else {
          next({
            status: 400,
            message: "Invalid email/password",
          });
        }
      })
      .catch((err) => {
        next(err);
      });
  }

  static async generateNewToken(req, res, next) {
    const token = req.cookies?.jid;
    if (!token) {
      return res.status(401).json({ authenticated: false, access_token: "" });
    }

    let decoded = null;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      console.log(error);
      return res.status(401).json({ authenticated: false, access_token: "" });
    }

    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ authenticated: false, access_token: "" });
    }

    console.log("database token ver: ", user.token_version);
    console.log("decoded token ver: ", decoded.token_version);
    console.log("- - - - - - - - - - - - - - - -");
    if (user.token_version !== decoded.token_version) {
      return res.status(401).json({ authenticated: false, access_token: "" });
    }

    const accessTokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    const refreshTokenPayload = {
      ...accessTokenPayload,
      token_version: user.token_version,
    };

    res.cookie("jid", generateRefreshToken(refreshTokenPayload), {
      httpOnly: true,
    });
    return res.status(200).json({
      authenticated: true,
      access_token: generateAccessToken(accessTokenPayload),
    });
  }

  static async revokeUserRefreshToken(req, res, next) {
    const token = req.cookies?.jid;
    if (!token) {
      return res.status(401).json({ authenticated: false, access_token: "" });
    }

    let decoded = null;
    try {
      decoded = verifyRefreshToken(token);
      const user = await User.findOne({ where: { id: decoded.id } });
      await User.increment({ token_version: 1 }, { where: { id: user.id } });
      res.status(200).json({ message: "user revoked", user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
