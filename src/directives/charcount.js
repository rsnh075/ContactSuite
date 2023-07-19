export const CharCount = {
  mounted: function(el, binding) {
    let _srcField      = el.querySelector('input[name="' + binding.value.fieldName + '"]'),
        _maxChars      = binding.value.maxChars,
        _outputClass   = binding.value.targetClass,
        _outputTarget  = null;
    

    const _countChars = _ => {
      _outputTarget.innerHTML = _srcField.value.length + '/' + _maxChars;

      if(_srcField.value.length == _maxChars)
        _outputTarget.style.color = '#C00';
      else
        _outputTarget.style.color = '';
      
      _setPadding();
      _displayField(true);

    }

    const _setPadding = _ => {
      _srcField.style.paddingRight = _outputTarget.getBoundingClientRect().width + 10 + 'px';
    }

    const _createOutputTarget = _ => {
      let _elm = document.createElement('div');
      _elm.classList.add(_outputClass);
      el.appendChild(_elm);
      return _elm;
    }

    const _displayField = status => {
      _outputTarget.style.display = status ? 'block' : 'none';
    }

    const _int = _ => {
      _outputTarget       = _createOutputTarget();
      _srcField.maxLength = _maxChars;


      if (_srcField != null) {
        _srcField.addEventListener('keyup', _countChars, false);
        _srcField.addEventListener('focus', _countChars, false);
        _srcField.addEventListener('blur', () => _displayField(false), false);
      }

      _countChars();
      _displayField(false);
    }

    _int();

  },
  unmounted: function(el, binding) {

  }
};