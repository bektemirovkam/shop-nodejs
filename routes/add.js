const { Router } = require("express");
const { validationResult } = require("express-validator");

const Course = require("../modules/course");
const auth = require("../middleware/auth");
const { courseValidator } = require("../utils/validators");

const router = Router();

router.get("/", auth, (req, res) => {
  res.render("add", {
    title: "Добавить курс",
    isAdd: true,
    error: req.flash("error"),
  });
});

router.post("/", auth, courseValidator, async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.status(422).render("add", {
        title: "Добавить курс",
        isAdd: true,
        error: req.flash("error"),
        data: {
          title: req.body.title,
          price: req.body.price,
          img: req.body.img,
        },
      });
    }

    const course = new Course({
      title: req.body.title,
      price: req.body.price,
      img: req.body.img,
      userId: req.user._id, // можно просто req.user
    });
    await course.save();
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
