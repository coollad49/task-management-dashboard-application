document.addEventListener('DOMContentLoaded', () => {
  // toogle menu
  const btn = document.getElementById('menu-btn')
  const menu = document.getElementById('menu')

  btn.addEventListener("click", navToggle)

  function navToggle() {
    btn.classList.toggle('open')
    menu.classList.toggle('block')
    menu.classList.toggle('hidden')
  }
})