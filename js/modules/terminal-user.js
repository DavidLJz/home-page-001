const User = class {
  constructor(name='User', password=null) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  getNameWithPrefix() {
    return `${this.name}@${location.hostname} $ `;
  }
};

export { User };