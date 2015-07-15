$(document).ready(function() {
    /* MOBILE */

    /* Initial state of Map/Image List and Toggle Button */
    $('.sifter-imagelist').addClass("hidden-mobile");
    $('.switch-map').addClass("hidden-mobile");

    $('.switch-views').on('click', function() {
        $('.switch-view-icon').toggleClass("hidden-mobile");
        $('.sifter-map').toggleClass("hidden-mobile");
        $('.sifter-imagelist').toggleClass("hidden-mobile");
    });


    /* Filter slide up toggle */
    $('.sifter-filters-button').on('click', function() {
        $('.sifter-filters-slideout').toggleClass('sifter-filters-expanded');
    });



    /* DESKTOP */

    /* Initial state of Menu and Content */

    $('.sifter-menu-reveal').on('click', function() {
        $('.sifter-menu-reveal').toggleClass('button-active');
        $('.sifter-filters-popdown').toggleClass('slide-up');
    });


    /* Debug */
    $('.sifter-modal-overlay').hide();


    /* Dialog and Overlay close */
    $(document).on('click', '.close-button, .sifter-modal-overlay', function() {
        history.pushState("", document.title, window.location.pathname);
        $('.closable, .sifter-modal-overlay').hide();
        controller.showAboutIfNew();
    });

});
