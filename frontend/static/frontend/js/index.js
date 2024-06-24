document.addEventListener('DOMContentLoaded', () => {
    // toogle menu
    const btn = document.getElementById('menu-btn')
    const menu = document.getElementById('menu')
    const cover = document.getElementById('cover')
  
    btn.addEventListener("click", navToggle)
    cover.addEventListener("click", navToggle)
  
    function navToggle() {
      btn.classList.toggle('open')
      menu.classList.toggle('block')
      menu.classList.toggle('hidden')
      cover.classList.toggle('hidden')
    }
  
})

$(document).ready(function () {
  $('#inprogress').click(function(){
    $('#in_progress_task').slideToggle();
  })

  $('#completed').click(function(){
    $('#completed_task').slideToggle();
  })

  // $('#overdue').click(function(){
  //   $('#').slideToggle();
  // })
});