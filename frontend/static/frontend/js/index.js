document.addEventListener('DOMContentLoaded', () => {
    // toogle menu
    const btn = document.getElementById('menu-btn')
    const menu = document.getElementById('menu')
    const cover = document.getElementById('cover')
  
    btn.addEventListener("click", navToggle)
  
    function navToggle() {
      btn.classList.toggle('open')
      menu.classList.toggle('block')
      menu.classList.toggle('hidden')
      cover.classList.toggle('hidden')
    }
  })