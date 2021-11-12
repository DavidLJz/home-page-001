import { docReady } from "./modules/doc-ready.js";
import { CommandHistory } from "./modules/command-history.js";
import { User } from "./modules/terminal-user.js";
import { Background } from "./modules/background.js";

const apustaja = './apustaja';

docReady(function () {
  const history = new CommandHistory();
  const user = new User();
  const backgrounds = new Background(document.getElementById('bg-input'));

  const terminal = document.getElementById('terminal');
  const terminal_output = terminal.querySelector('.command-lines-container');

  // restore terminal state
  if ( typeof Storage !== 'undefined' ) {
    let position = localStorage.getItem('terminal-position');

    if ( position ) {
      position = position.split(',');

      terminal.style.left = position[0];
      terminal.style.top = position[1]; 
    }

    let state = localStorage.getItem('terminal-state');

    if ( state && ['maximized','minimized','closed'].includes(state) ) {
      terminal.classList.add(state);
    }
  }

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

      case 'bg': {
        try {
          backgroundControl(command);
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

    // scroll to bottom of terminal
    terminal.scrollTop = terminal.scrollHeight;
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
    
      default: throw new Error('Unknown destination\n\n' + usage);
    }
  } 

  const backgroundControl = (command) => {
    let usage = 'Usage: bg [command]\n\n' + 
      '\tExamples:\n' + 
      '\t- bg add\n' + 
      '\t- bg set 3\n' + 
      '\t- bg next\n' + 
      '\t- bg prev\n' + 
      '\t- bg list\n' + 
      '\t- bg random';

    let args = command.slice(2);
    command = command[1];

    switch (command) {
      case 'add': {
        backgrounds.add()
        break;
      }

      case 'set': {
        if ( typeof args[0] === 'undefined' || isNaN(args[0]) ) {
          throw new Error('Wrong syntax. ' + usage);
        }

        const idx = parseInt(args[0]);
        backgrounds.set(idx);
        break;
      }

      case 'prev': {
        const current_idx = backgrounds.getCurrentBgIdx();

        if ( current_idx === null || isNaN(current_idx) ) {
          throw new Error('No background set. ' + usage);
        }

        let idx = current_idx - 1;

        backgrounds.set( idx >= 0 ? idx : backgrounds.getBgCount() + idx );
        break;
      }

      case 'next': {
        const current_idx = backgrounds.getCurrentBgIdx();

        if ( current_idx === null || isNaN(current_idx) ) {
          throw new Error('No background set. ' + usage);
        }

        let idx = current_idx + 1;

        backgrounds.set( idx < backgrounds.getBgCount() ? idx : idx - backgrounds.getBgCount() );
        break;
      }

      case 'random': {
        const count_bg = backgrounds.getBgCount();

        if ( !count_bg ) {
          throw new Error('No background set. ' + usage);
        }

        const rand = Math.floor(Math.random() * count_bg);
        
        backgrounds.set(rand);
        break;
      }

      case 'list': {
        const line = document.createElement('div');
        line.classList = 'line command';

        line.textContent = 'Backgrounds:';
        
        const bg_list = backgrounds.getBgList();

        if ( !bg_list.length ) {
          line.textContent += '\tNo backgrounds set.';
        } else {
          for ( const i in bg_list ) {
            line.textContent += `\n\t${i}: ${bg_list[i]}\n`;
          }
        }

        terminal_output.appendChild(line);
        break;
      }

      default: throw new Error('Option not valid\n\n' + usage);
    }
  };

  const helpCommand = (command='') => {
    let usage = 'Usage: help [command]\n\n' + 
      '\tExamples:\n' +
      '\t- help go\n' +
      '\t- help history\n';

    let available_commands = 'Available commands:\n' +
      '\t- help\n' +
      '\t- about\n' +
      '\t- bg\n' +
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

      case 'bg': {
        line.textContent = 'Control background image.' + 
          '\nUsage: bg [command]\n\n' + 
          '\tExamples:\n' + 
          '\t- bg add\n' + 
          '\t- bg set 3\n' + 
          '\t- bg next\n' + 
          '\t- bg prev\n' + 
          '\t- bg list\n' + 
          '\t- bg random';

        break;
      }

      case 'history': {
        line.textContent = 'Show command history' + 
          '\nUsage: history [args]\n\n' + 
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

      default: throw new Error('Unknown command\n\n' + usage);
    }
      
    terminal_output.appendChild(line);
  };

  // make draggable
  const terminal_header = terminal.querySelector('.terminal-header');

  terminal_header.addEventListener('mousedown', function (e) {
    if ( e.target !== terminal_header ) {
      return;
    }

    if ( terminal.classList.contains('maximized') ) {
      return;
    }

    const x = e.clientX - terminal.offsetLeft;
    const y = e.clientY - terminal.offsetTop;

    document.body.addEventListener('mousemove', moveTerminal);
    document.body.addEventListener('click', stopMoveTerminal);
    terminal.addEventListener('mouseup', stopMoveTerminal);

    function moveTerminal(e) {
      terminal.style.userSelect = 'none';
      document.body.style.cursor = 'move';

      terminal.style.left = e.clientX - x + 'px';
      terminal.style.top = e.clientY - y + 'px';
    }

    function stopMoveTerminal() {
      document.body.removeEventListener('mousemove', moveTerminal);
      terminal.removeEventListener('mouseup', stopMoveTerminal);

      terminal.style.userSelect = 'auto';
      document.body.style.cursor = 'default';

      if ( typeof Storage !== 'undefined' ) {
        const position = terminal.style.left + ',' + terminal.style.top; // x,y
        localStorage.setItem('terminal-position', position);
      }
    }
  });

  // Terminal header buttons
  terminal_header.addEventListener('click', function (e) {
    if ( !e.target.classList.contains('terminal-header-button') ) {
      return;
    }

    const button = e.target;

    const switchState = (state) => {
      if ( typeof Storage === 'undefined' ) {
        return;
      }

      const savedState = localStorage.getItem('terminal-state');

      if ( savedState === state ) {
        localStorage.removeItem('terminal-state');
      } else {
        localStorage.setItem('terminal-state', state);
      }
    };

    let state;

    if ( button.classList.contains('close') ) {
      // pending
    } else if ( button.classList.contains('min') ) {
      // pending
    } else if ( button.classList.contains('max') ) {
      terminal.classList.toggle('maximized');
      switchState('maximized');
    }
  });
});