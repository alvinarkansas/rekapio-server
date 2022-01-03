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
        { name: "Food", icon: "Utensils", color: "#FA982A" },
        { name: "Snacks", icon: "Croissant", color: "#F9C43B" },
        { name: "Coffee", icon: "Coffee", color: "#E88873" },
        { name: "Grocery", icon: "Carrot", color: "#FE5B62" },
        { name: "Entertainment", icon: "Film", color: "#A54D53" },
        { name: "Shopping", icon: "Shopping-cart", color: "#E840E1" },
        { name: "Mortgage", icon: "Home", color: "#EA25A7" },
        { name: "Academic", icon: "Graduation-cap", color: "#831985" },
        { name: "Transportation", icon: "Car", color: "#A6009F" },
        { name: "Book", icon: "Book", color: "#73CDFF" },
        { name: "Beauty", icon: "Lipstick", color: "#25A3EA" },
        { name: "Donation", icon: "Hand-holding-heart", color: "#FF7A00" },
        { name: "Healthcare", icon: "Stethoscope", color: "#3B708D" },
        { name: "Pet", icon: "Paw", color: "#6CAD9D" },
        { name: "Gift", icon: "Gift", color: "#B5446E" },
        { name: "Salary", icon: "Money", color: "#0DA666" },
      ];
      defaultCategories = defaultCategories.map((defaultCategory) => ({
        ...defaultCategory,
        UserId: newUser.id,
      }));

      await Category.bulkCreate(defaultCategories);
      await Account.create({
        name: "Cash",
        current_balance: 0,
        color: "#FF950A",
        UserId: newUser.id,
      });

      res.cookie("jid", generateRefreshToken(refreshTokenPayload), {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
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
              sameSite: 'None',
              secure: true,
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
