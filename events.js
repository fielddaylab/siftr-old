$(document).ready (function ()
{
  /* Header Buttons ***************************************** */

  $('.sifter-fetch-top-button').on('click', function()
  {
    startSift('top');
  });

  $('.sifter-fetch-recent-button').on('click', function()
  {
    startSift('recent');
  });

  $('.sifter-fetch-popular-button').on('click', function()
  {
   	startSift('popular');
  });

  $('.sifter-fetch-mine-button').on('click', function()
  {
    startSift('mine');
  });

  /* Set active on clicked button */
  $('.filter-button').on('click', function(event)
  {
    $('.filter-button').removeClass('button-active');
    $(event.target).addClass('button-active');
  });


  $('.sifter-show-login-button').on('click', function()
  {
    controller.showLoginView();
  });

  $('.sifter-show-upload-button').on('click', function()
  {
    controller.createNote();
  });

  $('.sifter-show-logout-button').on('click', function()
  {
    controller.logout();
  });



  /* Search and Filter change ******************************* */

  $('.sifter-filter-checkbox-input').on('change', function()
  {
    startSift('tags');
  });

  $('.sifter-filter-search-input').on('change', function()
  {
    startSift('search');
  });



  /* Create Note View *************************************** */ 

  /* Document event delegators since view is cloned where
     inline onClick events get cloned with their DOM element */

  /* FIXME Replacing this with a backbone view is ideal */
  $(document).on('change', '#imageFileInput', function()
  {
    handleImageFileSelect(this.files);
  });

  $(document).on('click', '#browseImage', clickBrowseImage);
  $(document).on('click', '#showCamera',  showVideo);
  $(document).on('click', '#browseAudio', clickBrowseAudio);

  $(document).on('change', '#audioFileInput', function()
  {
    handleAudioFileSelect(this.files);
  });

  $(document).on('click', '#submitNote', submitNote);
  $(document).on('click', '#cancelNote', cancelNote);



  /* Login View ********************************************* */ 

  $(document).on('click', '#login',          clickLogin);  
  $(document).on('click', '#noAccount',      clickNoAccount);
  $(document).on('click', '#forgotPassword', clickForgotPassword);



  /* Join View ********************************************** */

  $(document).on('click', '#signUp',        clickSignUp);
  $(document).on('click', '#viewLoginPage', clickViewLoginPage);



  /* Forgot View ******************************************** */
  $(document).on('click', '#forgot', clickEmailPassword);


  /* About View ********************************************* */
  $('.show-about').on('click', function()
  {
    controller.showAbout();
  });

});
