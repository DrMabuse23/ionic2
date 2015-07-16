// Use Angular's promise which doesn't swallow exceptions
import {Promise} from 'angular2/src/facade/async';

const nativeRaf = window.requestAnimationFrame ||
   window.webkitRequestAnimationFrame ||
   window.mozRequestAnimationFrame;

const nativeCancelRaf = window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.webkitCancelRequestAnimationFrame;

export const raf = nativeRaf || function(callback) {
    let timeCurrent = (new Date()).getTime(),
        timeDelta;

    /* Dynamically set delay on a per-tick basis to match 60fps. */
    /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
    timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
    timeLast = timeCurrent + timeDelta;

    return setTimeout(function() { callback(timeCurrent + timeDelta); }, timeDelta);
}

export const rafCancel = nativeRaf ? nativeCancelRaf : function(id) {
  return window.cancelTimeout(id);
}

export function rafPromise() {
  return new Promise(resolve => raf(resolve));
}

export let CSS = {};
(function() {
  // transform
  var i, keys = ['webkitTransform', 'transform', '-webkit-transform', 'webkit-transform',
                 '-moz-transform', 'moz-transform', 'MozTransform', 'mozTransform', 'msTransform'];

  for (i = 0; i < keys.length; i++) {
    if (document.documentElement.style[keys[i]] !== undefined) {
      CSS.transform = keys[i];
      break;
    }
  }

  // transition
  keys = ['webkitTransition', 'mozTransition', 'msTransition', 'transition'];
  for (i = 0; i < keys.length; i++) {
    if (document.documentElement.style[keys[i]] !== undefined) {
      CSS.transition = keys[i];
      break;
    }
  }

  // The only prefix we care about is webkit for transitions.
  var isWebkit = CSS.transition.indexOf('webkit') > -1;

  CSS.prefix = isWebkit ? '-webkit-' : '';

  // transition duration
  CSS.transitionDuration = (isWebkit ? '-webkit-' : '') + 'transition-duration';

  // To be sure transitionend works everywhere, include *both* the webkit and non-webkit events
  CSS.transitionEnd = (isWebkit ? 'webkitTransitionEnd ' : '') + 'transitionend';
})();

if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
  CSS.animation = 'WebkitAnimation';
  CSS.animationStart = 'webkitAnimationStart animationstart';
  CSS.animationEnd = 'webkitAnimationEnd animationend';
} else {
  CSS.animation = 'animation';
  CSS.animationStart = 'animationstart';
  CSS.animationEnd = 'animationend';
}

export function transitionEnd(el:Element) {
  return cssPromise(el, CSS.transitionEnd);
}

export function animationStart(el:Element, animationName) {
  return cssPromise(el, CSS.animationStart, animationName);
}

export function animationEnd(el:Element, animationName) {
  return cssPromise(el, CSS.animationEnd, animationName);
}

function cssPromise(el:Element, eventNames, animationName) {
  return new Promise(resolve => {
    eventNames.split(' ').forEach(eventName => {
      el.addEventListener(eventName, onEvent);
    })
    function onEvent(ev) {
      if (ev.animationName && animationName) {
        // do not resolve if a bubbled up ev.animationName
        // is not the same as the passed in animationName arg
        if (ev.animationName !== animationName) {
          return;
        }
      } else if (ev.target !== el) {
        // do not resolve if the event's target element is not
        // the same as the element the listener was added to
        return;
      }
      ev.stopPropagation();
      eventNames.split(' ').forEach(eventName => {
        el.removeEventListener(eventName, onEvent);
      })
      resolve(ev);
    }
  });
}

export function ready(callback) {
  let promise = null;

  if (!callback) {
    // a callback wasn't provided, so let's return a promise instead
    promise = new Promise(resolve => { callback = resolve; });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    callback();

  } else {
    function completed() {
      document.removeEventListener('DOMContentLoaded', completed, false);
      window.removeEventListener('load', completed, false);
      callback();
    }

    document.addEventListener('DOMContentLoaded', completed, false);
    window.addEventListener('load', completed, false);
  }

  return promise;
}

export function windowLoad(callback) {
  let promise = null;

  if (!callback) {
    // a callback wasn't provided, so let's return a promise instead
    promise = new Promise(resolve => { callback = resolve; });
  }

  if (document.readyState === 'complete') {
    callback();

  } else {
    function completed() {
      window.removeEventListener('load', completed, false);
      callback();
    }

    window.addEventListener('load', completed, false);
  }

  return promise;
}

export function pointerCoord(ev) {
  // get coordinates for either a mouse click
  // or a touch depending on the given event
  let c = { x: 0, y: 0 };
  if (ev) {
    const touches = ev.touches && ev.touches.length ? ev.touches : [ev];
    const e = (ev.changedTouches && ev.changedTouches[0]) || touches[0];
    if (e) {
      c.x = e.clientX || e.pageX || 0;
      c.y = e.clientY || e.pageY || 0;
    }
  }
  return c;
}

export function hasPointerMoved(tolerance, startCoord, endCoord) {
  return Math.abs(startCoord.x - endCoord.x) > tolerance ||
         Math.abs(startCoord.y - endCoord.y) > tolerance;
}

export function hasFocus(ele) {
  return !!(ele && (document.activeElement === ele.nativeElement || document.activeElement === ele));
}