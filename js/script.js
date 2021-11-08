import { docReady } from "./modules/doc-ready.js";
import { CommandHistory } from "./modules/command-history.js";
import { User } from "./modules/terminal-user.js";

const apustaja = './apustaja';

docReady(function () {
  const history = new CommandHistory();
  const user = new User();

  const terminal = document.getElementById('terminal');
  const terminal_output = terminal.querySelector('.command-lines-container');

  // print name of user
  terminal.querySelector('.pager').textContent = user.getNameWithPrefix();

  // press up key to get previous command
  terminal.querySelector('.cmd').addEventListener('keydown', function (e) {
    if (e.keyCode === 38) {
      this.value = history.getLastCommand();

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

    const command = value.split(' ').filter(x => x || false);

    switch (command[0]) {
      case 'help': {
        try {
          helpCommand(command[1]);
        }

        catch (e) {
          console.error(e);
          error = true;
          line.textContent = 'Error: ' + e.message;
        }

        break;
      }

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

      case 'go': {
        try {
          goCommand(command);
        }

        catch (e) {
          console.error(e);
          error = true;
          line.textContent = 'Error: ' + e.message;
        }

        break;
      }

      default: {
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
          'timeout' : 1000,
          'new_tab' : false
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

            case '-nw':
            case '--new-window': {
              params.new_tab = true;
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
        line.classList = 'line command';

        if ( params.new_tab ) {
          line.innerHTML = `Opening ${url} in a new window. Wait `
        } else {
          line.innerHTML = `Redirecting to ${url} in `;
        }

        line.innerHTML += `<span>${params.timeout / 1000}</span> seconds. If not `;        
        line.innerHTML += '<a href="' + url + '">click here</a>.';

        terminal_output.append(line);

        const timer = setInterval(() => {
          line.querySelector('span').textContent = parseInt(line.querySelector('span').textContent) - 1;
        }, 1000);

        setTimeout(() => { 
          clearInterval(timer);

          if ( params.new_tab ) {
            window.open(url, '_blank');
          } else {
            location.assign(url); 
          }

        }, params.timeout);
        
        console.log({url, params, url, args});
        break;
      }
    
      default: {
        throw new Error('Unknown destination\n\n' + usage);
      }
    }
  } 

  const helpCommand = (command='') => {
    let usage = 'Usage: help [command]\n\n' + 
      '\tExamples:\n' +
      '\t- help go\n' +
      '\t- help history\n';

    let available_commands = 'Available commands:\n' +
      '\t- help\n' +
      '\t- about\n' +
      '\t- clear\n' + 
      '\t- go\n' +
      '\t- history\n';

    const line = document.createElement('div');
    line.classList = 'line command';
      
    if ( !command ) {
      line.textContent = available_commands;
      terminal_output.appendChild(line);
      return;
    }

    if ( command === 'help' ) {
      (async () => {
        const path = location.pathname.split('/').filter(x => x || false);
        path.push('apustaja');

        const response = await fetch( location.origin +'/'+ path.join('/') );
        const text = await response.text();

        console.log(text);
      })();

      line.textContent = available_commands;
      terminal_output.appendChild(line);
      return;
    }

    switch (command) {
      case 'go': {
        line.textContent = 'Go to internal page or external url.' + 
          '\nUsage: go [destination] [args]\n\n' + 
          '\tExamples:\n' + 
          '\t- go home\n' + 
          '\t- go back\n' + 
          '\t- go url google.com';
        
          break;
      }

      case 'history': {
        line.textContent = 'Show command history' + 
          'Usage: history [args]\n\n' + 
          '\tExamples:\n' +
          '\t- history 10';

        break;
      }

      case 'clear': {
        line.textContent = 'Clear the terminal screen';
        break;
      }

      case 'about': {
        line.textContent = 'About this terminal';
        break;
      }

      default: {
        throw new Error('Unknown command\n\n' + usage);
      }
    }
      
    terminal_output.appendChild(line);
    return;
  };
});