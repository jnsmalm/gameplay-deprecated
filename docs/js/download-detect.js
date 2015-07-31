$(function () {
  if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    $("#download-win").hide();
  }
  if (navigator.platform.toUpperCase().indexOf('WIN') >= 0) {
    $("#download-osx").hide();
  }
});