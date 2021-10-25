import { docReady } from "./modules/doc-ready.js";

docReady(function () {
  const terminal = document.getElementById('terminal');
  const cmd = document.querySelectorAll('.cmd');

  document.body.addEventListener('change', function (e) {
    const el = e.target;

    if ( el.classList.contains('cmd') ) {
      const log = document.createElement('div');
      log.classList = 'command-log';
      log.textContent = el.value;

      terminal.querySelector('.command-logs-container').append( log );
    }
  });
});