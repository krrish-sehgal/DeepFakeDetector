document.addEventListener("DOMContentLoaded", runFunction); // we use this because sometimes the dom isnt even loaded and we directly try to access the elements of the dom

function runFunction() {
  //this will be printed in the console of the extension , right click in the extension window popped up and click on inspect
  console.log("Content Loaded");
  document
    .getElementById("snipButton")
    .addEventListener("click", clickFunction);

  function clickFunction() {
    document.body.style.backgroundColor = "red";
  }
}
