module.exports = function (req, res, next) {
  res.render("404", {
    title: "Страница не найдена",
  });
};
