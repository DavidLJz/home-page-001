import { docReady } from "./modules/doc-ready.js";

docReady(function () {
  const terminal = document.getElementById('terminal');
  const terminal_output = terminal.querySelector('.command-logs-container');

  terminal.querySelector('.input-container').onsubmit = function (e) {
    e.preventDefault();
    const input = this.querySelector('input');
    const value = input.value;

    input.value = '';

    if (value === 'clear') {
      terminal_output.innerHTML = '';
      return;
    }

    terminal_output.innerHTML += `<div class="command-log">${value}</div>`;
  };
});