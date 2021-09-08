class Queue {
  items = [];
  #pending = [];
  get length() {
    return this.items.length;
  }
  put(item) {
    this.items.push(item);
    let resolve = this.#pending.shift();
    if (resolve) {
      let value = this.items.shift();
      resolve(value);
    }
  }
  take() {
    if (this.items.length > 0) {
      return Promise.resolve(this.items.shift());
    } else {
      return new Promise(res => this.#pending.push(res));
    }
  }
}

module.exports = Queue
