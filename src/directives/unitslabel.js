export const UnitsLabel = {
  mounted: function(el, binding) {
  	let _srcField      = el.querySelector('input'),
				_outputLabel   = binding.value.label,
  			_outputTarget  = null;

    const _createOutputTarget = _ => {
      let _elm = document.createElement('div');

      _elm.innerHTML = _outputLabel;
      _elm.classList.add('form-textfield__feedback-inline');
      el.appendChild(_elm);
      return _elm;
   	}

   	const _setPadding = _ => {
      _srcField.style.paddingRight = _outputTarget.getBoundingClientRect().width + 10 + 'px';
    }

    const _int = _ => {
      _outputTarget = _createOutputTarget();
      
      if (_srcField != null)
      	_setPadding();
    }

    _int();
  }
};
