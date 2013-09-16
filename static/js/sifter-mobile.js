$(document).ready(function ()
{
  /* Map/List and Toggle Button */
  $('.sifter-imagelist').toggleClass ("mobile-hidden");
  $('.switch-map'      ).toggleClass ("mobile-hidden");

  $('.switch-views').on('click', function()
  {
    $('.switch-view-icon').toggleClass ("mobile-hidden");
    $('.sifter-map'      ).toggleClass ("mobile-hidden");
    $('.sifter-imagelist').toggleClass ("mobile-hidden");
  });


  /* Filter slide up toggle */
  $('.sifter-filters-button').on('click', function()
  {
    $('.sifter-filters-slideout').toggleClass('sifter-filters-expanded');
  });

});
