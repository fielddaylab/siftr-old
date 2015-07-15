$(document).ready(function() {
    /* Header Buttons ***************************************** */

    $('.sifter-fetch-top-button').on('click', function(e) {
        e = e || window.event;
        $('.filter-button').removeClass('button-active');
        $(e.target).addClass('button-active');

        startSift('top');
    });

    $('.sifter-fetch-recent-button').on('click', function(e) {
        e = e || window.event;
        $('.filter-button').removeClass('button-active');
        $(e.target).addClass('button-active');

        startSift('recent');
    });

    $('.sifter-fetch-popular-button').on('click', function(e) {
        e = e || window.event;
        $('.filter-button').removeClass('button-active');
        $(e.target).addClass('button-active');

        startSift('popular');
    });

    $('.sifter-fetch-mine-button').on('click', function(e) {
        e = e || window.event;
        var target = e.target;

        controller.loginRequired(function() {
            $('.filter-button').removeClass('button-active');
            $(target).addClass('button-active');
            startSift('mine')
        });
    });


    $('.sifter-show-login-button').on('click', function() {
        controller.showLoginView();
    });

    $('.sifter-show-upload-button').on('click', function() {
        controller.loginRequired(function() {
            controller.createNote();
        });
    });

    $('.sifter-show-logout-button').on('click', function() {

        if (typeof FB != 'undefined') { //check this first or you'll get errors
            FB.getLoginStatus(function(response) { //check to see if they are currently logged in
                if (response.status === 'connected') {
                    FB.logout(function(response) {}); //which will run controller.logout when it's done
                } else {
                    controller.logout(); //they are not currently logged in to facebook, so you can run the plain controller.logout
                }
            });
            controller.logout(); //TODO: hack to make sure logout happens until url sent to FB finalized, DELETE after move to siftr.org/CUSTOM_NAME
        } else {
            controller.logout(); //this deletes all the cookies
        }

    });



    /* Search and Filter change ******************************* */
    //Now that filters are set-up from tags in server, this is no longer used, happens too early
    $('.sifter-filter-checkbox-input').on('change', function() {
        startSift('tags');
    });

    $('.sifter-filter-search-input').on('change', function() {
        startSift('search');
    });



    /* Create Note View *************************************** */

    /* Document event delegators since view is cloned where
       inline onClick events get cloned with their DOM element */

    /* FIXME Replacing this with a backbone view is ideal */
    $(document).on('change', '#imageFileInput', function() {
        handleImageFileSelect(this.files);
    });

    $(document).on('click', '#browseImage', clickBrowseImage);
    $(document).on('click', '#browseAudio', clickBrowseAudio);

    $(document).on('change', '#audioFileInput', function() {
        handleAudioFileSelect(this.files); //never run, HTML tag no longer exists
    });


    //$(document).on('click', '#submitNote', submitNote);
    //$(document).on('click', '#cancelNote, #cancelNoteOverlay', cancelNote);
    // MT: moved to controller.js in Controller::createNote() method



    /* Login View ********************************************* */

    //$(document).on('click', '#login', clickLogin);
    //$(document).on('click', '#noAccount', clickNoAccount);
    //$(document).on('click', '#forgotPassword', clickForgotPassword);
    // MT: moved to controller.js in Controller::showLoginView() method



    /* Join View ********************************************** */

    $(document).on('click', '#signUp', clickSignUp);
    $(document).on('click', '#viewLoginPage', clickViewLoginPage);



    /* Forgot View ******************************************** */
    $(document).on('click', '#forgot', clickEmailPassword);


    /* About View ********************************************* */
    $('.show-about').on('click', function() {
        controller.showAbout();
    });


    /* Map Center ********************************************* */
    $('.sifter-center-map').on('click', function() {
        // var bascom_hill = new google.maps.LatLng(43.0753, -89.4041);
        // model.views.gmap.setCenter(bascom_hill);
        // model.views.gmap.setZoom(14);

        var map_center = new google.maps.LatLng(MAP_CENTER_LATITUDE, MAP_CENTER_LONGITUDE);
        model.views.gmap.setCenter(map_center);
        model.views.gmap.setZoom(MAP_ZOOM_LEVEL);
    });

    window.addEventListener("hashchange", function(){
        controller.getNoteFromURL();
    }, false);

});
