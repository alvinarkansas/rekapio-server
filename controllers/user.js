const { User, Category, Account } = require("../models");
const { generateToken } = require("../helpers/jwt");
const { comparePassword } = require("../helpers/bcrypt");

class UserController {
  static async signUp(req, res, next) {
    try {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      const payload = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
      const token = generateToken(payload);

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

      res.status(201).json({ token });
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
            const payload = { id: user.id, name: user.name, email: user.email };
            const token = generateToken(payload);
            res.status(200).json({ token });
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
}

module.exports = UserController;
