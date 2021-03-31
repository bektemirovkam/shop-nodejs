const keys = require("../keys");

module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: "Забыли пароль?",
    text: "Забыли пароль?",
    html: `
        <h1>Забыли пароль?</h1>
        <p>Если нет то проигрнорируйте данное письмо</p>
        <p>Иначе пройдите по ссылке ниже</p>
        <p><a href="${keys.BASE_URL}/auth/password/${token}">Восстановить пароль</a></p>
        <hr/>
        <a href="${keys.BASE_URL}">Магазин курсов</a>
    `,
  };
};
