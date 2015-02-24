var window = new cowy.Window({
  width: 1024,
  height: 576,
  fullscreen: false,
});

while (!window.isClosing()) {
  window.clear();
  window.swapBuffers();
  window.pollEvents();
}