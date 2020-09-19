window.onscroll = function() {navFixed()};

var navbar = document.getElementById("navbar");

var sticky = navbar.offsetTop

function myFunction() {
  if (window.pageYOffset >= sticky) {
    navbar.ClassList.add("sticky");
  } else {
    navbar.ClassList.remove("sticky");
  }
}

document.getElementById("scroll").addEventListener("click", scrollDown);

function scrollDown() {
  window.scroll({
    top: 2000,
    behavior: "smooth",
  })
}
