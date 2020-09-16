document.getElementById("scroll").addEventListener("click", scrollDown);

function scrollDown() {
  window.scroll({
    top: 2000,
    behavior: "smooth",
  })
}
