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

    delete element.exifdata; // Ensure exif.js loads fresh data
    EXIF.getData(element, function() {
      var orientation = EXIF.getTag(element, 'Orientation');

      var update_coords = function(coords)
      {
        window.jcrop_coords = coords;

        CropHelper.crop_to_canvas(orientation);
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
    });
  },


  /* Draw to canvas with crop from jScale an resize */
  crop_to_canvas: function (orientation)
  {
    var image   = $('#le-image').get(0);
    var canvas  = $('#le-canvas').get(0);
    var context = canvas.getContext('2d');

    var coords = window.jcrop_coords;
    //var dpr = window.devicePixelRatio;
    //if (dpr === undefined) dpr = 1;
    if (orientation === undefined) orientation = 1;
    
    switch (orientation)
    {
      case 1:
        context.drawImage (image, coords.x, coords.y, coords.w, coords.h, 0, 0, 640, 640);
        break;
      case 6: // Rotate image 90 degrees clockwise to display correctly
        // First off, the coordinates from jcrop are totally wrong.
        // Jcrop calculates them as proportions of what the image says its height and width are.
        // But they're mixed up because the displayed image is rotated.
        // So we need to divide them by the fake height/width and multiply by the real ones.
        var fakeHeight = image.height;
        var fakeWidth = image.width;
        var realHeight = image.width;
        var realWidth = image.height;
        var portrait = {
          x1: coords.x / fakeWidth * realWidth,
          x2: coords.x2 / fakeWidth * realWidth,
          y1: coords.y / fakeHeight * realHeight,
          y2: coords.y2 / fakeHeight * realHeight,
        };
        // Next, we flip the x's and y's because we want coordinates into the real (landscape) image.
        var landscape = {
          x1: portrait.y1,
          x2: portrait.y2,
          y1: portrait.x1,
          y2: portrait.x2,
        };
        // Finally, we need to draw from the landscape image into a rotated canvas context.
        context.save();
        context.translate(320, 320);
        context.rotate(0.5 * Math.PI);
        context.translate(-320, -320);
        context.drawImage (
          image,
          landscape.x1,
          landscape.y1,
          landscape.x2 - landscape.x1,
          landscape.y2 - landscape.y1,
          0, 0, 640, 640
        );
        context.restore();
        break;
      case 3: // Rotate image 180 degrees clockwise to display correctly
        var flipped = {
          x1: coords.x,
          x2: coords.x2,
          y1: coords.y,
          y2: coords.y2,
        };
        var original = {
          x1: image.width - flipped.x2,
          x2: image.width - flipped.x1,
          y1: image.height - flipped.y2,
          y2: image.height - flipped.y1,
        }
        context.save();
        context.translate(320, 320);
        context.rotate(1 * Math.PI);
        context.translate(-320, -320);
        context.drawImage (
          image,
          original.x1,
          original.y1,
          original.x2 - original.x1,
          original.y2 - original.y1,
          0, 0, 640, 640
        );
        context.restore();
        break;
      case 8: // Rotate image 90 degrees counterclockwise to display correctly
        // TODO
        break;
      default:
        // Others are possible, see http://jpegclub.org/exif_orientation.html
        // But we'll assume no mirrored images are likely to be uploaded for now
        console.log('Unknown EXIF orientation: ' + orientation);
        context.drawImage (image, coords.x, coords.y, coords.w, coords.h, 0, 0, 640, 640);
        break;
    }
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
