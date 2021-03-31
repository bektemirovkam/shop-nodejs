const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");

const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");
const notFoundError = require("./middleware/404");
const fileMiddleware = require("./middleware/file");

const keys = require("./keys");

const PORT = process.env.PORT || 3000;

const store = new MongoStore({
  // для хранение сессий в БД
  collection: "sessions",
  uri: keys.MONGODB_URI,
});

const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require("./utils/hbs-helper"),
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public"))); // название папки в которой будет хранится статика. в html "/название файла"
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));

app.use(
  // определяем сессию
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use(fileMiddleware.single("avatar")); // после сессии, single - 1 file; название поля - аватар, для обработки форм

// сразу после определения сессии csrf
app.use(csrf()); // проверяет наличие csrf-токена при каждом post-запросе
app.use(flash()); // для показа ошибок в формах

app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// 404 ошибку после всех роутов
app.use(notFoundError);

const start = async () => {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`Server is run on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
