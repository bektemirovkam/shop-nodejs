const toCurrency = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    currency: "rub",
  }).format(price);
};

const toDate = (date) => {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
};

document.querySelectorAll(".price").forEach((node) => {
  node.textContent = toCurrency(node.textContent);
});

document.querySelectorAll(".date").forEach((node) => {
  node.textContent = toDate(node.textContent);
});

const $card = document.querySelector("#card");

if ($card) {
  $card.addEventListener("click", (event) => {
    if (event.target.classList.contains("card-remove")) {
      const id = event.target.dataset.id;
      const csrf = event.target.dataset.csrf;
      fetch("/cart/remove/" + id, {
        method: "delete",
        headers: {
          "X-XSRF-TOKEN": csrf,
        },
      })
        .then((resp) => resp.json())
        .then((card) => {
          if (card.courses.length) {
            const html = card.courses
              .map(
                (c) =>
                  `<tr>
                  <td>${c.title}</td>
                  <td>${c.count}</td>
                  <td>
                      <button class="btn btn-primay card-remove" data-id="${c.id}" data-csrf="${csrf}">Удалить</button>
                  </td>
                </tr>`
              )
              .join("");
            $card.querySelector("tbody").innerHTML = html;
            $card.querySelector(".price").textContent = card.price;
          } else {
            $card.innerHTML = `<p>Корзина пуста</p>`;
          }
        });
    }
  });
}

M.Tabs.init(document.querySelectorAll(".tabs"));
