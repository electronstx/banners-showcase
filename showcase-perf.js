(function () {
  "use strict";

  const MESSAGE_TYPE = "banner-showcase:stats";

  if (window === window.parent) {
    return;
  }

  if (window.__showcasePerfStarted) {
    return;
  }
  window.__showcasePerfStarted = true;

  let destroyed = false;
  let rafId = 0;

  let drawCallCount = 0;
  let frameDrawCalls = 0;
  let frames = 0;
  let fps = 0;
  let lastFpsTime = performance.now();

  let restoreDrawCalls = null;
  let patchedCanvas = null;

  const patch = (obj, methodName, onCall) => {
    const original = obj[methodName];
    if (typeof original !== "function") {
      return () => {};
    }

    obj[methodName] = function (...args) {
      onCall();
      return original.apply(this, args);
    };

    return () => {
      obj[methodName] = original;
    };
  };

  const findCanvas = () =>
    document.querySelector("#root canvas") || document.querySelector("canvas");

  const patchCanvas = (canvas) => {
    if (!canvas || patchedCanvas === canvas) return;

    restoreDrawCalls?.();
    restoreDrawCalls = null;
    patchedCanvas = canvas;

    const ctx2d = canvas.getContext("2d");
    if (ctx2d) {
      restoreDrawCalls = patch(ctx2d, "drawImage", () => drawCallCount++);
      return;
    }

    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return;

    const restoreArrays = patch(gl, "drawArrays", () => drawCallCount++);
    const restoreElements = patch(gl, "drawElements", () => drawCallCount++);
    restoreDrawCalls = () => {
      restoreArrays();
      restoreElements();
    };
  };

  const getPlatform = () => {
    const meta = document.querySelector('meta[name="banner-platform"]');
    return meta ? meta.getAttribute("content") || "" : "";
  };

  const sendStats = () => {
    const canvas = findCanvas();
    if (!canvas) return;

    patchCanvas(canvas);

    const dpr = window.devicePixelRatio || 1;
    const displayWidth =
      parseInt(canvas.style.width, 10) || canvas.clientWidth || 0;
    const displayHeight =
      parseInt(canvas.style.height, 10) || canvas.clientHeight || 0;

    window.parent.postMessage(
      {
        type: MESSAGE_TYPE,
        fps,
        drawCalls: frameDrawCalls,
        platform: getPlatform(),
        displayWidth,
        displayHeight,
        dpr,
      },
      "*",
    );
  };

  const tick = () => {
    if (destroyed) return;

    frameDrawCalls = drawCallCount;
    drawCallCount = 0;
    frames++;

    const now = performance.now();
    const elapsed = now - lastFpsTime;

    if (elapsed >= 250) {
      fps = Math.round((frames * 1000) / elapsed);
      frames = 0;
      lastFpsTime = now;
      sendStats();
    }

    rafId = requestAnimationFrame(tick);
  };

  const observer = new MutationObserver(() => {
    const canvas = findCanvas();
    if (canvas) patchCanvas(canvas);
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  const initialCanvas = findCanvas();
  if (initialCanvas) patchCanvas(initialCanvas);

  lastFpsTime = performance.now();
  tick();

  window.__showcasePerfDestroy = () => {
    if (destroyed) return;
    destroyed = true;

    cancelAnimationFrame(rafId);
    restoreDrawCalls?.();
    observer.disconnect();

    delete window.__showcasePerfStarted;
    delete window.__showcasePerfDestroy;
  };
})();
