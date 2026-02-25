const header = document.querySelector(".header");

if (header) {
  window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
      header.classList.add("collapsed");
      document.body.classList.add("header-collapsed");
    } else {
      header.classList.remove("collapsed");
      document.body.classList.remove("header-collapsed");
    }

  });
}
