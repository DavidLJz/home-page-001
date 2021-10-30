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

      case 'return': 
        line.textContent = 'You can\'t do that!';
        break;

      default: {
        if ( value.includes('go') ) {
          try {
            goCommand(value);
          }
  
          catch (e) {
            console.error(e);
            line.textContent = 'Error: ' + e.message;
          }

          break;
        }

        line.textContent = 'Unknown command';
        break;
      }
    }

    terminal_output.appendChild(line);
  };

  const goCommand = (line) => {
    const destination = line.split(' ')[1];

    switch (destination) {
      case 'home': {
        location.assign('/');
        break;
      }

      case 'back': {
        history.back();
        break;
      }
    
      default: {
        throw new Error('Unknown destination');
      }
    }
  } 
});