const { Router } = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const { loginValidators } = require("../utils/validators");
const { registerValidators } = require("../utils/validators");
const { resetValidators } = require("../utils/validators");

const User = require("../modules/user");
const regEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bektemirovkam10@gmail.com",
    pass: "220780lzifhfuf",
  },
});
const router = Router();

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Авторизация",
    isLogin: true,
    loginError: req.flash("loginError"),
    registerError: req.flash("registerError"),
  });
});

router.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    } else {
      res.redirect("/auth/login");
    }
  });
});

router.post("/login", loginValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("loginError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#login");
    }

    req.session.user = await User.findOne({ email: req.body.email });
    req.session.isAuthenticated = true;
    req.session.save((err) => {
      if (err) {
        throw err;
      } else {
        res.redirect("/");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("registerError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashPassword,
      name,
      cart: { items: [] },
    });
    await user.save();

    res.redirect("/auth/login#login");

    await transporter.sendMail(regEmail(email), (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent:" + info.response);
      }
    }); // рек-ся после редиректа, чтобы пользователь не ждал
  } catch (error) {
    console.log(error);
  }
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Забыли пароль?",
    error: req.flash("error"),
  });
});

router.post("/reset", resetValidators, (req, res) => {
  try {
    // чтобы создать токен, используем встроенный модуль crypto
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Произошла ошибка, попробуйте позднее");
        res.redirect("/auth/reset");
      } else {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          req.flash("error", errors.array()[0].msg);
          return res.status(422).redirect("/auth/reset");
        }

        const candidate = await User.findOne({ email: req.body.email });
        const token = buffer.toString("hex");
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect("/auth/login");
      }
    });
  } catch (error) {
    req.flash("error", "Произошла ошибка, попробуйте позднее");
    res.redirect("/auth/reset");
  }
});

router.get("/password/:token", async (req, res) => {
  try {
    if (!req.params.token) {
      return res.redirect("/auth/login");
    } else {
      const candidate = await User.findOne({
        resetToken: req.params.token,
        resetTokenExp: { $gt: Date.now() },
      });

      if (!candidate) {
        req.flash("loginError", "Время жизни токена истекло");
        return res.redirect("/auth/login");
      } else {
        res.render("auth/password", {
          title: "Восстановление пароля",
          error: req.flash("error"),
          userId: candidate._id.toString(),
          token: req.params.token,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/password", async (req, res) => {
  try {
    const candidate = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!candidate) {
      req.flash("loginError", "Время жизни токена истекло");
      res.redirect("/auth/login");
    } else {
      candidate.password = await bcrypt.hash(req.body.password, 10);
      candidate.resetToken = undefined;
      candidate.resetTokenExp = undefined;
      await candidate.save();
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
