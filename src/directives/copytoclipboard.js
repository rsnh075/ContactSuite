export const CopyToClipboard = {
  mounted: function(el, binding) {
    let _srcField      = el.querySelector('input[name="' + binding.value.fieldName + '"]'),
        _copyBtnClass  = binding.value.targetClass,
        _copyBtn       = null;


    const _copyToClipboard = str => {
      let _flag = -1;
      if(_srcField.disabled) {
        _srcField.disabled = false;
        _flag = 1;
      }
      _srcField.select();
      _srcField.setSelectionRange(0, 99999);
      //   document.execCommand('copy');
      navigator.clipboard.writeText(_srcField.value);
      window.getSelection().removeAllRanges();
      if(_flag == 1)
        _srcField.disabled = true;
    };

    const _createCopyBtn = _ => {
      let _elm = document.createElement('div');

      _elm.classList.add(_copyBtnClass);
      _elm.innerHTML = '&#XF18F';
      el.appendChild(_elm);
      return _elm;
    };

    const _int = _ => {
      _copyBtn = _createCopyBtn();

      if (_copyBtn != null) {
        _copyBtn.addEventListener('click', _copyToClipboard, false);
      }
    };

    _int();
  }
};
