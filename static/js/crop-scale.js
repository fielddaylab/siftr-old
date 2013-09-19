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


  /* Flexible width crop */
  $('.go-crop').on('click', function ()
  {
    var element = $('#le-image').get(0);
    var height  = element.naturalHeight;
    var width   = element.naturalWidth;

    var offset   = Math.min(height, width) / 2.0;
    var center_x = width  / 2;
    var center_y = height / 2;

    var update_coords = function(coords)
    {
      window.jcrop_coords = coords;
    };

    $('#le-image').Jcrop (
    {
      aspectRatio: 1,
      trueSize: [width, height],
      setSelect: [center_x - offset, center_y - offset, center_x + offset, center_y + offset],
      onChange: update_coords,
      onSelect: update_coords
    });
  });


  
  /* Draw to canvas with crop from jScale an resize */
  $('.go-scale').on('click', function ()
  {
    var image   = $('#le-image').get(0);
    var canvas  = $('#le-canvas').get(0);
    var context = canvas.getContext('2d');

    var coords = window.jcrop_coords;
    context.drawImage (image, coords.x, coords.y, coords.w, coords.h, 0, 0, 640, 640);    
  });

  
  /* Video stream start */
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


  /* Video frame grap to crop box */
  $('.go-snap').on('click', function ()
  {
    var video  = $('#le-video').get(0);
    var canvas = $('#le-frame-grab-canvas').get(0);

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    var context = canvas.getContext('2d');
    context.drawImage(video, 0,0);

    $('#le-image').get(0).src = canvas.toDataURL ('image/jpg');

  });
});
