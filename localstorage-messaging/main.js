import model from './model.js';

class Controller {
  constructor() {
    this.model = model;
    this.viewEl = document.getElementById('message');

    // Update a message from active window.
    this.viewEl.addEventListener('input', event => {
      this.update(event.target.value);
    });

    // Receive a message from other windows via localStorage.
    addEventListener('storage', event => {
      this.receive(event.newValue);
    });
  }

  update(message) {
    this.model.setMessage(message);
    this.model.save();
  }

  receive(message) {
    this.model.setMessage(message);
    this.viewEl.value = this.model.getMessage();
  }
}

new Controller();
