$(function () {
    $('.openPopup').click(function (e) {
        e.preventDefault();
        var popup_id = $('#' + $(this).attr("rel"));
        popup_id.show("fast");
    });

   /* $('.overlay, .popupContainer').click(function () {
        $('.overlay, .popupContainer').hide();
    });*/
    $('.closePopup, .submitIdeaButton').click(function (e) {
        var popup_id = $('#' + $(this).attr("rel"));
        popup_id.hide("fast");
    });

});
$(".contentIdea").each(function(){
    $clamp(this,{clamp: 4});
});