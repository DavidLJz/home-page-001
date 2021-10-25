import { docReady } from "./modules/doc-ready";

docReady(function () {
  const cmd = document.querySelectorAll('.cmd');

  document.body.addEventListener('click', function () {
    console.log(this.classList)
  });
});