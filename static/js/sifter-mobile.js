$(document).ready(function ()
{
  /* MOBILE */

  /* Initial state of Map/Image List and Toggle Button */
  $('.sifter-imagelist').addClass ("hidden-mobile");
  $('.switch-map'      ).addClass ("hidden-mobile");

  $('.switch-views').on('click', function()
  {
    $('.switch-view-icon').toggleClass ("hidden-mobile");
    $('.sifter-map'      ).toggleClass ("hidden-mobile");
    $('.sifter-imagelist').toggleClass ("hidden-mobile");
  });


  /* Filter slide up toggle */
  $('.sifter-filters-button').on('click', function()
  {
    $('.sifter-filters-slideout').toggleClass('sifter-filters-expanded');
  });



  /* DESKTOP */

  /* Initial state of Menu and Content */
  $('.sifter-filters-popdown').addClass('slide-up');

  $('.sifter-menu-reveal').on('click', function()
  {
    $('.sifter-menu-reveal').toggleClass('button-active');
    $('.sifter-filters-popdown').toggleClass ('slide-up');
    $('.sifter-content').toggleClass ('shrunk');
  });


  /* Debug */
  $('#show-dialog, .sifter-modal-overlay').hide();

  /* Add new content dialog box */
  $('.sifter-add').on('click', function()
  {
    alert('doin it');
  });


  /* Show existing content dialog box */
  $('.sifter-imagelist .img').on('click', function()
  {
    $('#show-dialog, .sifter-modal-overlay').show();
  });

  $('.show-dialog-close-button').on('click', function()
  {
    $('#show-dialog, .sifter-modal-overlay').hide();
  });


  /* Overlay close */
  $('.sifter-modal-overlay').on('click', function()
  {
    $('.sifter-modal-overlay, #show-dialog, #new-dialog').hide();
  });

});
