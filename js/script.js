import { docReady } from "./modules/doc-ready.js";

docReady(function () {
  const terminal = document.getElementById('terminal');
  const terminal_output = terminal.querySelector('.command-lines-container');

  terminal.querySelector('.input-container').onsubmit = function (e) {
    e.preventDefault();
    const input = this.querySelector('input');
    const value = input.value;

    input.value = '';

    if (value === 'clear') {
      terminal_output.innerHTML = '';
      return;
    }

    let line = document.createElement('div');
    line.classList.add('command-line');

    switch (value) {
      case 'help':
        line.textContent = 'Available commands: clear, help, about';
        break;

      case 'about':
        line.textContent = 'Made by DavidLjz';
        break;

      default: {
        line.textContent = 'Unknown command';
        break;
      }
    }

    terminal_output.appendChild(line);
  };
});