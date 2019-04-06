class Model {
  constructor() {
    this.message = '';
  }

  getMessage() {
    return this.message;
  }

  setMessage(message) {
    this.message = message;
  }

  save() {
    localStorage.setItem('message', this.message);
  }
}

export default new Model();
