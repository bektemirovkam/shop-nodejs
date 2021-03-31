const { Router } = require("express");
const Course = require("../modules/course");
const auth = require("../middleware/auth");

function mapCartItems(cart) {
  return cart.items.map((i) => ({
    ...i.courseId.toJSON(),
    id: i.courseId.id,
    count: i.count,
  }));
}

function computePrice(courses) {
  return courses.reduce(
    (total, course) => total + course.price * course.count,
    0
  );
}

const router = Router();

router.get("/", auth, async (req, res) => {
  const user = await req.user.populate("cart.items.courseId").execPopulate();
  const courses = mapCartItems(user.cart);
  const price = computePrice(courses);

  res.render("cart", {
    title: "Корзина",
    isCart: true,
    courses,
    price,
  });
});

router.post("/add", auth, async (req, res) => {
  const course = await Course.findById(req.body.id);
  await req.user.addToCart(course);
  res.redirect("/cart");
});

router.delete("/remove/:id", auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id);
  const user = await req.user.populate("cart.items.courseId").execPopulate();

  const courses = mapCartItems(user.cart);
  const price = computePrice(courses);
  console.log(courses);
  res.status(200).json({
    courses,
    price,
  });
});

module.exports = router;
