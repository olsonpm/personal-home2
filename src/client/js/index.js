'use strict';


//---------//
// Imports //
//---------//

const $ = require('domtastic')
  , smoothscroll = require('smoothscroll')
  , velocity = require('velocity-animate')
  ;


//------//
// Init //
//------//

const DELAY = 600
  , isAnimating = new Set()
  ;


//------//
// Main //
//------//

$('button.expander').on('click', expanderClicked);
window.scrollTo = scrollTo;


//-------------//
// Helper Fxns //
//-------------//

function scrollTo() {
  const link = $(this)
    , id = link.attr('href').slice(1)
    , scrollToEl = document.getElementById(id)
    , y = scrollToEl.getBoundingClientRect().top
    ;

  smoothscroll(scrollToEl, calculateDuration(y));

  return false;
}

function calculateDuration(y) {
  return (y - scrollY) / 600;
}

function expanderClicked() {
  if (isAnimating.has(this)) return;

  handleIsAnimating(this);

  const btn = $(this);

  rotateButton(btn);
  toggleContentState(btn);

  if (!btn.hasClass('expanded')) {
    smoothscroll(this, DELAY);
  }
}

function handleIsAnimating(btn) {
  isAnimating.add(btn, true);
  setTimeout(
    () => isAnimating.delete(btn)
    , DELAY
  );
}

function rotateButton(btn) {
  const rotateTo = (btn.hasClass('expanded'))
    ? 0
    : '180deg';

  velocity(btn.find('svg')[0], { rotateZ: rotateTo }, DELAY);
}

function toggleContentState(btn) {
  const content = btn.siblings('.content')[0];
  let heightTo = 0;

  if (!btn.hasClass('expanded')) {
    $(content).css('height', 'auto');
    heightTo = content.clientHeight;
    $(content).css('height', '0');
  }

  velocity(content, { height: heightTo }, DELAY, () => btn.toggleClass('expanded'));
}
