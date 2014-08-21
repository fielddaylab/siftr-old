var CropHelper = {

  /* Image File/Camera grabbers */
  watch_image_change: function (event)
  {
    $('.center-big').removeClass('center-big').addClass('left-small');
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

    $('.new-dialog').addClass('shrink');
    $('#crop_box').show(); /* Mobile full frame */

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

    EXIF.getData(image, function() {
      var orientation = EXIF.getTag(image, 'Orientation');
      console.log(orientation);

      var coords = window.jcrop_coords;
      var dpr = window.devicePixelRatio;
      if (dpr === undefined) dpr = 1;
      context.drawImage (image, coords.x / dpr, coords.y / dpr, coords.w / dpr, coords.h / dpr, 0, 0, 640, 640);
    });
  },


  /* Attach canvas image data to model */
  attach_to_note: function ()
  {
    var canvas = $('#le-canvas').get(0);

    if(CropHelper.canvas_jpeg_support ())
    {
      canvas.toBlob(
          function (blob) { model.currentNote.imageFile = blob; },
          'image/jpeg'
      );
    }

    /* Future notes */
    /* Android browser currently cant:
       - Make a jpeg from canvas. (solved with encoder)
       - Use modern blob constructor (solved with builder)
       - Send the blob properly to server (NOT FIXED)

      var encoder = new JPEGEncoder();
      var jpeg = encoder.encode(canvas.getContext("2d").getImageData(0,0,640,640), 90);
      model.currentNote.imageFile = CropHelper.dataURItoBlob(jpeg);
    */
  },


  /* Browser blob test */
  canvas_jpeg_support: function()
  {
    return (document.createElement('canvas').toDataURL('image/jpeg').substring(11,15) === "jpeg");
  },


  /* Blob helper for older devices UNUSED */
  dataURItoBlob: function(dataURI)
  {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }


    /* For browsers without Blob */
    var blob = null;

    try{
      blob = new Blob( [ab], {type : mimeString});
    }
    catch(e)
    {
        // TypeError old chrome and FF
        window.BlobBuilder = window.BlobBuilder || 
                             window.WebKitBlobBuilder || 
                             window.MozBlobBuilder || 
                             window.MSBlobBuilder;
        if(window.BlobBuilder)
        {
            var bb = new BlobBuilder();
            bb.append([ab]);
            blob = bb.getBlob(mimeString);
        }
        else
        {
            alert("Uploading not supported in your browser.");
        }
    }
    return blob;
  }
} /* end CropHelper */
