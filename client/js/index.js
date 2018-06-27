//---------//
// Imports //
//---------//

import $ from 'domtastic'
import smoothscroll from 'smoothscroll'
import animate from 'velocity-animate'

import { locals } from '../scss/screen-size-breakpoints.scss'

//
// and because nunjucks-loader doesn't work in a node environment, it's easiest
//   to declare image dependencies here
//
import '../images/profile.png'
import '../images/favicon.16.png'
import '../images/favicon.32.png'
import '../images/favicon.png'
import '../images/favicon.ico'

//
//------//
// Init //
//------//

const delay = 600,
  setOfAnimatingElements = new Set(),
  { xsMax } = locals

//
//------//
// Main //
//------//

$('button.expander').on('click', expanderClicked)
window.scrollTo = scrollTo

//
//-------------//
// Helper Fxns //
//-------------//

function scrollTo() {
  const link = $(this),
    id = link.attr('href').slice(1),
    scrollToEl = document.getElementById(id),
    y = scrollToEl.getBoundingClientRect().top

  smoothscroll(scrollToEl, calculateDuration(y))

  return false
}

function calculateDuration(y) {
  return (y - scrollY) / 600
}

function expanderClicked() {
  if (setOfAnimatingElements.has(this)) return

  setOfAnimatingElements.add(this, true)

  const button = $(this)

  if (isExtraSmallScreen() && !button.hasClass('expanded')) {
    smoothscroll(this, delay)
  }

  return Promise.all([rotateButton(button), toggleContentState(button)]).then(
    () => {
      button.toggleClass('expanded')
      setOfAnimatingElements.delete(this)
    }
  )
}

function rotateButton(button) {
  const [to, from] = button.hasClass('expanded')
    ? ['0deg', '180deg']
    : ['180deg', '0deg']

  return animate(button.find('svg')[0], {
    transform: [`rotate(${to})`, `rotate(${from})`],
  })
}

function isExtraSmallScreen() {
  return window.matchMedia(`(max-width: ${xsMax})`).matches
}

function toggleContentState(button) {
  const content = button.siblings('.content')[0],
    isExpanded = button.hasClass('expanded'),
    closedHeight = 0

  let openHeight = content.clientHeight

  if (!isExpanded) {
    $(content).css('height', 'auto')
    openHeight = content.clientHeight
    $(content).css('height', '0')
  }

  const [to, from] = isExpanded
    ? [closedHeight, openHeight]
    : [openHeight, closedHeight]

  return animate(content, { height: [`${to}px`, `${from}px`] })
}
