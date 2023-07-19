/**
 *
 *
 *
 */

interface OneParameterCallBack {
    (value: number): void;
}

const calculateMaxHeight = (element: HTMLElement, callBack: OneParameterCallBack): number => {
    let _cloneElm: HTMLElement = element.cloneNode(true),
        _height: number;

    _cloneElm.removeAttribute('id');

    if (element.parentElement) {
        //element.parentElement.style.overflow = "hidden";
        element.parentElement.appendChild(_cloneElm);
    } else {
        document.appendChild(_cloneElm);
    }

    _cloneElm.style.position = 'fixed';
    _cloneElm.style.display = 'block';
    _cloneElm.style.overflow = 'hidden';
    _cloneElm.style.transition = 'none';
    _cloneElm.style.marginLeft = '-4000px';
    _cloneElm.style.maxHeight = '100000px';
    _cloneElm.style.height = 'auto';
    _cloneElm.style.width = '100%';
    _height = _cloneElm.scrollHeight;

    if (element.parentElement) {
        element.parentElement.removeChild(_cloneElm);
        //element.parentElement.style.removeProperty('overflow');
    } else {
        document.removeChild(_cloneElm);
    }

    if (typeof callBack === 'function') {
        callBack(_height);
    } else {
        return _height;
    }
};

const calculateMaxWidth = (element, callBack) => {
    let _cloneElm = element.cloneNode(true),
        _width: number;

    _cloneElm.removeAttribute('id');

    if (element.parentElement) {
        //element.parentElement.style.overflow = "hidden";
        element.parentElement.appendChild(_cloneElm);
    } else {
        document.appendChild(_cloneElm);
    }

    _cloneElm.style.position = 'absolute';
    _cloneElm.style.display = 'block';
    _cloneElm.style.overflow = 'hidden';
    _cloneElm.style.transition = 'none';
    _cloneElm.style.marginTop = '-4000px';
    if (window.getComputedStyle(element, null).getPropertyValue('max-width') != undefined && window.getComputedStyle(element, null).getPropertyValue('max-width') != 'none') {
        _cloneElm.style.maxWidth = window.getComputedStyle(element, null).getPropertyValue('max-width');
    } else {
        _cloneElm.style.maxWidth = '100000px';
    }
    // _cloneElm.style.maxWidth    = "100000px";
    _cloneElm.style.width = 'auto';
    _cloneElm.style.height = '100%';
    _width = _cloneElm.scrollWidth;

    if (element.parentElement) {
        element.parentElement.removeChild(_cloneElm);
        //element.parentElement.style.removeProperty('overflow');
    } else {
        document.removeChild(_cloneElm);
    }

    if (typeof callBack === 'function') {
        callBack(_width);
    } else {
        return _width;
    }
};

const cancelEvent = (e) => {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
};

const coordsElementInViewport = (srcEl: HTMLElement, targetEl: HTMLElement, className = '') => {
    if (className !== '') {
        targetEl.classList.remove(className);
    }
    let _bodyRect = document.body.getBoundingClientRect(),
        _srcRect = srcEl.getBoundingClientRect(),
        _elmHeight = calculateMaxHeight(targetEl),
        _vpHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        _srcRectBottom = _srcRect.top - _bodyRect.top + _srcRect.height,
        _top,
        _left,
        _class,
        _maxHeight = 4000;

    const _menuHeight = 80; // else stuff falls behind the menu
    if (_srcRectBottom + _elmHeight > _vpHeight) { // bottom of target falls below bottom of window
        const topSpace = _srcRect.top - _menuHeight;
        const bottomSpace = _vpHeight - _srcRectBottom;
        _top = _srcRect.top - _elmHeight;
        if (topSpace > bottomSpace) { // show above
            if (_top < _menuHeight) {
                _maxHeight = _elmHeight + _top - _menuHeight;
                _top = _menuHeight;
            }
            _class = className;
        } else { // show below
            _top = _srcRectBottom;
            if (_top + _elmHeight > _vpHeight) {
                _maxHeight = _vpHeight - _top - 8;
            }
        }
    } else { // plenty of space below, normal dropdown
        _top = _srcRectBottom;
        if (_top + _elmHeight > _vpHeight) {
            _maxHeight = _vpHeight - _top - 8;
        }
    }

    _left = _srcRect.left - _bodyRect.left;

    return {
        top: _top,
        left: _left,
        maxHeight: _maxHeight,
        availableHeight: _vpHeight - _top,
        className: _class
    };
};

const coordsElementInViewportFourQuadrants = (srcEl, targetEl) => {
    let _bodyRect = document.body.getBoundingClientRect(),
        _bodyRectCenter = (_bodyRect.bottom + 100) / 2,
        _srcRect = srcEl.getBoundingClientRect(),
        _srcRectCenter = _srcRect.top + (_srcRect.top - _srcRect.bottom) / 2,
        _elmHeight = calculateMaxHeight(targetEl),
        _elmWidth = calculateMaxWidth(targetEl),
        _vpHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        _fitsBelow = _elmHeight <= _vpHeight - _srcRect.bottom - 20,
        _fitsAbove = _elmHeight <= _srcRect.top - 100,
        _topPos = _srcRect.top - _bodyRect.top + _srcRect.height,
        _leftPos = _srcRect.left - _bodyRect.left + _srcRect.width,
        _top,
        _left,
        _class: string,
        _shortenedElmHeight;

    if (_bodyRectCenter > _srcRectCenter) {
        //bottom space available is more
        if (_fitsBelow) {
            _shortenedElmHeight = _elmHeight;
        } else {
            //shorten
            _shortenedElmHeight = _vpHeight - _srcRect.bottom - 20;
        }
        _top = _topPos;
        _class = 'Bottom';
    } else {
        //top space available is more
        if (_fitsAbove) {
            _shortenedElmHeight = _elmHeight;
            _top = _topPos - _elmHeight - _srcRect.height;
        } else {
            //shorten
            _shortenedElmHeight = _srcRect.top - 100;
            _top = _topPos - _srcRect.height - _shortenedElmHeight;
        }
        _class = 'Top';
    }

    //test if right of _srcRect fits, if not then left
    if (_leftPos - _elmWidth > 250) {
        //place left, 250 accounts for open aside
        _left = _leftPos - _elmWidth;
        _class += 'Left';
    } else {
        //place right
        _left = _leftPos - _srcRect.width;
        _class += 'Right';
    }

    return {
        top: _top,
        left: _left,
        height: _elmHeight,
        width: _elmWidth,
        className: _class,
        shortenedHeight: _shortenedElmHeight
    };
};

const transitionEnd = () => {
    let t,
        el = document.createElement('fakeelement');

    let transitions = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'oTransitionEnd',
        msTransition: 'MSTransitionEnd',
        transition: 'transitionend'
    };

    for (t in transitions) {
        if (el.style[t] !== undefined) {
            return transitions[t];
        }
    }
};

const hexToRgb = (hex) => {
    var __hex = hex.replace('#', ''),
        __r = parseInt(__hex.substr(0, 2), 16),
        __g = parseInt(__hex.substr(2, 2), 16),
        __b = parseInt(__hex.substr(4, 2), 16);

    return {
        r: __r,
        g: __g,
        b: __b
    };
};

const getLuminance = (r, g, b) => {
    let _a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return _a[0] * 0.2126 + _a[1] * 0.7152 + _a[2] * 0.0722;
};

const scrollTo = (element, to, duration) => {
    let _start = element.scrollTop,
        _change = to - _start,
        _currentTime = 0,
        _increment = 20;

    let _animateScroll = () => {
        _currentTime += _increment;
        element.scrollTop = Math.easeInOutQuad(_currentTime, _start, _change, duration);
        if (_currentTime < duration) {
            setTimeout(_animateScroll, _increment);
        }
    };
    _animateScroll();
};

Math.easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
};

const convertToUrlFriendly = (str, l) => {
    let _str = '',
        _alowedChars = /[a-z]|[A-Z]|[0-9]|[-]/,
        _stripStartDash = /^[-].*$/,
        _stripEndDash = /^.*[-]$/;

    str.split('').forEach((char) => {
        if (_alowedChars.test(char)) _str += char.toLowerCase();
    });

    while (_stripStartDash.test(_str)) {
        _str = _str.slice(1);
    }

    while (_stripEndDash.test(_str)) {
        _str = _str.slice(0, -1);
    }

    return _str.substr(0, l);
};

const deepCopy = (srcObject) => {
    let _destObject;

    if (typeof srcObject !== 'object' || srcObject === null) {
        return srcObject;
    }

    _destObject = Array.isArray(srcObject) ? [] : {};

    for (const _key in srcObject) {
        _destObject[_key] = deepCopy(srcObject[_key]);
    }
    return _destObject;
};

const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

const getUniqueId = () => '_' + Math.random().toString(32).substring(2, 11);

export {
    calculateMaxHeight,
    calculateMaxWidth,
    cancelEvent,
    coordsElementInViewport,
    coordsElementInViewportFourQuadrants,
    transitionEnd,
    scrollTo,
    convertToUrlFriendly,
    hexToRgb,
    getLuminance,
    deepCopy,
    isJsonString,
    getUniqueId,
};
