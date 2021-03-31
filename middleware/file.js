const multer = require("multer");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // куда будут сохранятся файлы
    cb(null, "./images");
  },
  filename(req, file, cb) {
    // как будет называться файл, 1 парам в сb ошибка либо null
    cb(null, Math.random() + "-" + file.originalname); // важно чтобы названия файлов не повторялось
  },
});

const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // если все хорошо
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
});
