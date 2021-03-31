const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: String,
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExp: Date,
  avatarUrl: String,
  cart: {
    items: [
      {
        count: {
          type: Number,
          required: true,
          default: 1,
        },
        courseId: {
          required: true,
          type: Schema.Types.ObjectId,
          ref: "Course",
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (course) {
  // обязательно function, this
  const clonedItems = this.cart.items.concat(); // [...this.cart.items]
  const idx = clonedItems.findIndex(
    (c) => c.courseId.toString() === course._id.toString()
  );

  if (idx >= 0) {
    clonedItems[idx].count = clonedItems[idx].count + 1;
  } else {
    clonedItems.push({
      courseId: course.id,
      count: 1,
    });
  }

  // const newCart = { items: clonedItems }
  // this.cart = newCart;

  this.cart = { items: clonedItems }; // или просто вместо clonedItems => items и this.cart = {items}

  return this.save();
};

userSchema.methods.removeFromCart = function (id) {
  let items = [...this.cart.items];
  const idx = items.findIndex((c) => c.courseId.toString() === id.toString());

  if (items[idx].count === 1) {
    items = items.filter((c) => c.courseId.toString() !== id.toString());
  } else {
    items[idx].count--;
  }

  this.cart = { items };
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = model("User", userSchema);
