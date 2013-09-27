var CropHelper = {

  /* Image File/Camera grabbers */
  watch_image_change: function (event)
  {
    $('.center-big').removeClass('center-big');
    var reader = new FileReader();
    reader.readAsDataURL (event.target.files[0]);

    reader.onload = function (event) {
      var element = $('#le-image').get(0);
      element.src = event.target.result;
    }

  },


  /* Flexible width crop */
  initialize_jcrop: function ()
  {
    if($('#le-image').data("Jcrop"))
    {
      $('#le-image').data("Jcrop").destroy();
      $('#le-image').removeAttr("style");
    }

    var element = $('#le-image').get(0);
    var height  = element.naturalHeight;
    var width   = element.naturalWidth;

    var offset   = Math.min(height, width) / 2.0;
    var center_x = width  / 2;
    var center_y = height / 2;

    var update_coords = function(coords)
    {
      window.jcrop_coords = coords;

      CropHelper.crop_to_canvas();
      CropHelper.attach_to_note();
    };

    setTimeout(function ()
    {
      $('#le-image').Jcrop (
      {
        aspectRatio: 1,
        trueSize: [width, height],
        setSelect: [center_x - offset, center_y - offset, center_x + offset, center_y + offset],
        onSelect: update_coords,
      });
    }, 200);
  },


  /* Draw to canvas with crop from jScale an resize */
  crop_to_canvas: function ()
  {
    var image   = $('#le-image').get(0);
    var canvas  = $('#le-canvas').get(0);
    var context = canvas.getContext('2d');

    var coords = window.jcrop_coords;
    context.drawImage (image, coords.x, coords.y, coords.w, coords.h, 0, 0, 640, 640);    
  },


  /* Attach canvas image data to model */
  attach_to_note: function ()
  {
    var canvas = $('#le-canvas').get(0);
    var image = canvas.toDataURL('image/jpeg');

    model.currentNote.imageFile = dataURItoBlob(image);
  },
} /* end CropHelper */
