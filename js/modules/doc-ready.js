const docReady = (fn) => {
  if (!fn || typeof fn !== 'function') {
    throw new Error('Must be a function');
  }

  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(() => { fn(); }, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
};

export { docReady };