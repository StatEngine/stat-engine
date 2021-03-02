class TimerStore {
  constructor() {
    this.intervals = new Map();
  }

  addInterval(id, timer) {
    if (this.intervals.get(id)) {
      this.timeouts.get(id).clear();
    }
    this.intervals.set(id, timer);
  }

  removeInterval(id) {
    if (this.intervals.get(id)) {
      this.intervals.get(id).clear();
    }
    this.intervals.delete(id);
  }

  removeAllInterval(base) {
    this.intervals.forEach((timer, key) => {
      if (key.startsWith(base)) {
        this.removeInterval(key);
      }
    });
  }
}

export default TimerStore;
