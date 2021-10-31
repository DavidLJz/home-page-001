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

    let command_input = document.createElement('div');
    command_input.classList.add('command-line');
    command_input.textContent = value;

    terminal_output.append(command_input);

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
    line = line.split(' ');

    let usage = 'Usage: go [destination] [args]\n\n' + 
      '\tExamples:\n' + 
      '\t- go home\n' + 
      '\t- go back\n' + 
      '\t- go url google.com';

    const destination = line[1];
    let args = line.slice(2);

    switch (destination) {
      case 'home': {
        location.assign('/');
        break;
      }

      case 'back': {
        history.back();
        break;
      }

      case 'url': {
        if ( !args.length || !args[0] ) {
          throw new Error('Wrong syntax.\n\n' + usage);
        }

        let url = args[0];
        args = args.slice(1);

        const params = {
          'ssl' : true,
          'timeout' : 1000
        };

        for (const arg of args) {
          switch (arg) {
            case '--no-ssl':{
              params.ssl = false;
              break;
            }

            case '--timeout':
            case '-t': {
              params.timeout = parseInt(args[args.indexOf(arg) + 1]);
              break;
            }

            default: break;
          }
        }

        if ( !url.match(/^https?:\/\//) ) {
          if ( params.ssl ) {
            url = 'https://' + url;
          }

          else {
            url = 'http://' + url;
          }
        }

        const line = document.createElement('p');
        line.classList = 'command-line';
        line.innerHTML = `Redirecting to ${url} in <span>${params.timeout / 1000}</span>s. If not `;
        line.innerHTML += '<a href="' + url + '">click here</a>.';

        terminal_output.append(line);

        setInterval(() => {
          line.querySelector('span').textContent = parseInt(line.querySelector('span').textContent) - 1;
        }, 1000);

        setTimeout(() => { location.assign(url); }, params.timeout);
        
        console.log({url, params, url, args});
        break;
      }
    
      default: {
        throw new Error('Unknown destination\n\n' + usage);
      }
    }
  } 
});