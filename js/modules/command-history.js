const CommandHistory = class {
  constructor() {
    this.history = this.getHistory();
    this.last_accessed_index = this.history.length;
  }

  getHistory() {
    const history = localStorage.getItem('command-history');
    if (history) {
      return JSON.parse(history);
    }
    return [];
  }

  saveHistory() {
    localStorage.setItem('command-history', JSON.stringify(this.history));
    return this;
  }

  clear() {
    this.history = [];
    this.saveHistory();

    return this;
  }
  
  add(command) {
    this.history.push(command);
    this.saveHistory();

    return this;
  }

  getLine(index) {
    const history = this.history;

    if (index < 0 || index >= history.length) {
      return null;
    }

    return history[ index ] || null;
  }

  getLastCommand() {
    this.last_accessed_index--;

    return this.getLine(this.last_accessed_index);
  }

  resetLastAccessedIndex() {
    this.last_accessed_index = this.getHistory().length;
    return this;
  }
};

export { CommandHistory };