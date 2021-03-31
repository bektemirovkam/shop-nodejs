const { Router } = require("express");
const Order = require("../modules/order");
const auth = require("../middleware/auth");

const router = Router();

router.get("/", auth, async (req, res) => {
  const orders = await Order.find({
    "user.userId": req.user._id,
  })
    .lean()
    .populate("user.userId");

  const a = orders.map((o) => ({
    ...o,
    price: o.courses.reduce((total, c) => {
      return (total += c.count * c.course.price);
    }, 0),
  }));
  res.render("orders", {
    title: "Заказы",
    isOrders: true,
    orders: a,
  });
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId").execPopulate();

    const courses = user.cart.items.map((i) => ({
      count: i.count,
      course: { ...i.courseId.toJSON() },
    }));
    console.log(courses);
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user,
      },
      courses,
    });

    await order.save();
    await req.user.clearCart();

    res.redirect("/orders");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
