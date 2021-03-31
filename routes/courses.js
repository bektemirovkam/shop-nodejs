const { Router } = require("express");
const { validationResult } = require("express-validator");

const { courseValidator } = require("../utils/validators");
const Course = require("../modules/course");
const auth = require("../middleware/auth");

const isOwner = function (course, req) {
  return course.userId._id.toString() === req.user._id.toString();
};

const router = Router();

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({})
      .lean()
      .populate("userId", "email name");
    res.render("courses", {
      title: "Курсы",
      isCourses: true,
      courses,
      currentUserId: req.user ? req.user._id.toString() : null,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect("/");
  }

  try {
    const course = await Course.findById(req.params.id).lean();

    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }

    res.render("course-edit", {
      title: `Редактирование курса ${course.title}`,
      error: req.flash("error"),
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/edit", auth, courseValidator, async (req, res) => {
  const errors = validationResult(req);
  const { id } = req.body;

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
  }
  try {
    delete req.body.id;
    const course = await Course.findById(id);

    if (!isOwner(course, req)) {
      return redirect("/courses");
    }

    Object.assign(course, req.body);

    await course.save();

    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    res.render("course", {
      layout: "epmty",
      title: `Курс по ${course.title}`,
      course,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/delete", auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId: req.user._id,
    });
    res.redirect("/courses");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
