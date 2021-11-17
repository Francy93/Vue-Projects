'use strict';

// cart button responce
function cartButton(elem){
    const active = "active", inactive = "inactive";
    const state = elem.getAttribute("value");
    const cartContainer = document.getElementById("cart-container");

    if(state === inactive && vueApp.cart.length > 0){
        elem.setAttribute("value", active);
        cartContainer.style.display = "inline-block";
    }else if(state === active){
        elem.setAttribute("value", inactive);
        cartContainer.style.display = "none";      
    }
}


// search bar style
$(document).ready(function(){
    $("#search").focus(function() {
      $(".search-box").addClass("border-searching");
      $(".search-icon").addClass("si-rotate");
    });
    $("#search").blur(function() {
      $(".search-box").removeClass("border-searching");
      $(".search-icon").removeClass("si-rotate");
    });
    $("#search").keyup(function() {
        if($(this).val().length > 0)  $(".go-icon").addClass("go-in");
        else $(".go-icon").removeClass("go-in");
    });
    $(".go-icon").click(function(){
      $(".search-form").submit();
    });
});
