import { docReady } from "./modules/doc-ready.js";
import { CommandHistory } from "./modules/command-history.js";
import { User } from "./modules/terminal-user.js";

docReady(function () {
  const history = new CommandHistory();
  const user = new User();

  const terminal = document.getElementById('terminal');
  const terminal_output = terminal.querySelector('.command-lines-container');

  terminal.querySelector('.pager').textContent = user.getNameWithPrefix();

  terminal.querySelector('.cmd').addEventListener('keydown', function (e) {
    if (e.keyCode === 38) {
      const lastCommand = history.getLastCommand();

      this.value = lastCommand;

      // place cursor at end of input
      const that = this;      
      setTimeout(function(){ that.selectionStart = that.selectionEnd = 10000; }, 0);
    }
  });

  terminal.querySelector('.input-container').onsubmit = function (e) {
    e.preventDefault();
    const input = this.querySelector('input');
    const value = input.value;

    history.add(value).resetLastAccessedIndex();

    input.value = '';

    if (value === 'clear') {
      terminal_output.innerHTML = '';
      return;
    }

    let command_input = document.createElement('div');
    command_input.classList = 'line command';
    command_input.innerHTML = `<span class="pager">${user.getNameWithPrefix()}</span>` + value;

    terminal_output.append(command_input);

    let line = document.createElement('div');
    line.classList.add('line');

    let error = false;

    switch (value) {
      case 'help':
        line.textContent = 'Available commands: clear, help, about';
        break;

      case 'about':
        line.textContent = 'Made by DavidLjz';
        break;

      case 'return': 
        error = true;
        line.textContent = 'You can\'t do that!';
        break;

      case 'history':
        let history_log = '';
        const command_history = history.getHistory();

        for ( const i in command_history ) {
          history_log += i + '\t' + command_history[i] + '\n';
        }

        line.textContent = history_log;
        break;

      default: {
        if ( value.includes('go') ) {
          try {
            goCommand(value);
          }
  
          catch (e) {
            console.error(e);
            error = true;
            line.textContent = 'Error: ' + e.message;
          }

          break;
        }

        error = true;
        line.textContent = 'Unknown command';
        break;
      }
    }

    if (error) {
      line.classList.add('error');
    } else {
      line.classList.add('command');
    }

    terminal_output.appendChild(line);
  };

  const goCommand = (command) => {
    command = command.split(' ');

    let usage = 'Usage: go [destination] [args]\n\n' + 
      '\tExamples:\n' + 
      '\t- go home\n' + 
      '\t- go back\n' + 
      '\t- go url google.com';

    const destination = command[1];
    let args = command.slice(2);

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
        line.classList = 'command';
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