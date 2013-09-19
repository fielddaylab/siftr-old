$(document).ready (function ()
{
  /* Image File/Camera grabbers */
  $('input[type=file]').on('change', function (event)
  {
    var reader = new FileReader();
    reader.readAsDataURL (event.target.files[0]);

    reader.onload = function (event) {
      var element = $('#le-image').get(0);
      element.src = event.target.result;
    }

  });


  $('.go-crop').on('click', function ()
  {
    var element = $('#le-image').get(0);
    var height  = element.naturalHeight;
    var width   = element.naturalWidth;

    var offset = Math.min(height, width) / 2.0;
    var center_x = width  / 2;
    var center_y = height / 2;

    $('#le-image').Jcrop (
    {
      aspectRatio: 1,
      trueSize: [width, height],
      setSelect: [center_x - offset, center_y - offset, center_x + offset, center_y + offset],
      onChange: function (coords) { console.info("change", coords); },
      onSelect: function (coords) { console.info("select", coords); }
    });
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
