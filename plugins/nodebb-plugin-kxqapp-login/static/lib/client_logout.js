'use strict';
console.log("@@client")



$(document).ready(function() {
  $(window).on('action:app.loggedOut', function(event, data) {
    console.log("@@app.loggedOut")
    console.log(data);  // to inspect what is passed back by NodeBB
    if(window.kr != undefined ){
      console.log("KRclose")
      kr.close()
    }
  });

  $(window).on('action:app.logout', function(event, data) {
    console.log("@@app.logout")
    console.log(data);  // to inspect what is passed back by NodeBB
    setTimeout(function(){
      if(window.kr!=undefined){
        kr.close()
      }
    },1000)
  });
})
