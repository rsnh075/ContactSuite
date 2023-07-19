/**
 *
 *
 *
 */

const uniqueId = () => {
  return '_' + Math.random().toString(32).substr(2, 9);
}

const setCaretPos = (domElem, pos) => {
  if(domElem.setSelectionRange) {
    domElem.focus();
    domElem.setSelectionRange(pos, pos);
  }
  else if (domElem.createTextRange) {
    var range = domElem.createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
}

const _createGhostObject = () => {
  //CREATE AND CHECK GLOBAL OBJECT
  if(typeof __ghostValue === "undefined")
    window.__ghostValue = {};
}

const _numpadChars = (key) => {
  let _result = "";
  if(key == 96) _result  = 0;
  if(key == 97) _result  = 1;
  if(key == 98) _result  = 2;
  if(key == 99) _result  = 3;
  if(key == 100) _result = 4;
  if(key == 101) _result = 5;
  if(key == 102) _result = 6;
  if(key == 103) _result = 7;
  if(key == 104) _result = 8;
  if(key == 105) _result = 9;
  return _result;
}

const isPhoneNumberMask = event => {
  _createGhostObject();

  let _evt             = event || window.event,
      _key             = _evt.keyCode || _evt.which,
      _keystr          = String.fromCharCode( _key ),
      _shiftDown       = _evt.shiftKey,
      _text            = _evt.target,
      _value           = _text.value,
      _id,
      _pattern         = /[0-9]/,
      _newValue        = "",
      _newLength       = 0,
      _carretStart     = _text.selectionStart,
      _carretEnd       = _text.selectionEnd,
      _isSelection     = _carretStart !== _carretEnd;


  //STOP DEFAULT BEHAVIOUR
  if(_key != 9) {
    _evt.returnValue = false;
    if(_evt.preventDefault)
      _evt.preventDefault();
  }

  //ADD ID IF NOT PROFIDED TO STORE GHOST VALUE IN GHOSTOBJECT
  _id = (_text.id != '') ? _text.id : _text.id = uniqueId();

  //CREATE PROPERTY IN GHOSTOBJ TO STORE GHOST VALUE
  if(typeof __ghostValue[_id] === "undefined") {
    __ghostValue[_id] = _value;
  }
  
  //SELECTION DETECT AND REMOVE FOR OVERRIDE
  if(_isSelection) {
    let _tmpStr = String(__ghostValue[_id]);
    __ghostValue[_id] = _tmpStr.slice(0, _carretStart) + _tmpStr.slice(_carretEnd)
  }

  //ADD CHAR IF VALID
  if(_shiftDown && _key == 187 && __ghostValue[_id].length == 0) {
    __ghostValue[_id] += '+';
    _carretStart++;
  } else if(_key == 107 && __ghostValue[_id].length == 0) {
    __ghostValue[_id] += '+';
    _carretStart++;
  }
  else if((_pattern.test(_keystr) || _key >= 96 && _key <= 105) && __ghostValue[_id].length < 12) {
    let _tmpStr = String(__ghostValue[_id]);
    if(_key >= 96 && _key <= 105) {
        _keystr = _numpadChars(_key)
    }
    __ghostValue[_id] = _tmpStr.slice(0, _carretStart) + _keystr + _tmpStr.slice(_carretStart);
    _carretStart++;
  }

  _newLength = __ghostValue[_id].length;

  //IF ARROW LEFT PRESSED
  if(_key == 37) {
    _text.setSelectionRange(_text.selectionStart - 1, _text.selectionStart - 1);
    _carretStart = _text.selectionStart;
  }

  //IF ARROW RIGHT PRESSED
  if(_key == 39) {
    _text.setSelectionRange(_text.selectionStart + 1, _text.selectionStart + 1);
    _carretStart = _text.selectionStart;
  }

  //IF BACKSPACE PRESSED REMOVE LAST ITEM
  if(_key == 8 && !_isSelection) {
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, _carretStart-1) + String(__ghostValue[_id]).slice(_carretStart);
    _carretStart--;
  }

  //IF DEL PRESSED CLEAR VALUE
  if(_key == 46 && !_isSelection) {
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, _carretStart) + String(__ghostValue[_id]).slice(_carretStart+1);
  }

  //TEST MASK HERE
  __ghostValue[_id] = __ghostValue[_id].replace(/^00/gm, '+');
  __ghostValue[_id] = __ghostValue[_id].replace(/^0(9)/, '0');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(\+\d\d)9/, '$1');
  __ghostValue[_id] = __ghostValue[_id].replace(/^112/, '');

  setTimeout(() => {
    _text.setSelectionRange(_carretStart, _carretStart);
  });

  return __ghostValue[_id];
}

const isMacAddressMask = (event) => {
  _createGhostObject();

  let _evt           = event || window.event,
      _key           = _evt.keyCode || _evt.which,
      _keystr        = String.fromCharCode( _key ),
      _text          = _evt.target,
      _value         = _text.value,
      _id,
      _newLength     = 0,
      _hexdecPattern = /^[0-9a-fA-F]+$/,
      _carretStart   = _text.selectionStart,
      _carretEnd     = _text.selectionEnd,
      _isSelection   = _carretStart !== _carretEnd;

  //STOP DEFAULT BEHAVIOUR
  if(_key != 9) {
    _evt.returnValue = false;
    if(_evt.preventDefault)
      _evt.preventDefault();
  }

  //ADD ID IF NOT PROVIDED TO STORE RAW VALUE IN OBJECT
  _id = (_text.id != '') ? _text.id : _text.id = uniqueId();

  //CREATE PROPERTY IN OBJ TO STORE RAW VALUE
  if(typeof __ghostValue[_id] === "undefined") {
    if(_key != 9)
      __ghostValue[_id] = "";
    else
      __ghostValue[_id] = _value;
  }

  //SELECTION DETECT AND REMOVE FOR OVERRIDE
  if(_isSelection) {
    let _tmpStr = String(__ghostValue[_id]);
    __ghostValue[_id] = _tmpStr.slice(0, _carretStart) + _tmpStr.slice(_carretEnd)
  }

  //TEST VALID KEY
  if((_hexdecPattern.test(_keystr) || _key >= 96 && _key <= 105)) {
    let _tmpStr = String(__ghostValue[_id]);
    if(_key >= 96 && _key <= 105) {
      __ghostValue[_id] = _tmpStr.slice(0, _carretStart) + _numpadChars(_key) + _tmpStr.slice(_carretStart);
      _carretStart++;
    } else {
      __ghostValue[_id] = _tmpStr.slice(0, _carretStart) + _keystr + _tmpStr.slice(_carretStart);;
      _carretStart++;
    }
  }

  _newLength  = __ghostValue[_id].length;

  //IF ARROW LEFT PRESSED
  if(_key == 37) {
    _text.setSelectionRange(_text.selectionStart - 1, _text.selectionStart - 1);
    _carretStart = _text.selectionStart;
  }

  //IF ARROW RIGHT PRESSED
  if(_key == 39) {
    _text.setSelectionRange(_text.selectionStart + 1, _text.selectionStart + 1);
    _carretStart = _text.selectionStart;
  }

  //IF BACKSPACE PRESSED REMOVE LAST ITEM
  if(_key == 8 && !_isSelection) {
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, _carretStart-1) + String(__ghostValue[_id]).slice(_carretStart);
    _carretStart--;
  }

  //IF DEL PRESSED CLEAR VALUE
  if(_key == 46 && !_isSelection) {
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, _carretStart) + String(__ghostValue[_id]).slice(_carretStart+1);
  }

  _newLength = __ghostValue[_id].length;

  //ADD COLON
  if(_key != 8 && _key != 46 && !_isSelection) {
    __ghostValue[_id] = __ghostValue[_id].replace(/^([0-9A-Fa-f]){2}$/, '$&:');
    __ghostValue[_id] = __ghostValue[_id].replace(/^([0-9A-Fa-f]){2}[:]([0-9A-Fa-f]{2})$/, '$&:');
    __ghostValue[_id] = __ghostValue[_id].replace(/^(([0-9A-Fa-f]){2}[:]){2}([0-9A-Fa-f]{2})$/, '$&:');
    __ghostValue[_id] = __ghostValue[_id].replace(/^(([0-9A-Fa-f]){2}[:]){3}([0-9A-Fa-f]{2})$/, '$&:');
    __ghostValue[_id] = __ghostValue[_id].replace(/^(([0-9A-Fa-f]){2}[:]){4}([0-9A-Fa-f]{2})$/, '$&:');
  }

  if(__ghostValue[_id].length - _newLength == 1)
    _carretStart++;

  setTimeout(() => {
    _text.setSelectionRange(_carretStart, _carretStart);
  });

  return __ghostValue[_id];
}

const isNumberMask = (event) => {
  _createGhostObject();

  let _evt           = event || window.event,
      _key           = _evt.keyCode || _evt.which,
      _keystr        = String.fromCharCode( _key ),
      _text          = _evt.target,
      _value         = _text.value,
      _id,
      _newLength     = 0,
      _numberPattern = /[0-9]/,
      _carretStart   = _text.selectionStart,
      _carretEnd     = _text.selectionEnd,
      _isSelection   = _carretStart !== _carretEnd;

  //STOP DEFAULT BEHAVIOUR
  if(_key != 9) {
    _evt.returnValue = false;
    if(_evt.preventDefault)
      _evt.preventDefault();
  }

  //ADD ID IF NOT PROVIDED TO STORE RAW VALUE IN OBJECT
  _id = (_text.id != '') ? _text.id : _text.id = uniqueId();

  //CREATE PROPERTY IN OBJ TO STORE RAW VALUE
  if(typeof __ghostValue[_id] === "undefined") {
    if(_key != 9)
      __ghostValue[_id] = "";
    else
      __ghostValue[_id] = _value;
  }

  //SELECTION DETECT AND REMOVE FOR OVERRIDE
  if(_isSelection) {
    let _tmpStr = String(__ghostValue[_id]);
    __ghostValue[_id] = _tmpStr.slice(0, _carretStart) + _tmpStr.slice(_carretEnd)
  }

  //TEST VALID KEY
  if((_numberPattern.test(_keystr) || _key >= 96 && _key <= 105)) {
    let _tmpStr = String(__ghostValue[_id]);
    if(_key >= 96 && _key <= 105) {
      __ghostValue[_id] = _tmpStr.slice(0, _carretStart) + _numpadChars(_key) + _tmpStr.slice(_carretStart);
      _carretStart++;
    } else {
      __ghostValue[_id] = _tmpStr.slice(0, _carretStart) + _keystr + _tmpStr.slice(_carretStart);;
      _carretStart++;
    }
  }

  _newLength  = __ghostValue[_id].length;

  //IF ARROW LEFT PRESSED
  if(_key == 37) {
    _text.setSelectionRange(_text.selectionStart - 1, _text.selectionStart - 1);
    _carretStart = _text.selectionStart;
  }

  //IF ARROW RIGHT PRESSED
  if(_key == 39) {
    _text.setSelectionRange(_text.selectionStart + 1, _text.selectionStart + 1);
    _carretStart = _text.selectionStart;
  }

  //IF BACKSPACE PRESSED REMOVE LAST ITEM
  if(_key == 8 && !_isSelection) {
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, _carretStart-1) + String(__ghostValue[_id]).slice(_carretStart);
    _carretStart--;
  }

  //IF DEL PRESSED CLEAR VALUE
  if(_key == 46 && !_isSelection) {
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, _carretStart) + String(__ghostValue[_id]).slice(_carretStart+1);
  }

  setTimeout(() => {
    _text.setSelectionRange(_carretStart, _carretStart);
  });

  return __ghostValue[_id];
}

const isMaxNumberMask = (event, max) => {
  _createGhostObject();

  let _evt           = event || window.event,
      _key           = _evt.keyCode || _evt.which,
      _keystr        = String.fromCharCode( _key ),
      _text          = _evt.target,
      _value         = _text.value,
      _id,
      _numberPattern = /[0-9]/,
      _newLength     = 0,
      _l             = String(max).length;

  //STOP DEFAULT BEHAVIOUR
  if(_key != 9) {
    _evt.returnValue = false;
    if(_evt.preventDefault)
      _evt.preventDefault();
  }

  //ADD ID IF NOT PROFIDED TO STORE RAW VALUE IN OBJECT
  _id = (_text.id != '') ? _text.id : _text.id = uniqueId();

  //CREATE PROPERTY IN OBJ TO STORE RAW VALUE
  if(typeof __ghostValue[_id] === "undefined") {
    if(_key != 9)
      __ghostValue[_id] = "";
    else
      __ghostValue[_id] = (_value == 0 || _value == '') ? 0 : _value;
  }

  if((_numberPattern.test(_keystr) || _key >= 96 && _key <= 105) && __ghostValue[_id].length < _l) {
    if(_key >= 96 && _key <= 105) {
      __ghostValue[_id] += _numpadChars(_key);
    } else {
      __ghostValue[_id] += _keystr;
    }
  }

  //IF BACKSPACE OR DEL PRESSED CLEAR VALUE
  if(_key == 46 || _key == 8)
    __ghostValue[_id] = '';

  _newLength  = __ghostValue[_id].length;

  setCaretPos(_text, _newLength);

  return __ghostValue[_id];
}


const isPhoneNumberPartMask = event => {
  _createGhostObject();

  let _evt           = event || window.event,
      _key           = _evt.keyCode || _evt.which,
      _keystr        = String.fromCharCode( _key ),
      _shiftDown     = _evt.shiftKey,
      _text          = _evt.target,
      _value         = _text.value,
      _id,
      _pattern       = /[0-9]/,
      _carretPos     = 0,
      _newLength     = 0;

  //STOP DEFAULT BEHAVIOUR
  if(_key != 9) {
    _evt.returnValue = false;
    if(_evt.preventDefault)
      _evt.preventDefault();
  }

  //ADD ID IF NOT PROFIDED TO STORE RAW VALUE IN OBJECT
  _id = (_text.id != '') ? _text.id : _text.id = uniqueId();

  //CREATE PROPERTY IN OBJ TO STORE RAW VALUE
  if(typeof __ghostValue[_id] === "undefined") {
    if(_key != 9)
      __ghostValue[_id] = "";
    else
      __ghostValue[_id] = _value;
  }

  if(_shiftDown && _key == 187)
    __ghostValue[_id] += '+';
  else if(_key == 107)
    __ghostValue[_id] += '+';
  else if((_pattern.test(_keystr) || _key >= 96 && _key <= 105) && __ghostValue[_id].length < 12) {
    if(_key >= 96 && _key <= 105) {
      __ghostValue[_id] += _numpadChars(_key);
    } else
      __ghostValue[_id] += _keystr;
  }

  //IF BACKSPACE PRESSED CLEAR VALUE
  if(_key == 46)
    __ghostValue[_id] = '';

  //IF DEL PRESSED REMOVE LAST ITEM
  if(_key == 8)
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, -1);

  _newLength  = __ghostValue[_id].length;
  _carretPos  = _newLength;
  _text.value = __ghostValue[_id];

  setTimeout(() => {
    _text.setSelectionRange(_carretPos, _carretPos);
  });

}

const isTimeMask = event => {
  _createGhostObject();

  let _evt           = event || window.event,
      _key           = _evt.keyCode || _evt.which,
      _keystr        = String.fromCharCode( _key ),
      _text          = _evt.target,
      _value         = _text.value,
      _newValue      = '',
      _id,
      _numberPattern = /[0-9]/,
      _carretPos     = 0,
      _newLength     = 0;


  //STOP DEFAULT BEHAVIOUR
  if(_key != 9) {
    _evt.returnValue = false;
    if(_evt.preventDefault)
      _evt.preventDefault();
  }

  //ADD ID IF NOT PROFIDED TO STORE RAW VALUE IN OBJECT
  _id = (_text.id != '') ? _text.id : _text.id = uniqueId();

  //CREATE PROPERTY IN OBJ TO STORE RAW VALUE
  if(typeof __ghostValue[_id] === "undefined") {
    if(_key != 9) //9 = tab
      __ghostValue[_id] = "";
    else
      __ghostValue[_id] = (__val == '0000' || __val == '') ? "" : __val;
  }

  if((_numberPattern.test(_keystr) || _key >= 96 && _key <= 105) && __ghostValue[_id].length < 4) {
    if(_key >= 96 && _key <= 105) {
      __ghostValue[_id] += _numpadChars(_key);
    } else {
      __ghostValue[_id] += _keystr;
    }
  }

  //IF BACKSPACE PRESSED CLEAR VALUE
  if(_key == 46)
    __ghostValue[_id] = '';

  //IF DEL PRESSED REMOVE LAST ITEM
  if(_key == 8)
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, -1);

  _newLength = __ghostValue[_id].length;

  //TEST MASK HERE
  __ghostValue[_id] = __ghostValue[_id].replace(/^([3-9])$/g, '0$1');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(2)([0-3])$/g, '$1$2');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(2)([4-9])$/g, '$1');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(\d{2})([0-5])$/g, '$1$2');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(\d{2})([6-9])$/g, '$1');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(\d{3})([0-9])$/g, '$1$2');

  _newLength = __ghostValue[_id].length;

  switch(_newLength) {
    case 0:
      _newValue  = '0000';
      _carretPos = 0;
      break;
    case 1:
      _newValue += __ghostValue[_id] + '000';
      _carretPos = 1;
      break;
    case 2:
      _newValue += __ghostValue[_id] + '00';
      _newLength++;
      _carretPos = 3;
      break;
     case 3:
      _newValue += __ghostValue[_id] + '0';
      _newLength++;
      _carretPos = 4;
      break;
     case 4:
      _newValue  = __ghostValue[_id]
      _newLength = _newValue.length;
      _carretPos = 5;
      break;
  }

  _text.value = [_newValue.slice(0, 2), ':', _newValue.slice(2)].join('');

  setTimeout(() => {
    _text.setSelectionRange(_carretPos, _carretPos);
  });
}

const isTimeMaskHHMMSS = event => {
  _createGhostObject();

  let _evt           = event || window.event,
      _key           = _evt.keyCode || _evt.which,
      _keystr        = String.fromCharCode( _key ),
      _text          = _evt.target,
      _value         = _text.value,
      _newValue      = '',
      _id,
      _numberPattern = /[0-9]/,
      _carretPos     = 0,
      _newLength     = 0;


  //STOP DEFAULT BEHAVIOUR
  if(_key != 9) {
    _evt.returnValue = false;
    if(_evt.preventDefault)
      _evt.preventDefault();
  }

  //ADD ID IF NOT PROVIDED TO STORE RAW VALUE IN OBJECT
  _id = (_text.id != '') ? _text.id : _text.id = uniqueId();

  //CREATE PROPERTY IN OBJ TO STORE RAW VALUE (__ghostValue[_id] = RAWINPUT VALUE)
  if(typeof __ghostValue[_id] === "undefined") {
    if(_key != 9)
      __ghostValue[_id] = "";
    else
      __ghostValue[_id] = (__val == '0000' || __val == '') ? "" : __val;
  }

  if((_numberPattern.test(_keystr) || _key >= 96 && _key <= 105) && __ghostValue[_id].length < 6) {
    if(_key >= 96 && _key <= 105) {
      __ghostValue[_id] += _numpadChars(_key);
    } else {
      __ghostValue[_id] += _keystr;
    }
  }

  //IF BACKSPACE PRESSED CLEAR VALUE
  if(_key == 46)
    __ghostValue[_id] = '';

  //IF DEL PRESSED REMOVE LAST ITEM
  if(_key == 8)
    __ghostValue[_id] = String(__ghostValue[_id]).slice(0, -1);

  _newLength = __ghostValue[_id].length;

  //TEST MASK HERE
  __ghostValue[_id] = __ghostValue[_id].replace(/^([3-9])$/g, '0$1');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(2)([0-3])$/g, '$1$2');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(2)([4-9])$/g, '$1');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(\d{2})([0-5])$/g, '$1$2');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(\d{2})([6-9])$/g, '$1');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(\d{3})([0-9])$/g, '$1$2');

  __ghostValue[_id] = __ghostValue[_id].replace(/^(\d{4})([0-5])$/g, '$1$2');
  __ghostValue[_id] = __ghostValue[_id].replace(/^(\d{4})([6-9])$/g, '$1');

  _newLength = __ghostValue[_id].length;

  switch(_newLength) {
    case 0:
      _newValue  = '000000';
      _carretPos = 0;
      break;
    case 1:
      _newValue += __ghostValue[_id] + '00000';
      _carretPos = 1;
      break;
    case 2:
      _newValue += __ghostValue[_id] + '0000';
      _newLength++;
      _carretPos = 3;
      break;
     case 3:
      _newValue += __ghostValue[_id] + '000';
      _newLength++;
      _carretPos = 4;
      break;
     case 4:
      _newValue  = __ghostValue[_id] + '00';
      _newLength = _newValue.length;
      _carretPos = 6;
      break;
     case 5:
      _newValue  = __ghostValue[_id] + '0';
      _newLength = _newValue.length;
      _carretPos = 7;
      break;
     case 6:
      _newValue  = __ghostValue[_id]
      _newLength = _newValue.length;
      _carretPos = 8;
      break;
  }

  _text.value = [_newValue.slice(0, 2), ':', _newValue.slice(2, 4), ':', _newValue.slice(4)].join('');

  setTimeout(() => {
    _text.setSelectionRange(_carretPos, _carretPos);
  });
}

const clearTimeMask = id => {
  if(typeof window.__ghostValue !== 'undefined')
    delete window.__ghostValue[id];
}

const clearAllTimeMask = () => {
  window.__ghostValue = {};
}

export {
  isTimeMask,
  isTimeMaskHHMMSS,
  isMaxNumberMask,
  isPhoneNumberMask,
  clearTimeMask,
  clearAllTimeMask,
  isPhoneNumberPartMask,
  isNumberMask,
  isMacAddressMask
};
