class Scheduler {
  constructor() {
    this.timer = null;
    this.fn = null;
    this.interval = 0;
  }

  start(fn, intervalMs) {
    this.stop();
    this.fn = fn;
    this.interval = intervalMs;
    this.timer = setInterval(() => {
      Promise.resolve(fn()).catch(console.error);
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const scheduler = new Scheduler();
