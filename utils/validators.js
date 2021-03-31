const { body } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../modules/user");
const Course = require("../modules/course");

exports.registerValidators = [
  body("email", "Введите корректный email")
    .isEmail()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });

      if (user) {
        return Promise.reject("Такой email уже занят");
      }
    })
    .normalizeEmail(),
  body("password", "Некорректная длинна пароля")
    .isLength({ min: 3, max: 52 })
    .isAlphanumeric()
    .trim(),
  body("confirm")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Повторный пароль не верный");
      }
      return true;
    })
    .trim(),
  body("name")
    .isLength({ min: 3 })
    .withMessage("Минимальная длинна имени 3 символа")
    .trim(),
];

exports.loginValidators = [
  body("email", "Введите корректный email")
    .isEmail()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });

      if (!user) {
        return Promise.reject("Такого пользователя не существует");
      }
    })
    .normalizeEmail(),
  body("password")
    .trim()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: req.body.email });
      const areSame = await bcrypt.compare(value, user.password);
      if (!areSame) {
        return Promise.reject("Не правильный пароль");
      }
    }),
];

exports.resetValidators = [
  body("email", "Введите корректный email")
    .isEmail()
    .custom(async (value, { req }) => {
      const candidate = await User.findOne({ email: value });

      if (!candidate) {
        return Promise.reject("Пользователь с таким email не найден");
      }
    })
    .normalizeEmail(),
];

exports.courseValidator = [
  body("title")
    .isLength({ min: 3 })
    .withMessage("Минимальное название 3 символа")
    .isLength({ max: 50 })
    .withMessage("Максимальное название 50 символов")
    .trim(),
  body("price").isNumeric().withMessage("Введите корректную цену").trim(),
  body("img").isURL().withMessage("Введите корректный URL").trim(),
];
