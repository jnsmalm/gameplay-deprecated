var window = new Window({
  // Set window width to 1024.
  width: 1024,
  // Set window height to 576.
  height: 576,
  // Window should not be full screen.
  fullscreen: false,
});

while (!window.isClosing()) {
  // Clear window graphics to black.
  window.graphics.clear({r:0, g:0, b:0, a:1});
  // Present the back buffer.
  window.graphics.present();
  // Poll and handle window events.
  window.pollEvents();
}