Static Wireframe
================

This siftr wireframe has two sections

* An html5 image crop/scale demo
* A responsive desktop/tablet/mobile html layout

HTML5 Image Crop and Scale
--------------------------

The demo has two tests, one to grab from a video feed, and one that pops up the native camera snap or ifle browser. The video one is not being used in the production app since it doesn't make sense to require asking for webcam permission on a desktop or mobile.

### How it works?

* When input field changes, grab its file.
* Convert file into a url that can be fed to an image tag element.
* Run jCrop on image with a square aspect ratio centered and maximized.
* Use selection dimensions to feed image into a 640x640 sized canvas.

Responsive HTML Layout
----------------------

The css for this has 4 modes.

* Mobile < 906px
* Tablet < 1024px
* Desktop < 1400px
* KioskHD > 1400px
