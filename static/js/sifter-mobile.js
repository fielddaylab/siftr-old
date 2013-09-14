$(document).ready(function ()
{
  /* Map Toggle */
  $('.sifter-imagelist').hide();
  $('.switch-map').hide();

  $('.switch-views').on('click', function()
  {
    $('.switch-view-icon').toggle();

    $('.sifter-map').toggle();
    $('.sifter-imagelist').toggle();
  });


  /* Filter slide up toggle */
  $('.sifter-filters-button').on('click', function()
  {
    $('.sifter-filters-slideout').toggleClass('sifter-filters-expanded');
  });

});
