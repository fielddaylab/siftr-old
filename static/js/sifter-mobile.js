$(document).ready(function ()
{
  $('.sifter-imagelist').hide();
  $('.switch-map').hide();

  $('.switch-views').on('click', function()
  {
    $('.switch-view-icon').toggle();

    $('.sifter-map').toggle();
    $('.sifter-imagelist').toggle();
  });

});
