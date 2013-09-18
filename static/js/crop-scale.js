$(document).ready (function ()
{
  /* Image File/Camera grabbers */
  $('input[type=file]').on('change', function (event)
  {
    var reader = new FileReader();
    reader.readAsDataURL (event.target.files[0]);

    reader.onload = function (event) {
      $('#le-image').get(0).src = event.target.result;
    }
  });

  
  /* Video frame grab */
  $('.go-video').on('click', function ()
  {
    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia  = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;

    var video = $('#le-video').get(0);

    if (navigator.getUserMedia)
    {
      navigator.getUserMedia ({video: true},
      function (stream)
      {
        video.src = window.URL.createObjectURL(stream);
        video.play();
      },

      function (stream)
      {
        alert('failed');
      });
    }
    else
    {
      alert('fallback');
      video.src = 'somevideo.webm'; // fallback.
    }
  });
});
