$(function () {
  $("#download-osx").hide();
  $("#download-win").hide();
  if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    $("#download-osx").show();
  }
  if (navigator.platform.toUpperCase().indexOf('WIN') >= 0) {
    $("#download-win").show();
  }
});