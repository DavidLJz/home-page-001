const Dockbar = class {
  constructor(dockbar_el) {
    this.el = dockbar_el;
    this.actions = {};
  }

  registerApp(params) {
    if ( !params.icon ) {
      throw new Error('No icon provided');
    }

    if ( !params.name ) {
      throw new Error('No action provided');
    }

    if ( !params.action || typeof params.action !== 'function' ) {
      throw new Error('Action is not a function');
    }

    if ( this.actions && this.actions[params.name] ) {
      throw new Error('Action already registered');
    }

    const div = document.createElement('div');
    div.classList.add('launcher-icon'); 
    div.style.backgroundImage = `url(${params.icon})`;
    div.setAttribute('data-action', params.name);

    this.registerAction(params.name, params.action);

    div.addEventListener('click', (e) => {
      const name = e.target.getAttribute('data-action');
      
      if ( !name || !this.actions[name] ) {
        return;
      }

      this.actions[name]( e );
    });

    this.el.appendChild(div);
  }
  
  registerAction(name, action) {
    this.actions[name] = action;

    console.log('Registered action', { name, action });
  }
};

export { Dockbar };