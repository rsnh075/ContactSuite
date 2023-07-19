/**
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   *
  */

 import { validateValue } from './../helpers/validationRegex';
 import { store }         from './../store/cmStore';

export const ValidateAsyncDir = {
  mounted: function(el, binding) {
    let _fieldsToValidate = [].slice.call(
        el.querySelectorAll('[data-validate]')
      ),
      _isvalid          = new Event('valid'),
      _notValid         = new Event('notvalid'),
      _submitBtn        = [].slice.call(document.querySelectorAll('.' + binding.value.submitBtns)),
      _errorColor       = store.state.settings.forms.errorcolor,
      _message          = document.createElement('span'),
      _pointer          = document.createElement('span'),
      _theForm          = el,
      _messageBalloons  = [],
      _revalTrigger     = el.querySelector('[data-revalidate]'),
      _resetTrigger     = el.querySelector('[data-reset]');

    el.setAttribute('data-nrformfield', _fieldsToValidate.length)

    const _validateForm = e => {
      let _formNotValidCount = 0,
          _nrOfFields = el.getAttribute('data-nrformfield'),
          _partial    = _theForm.getAttribute('data-partial');

      if(_isActive(_theForm)) {
        if(_nrOfFields != _fieldsToValidate.length) {
          _fieldsToValidate = [].slice.call(
            el.querySelectorAll('[data-validate]')
          );
          _setValidMessage();
        }
        for(let i = 0; i < _nrOfFields; i++) {
          let formEl      = _fieldsToValidate[i],
              _rule       = formEl.getAttribute('data-validate'),
              _reg        = /custom_/,
              _customRule = _reg.exec(_rule),
              _isValid    = true;

          if(_partial != null && _partial == 'form') {
            if(_customRule == null) {
              _rule = _rule.replace('_skip', '');
              _isValid = validateValue(formEl.value, _rule);
              _displayValidationResult(_isValid, formEl);
              if(!_isValid) _formNotValidCount++;
            } else {
              let _cRule = _customRule.input.split(_customRule[0])[1],
                _isValid = _customValidation(_cRule, formEl);
              _rule = _rule.replace('_skip', '');
              if(!_isValid) _formNotValidCount++;
            }
          } else {
            if(_rule.indexOf('_skip') == -1) {
              if(_customRule == null) {
                _isValid = validateValue(formEl.value, _rule);
                _displayValidationResult(_isValid, formEl);
                if(!_isValid) _formNotValidCount++;
              } else {
                let _cRule = _customRule.input.split(_customRule[0])[1],
                _isValid = _customValidation(_cRule, formEl);
                if(!_isValid) _formNotValidCount++;
              }
            }
          }
        }
        return _formNotValidCount == 0;
      }
    };

    const _validateField = e => {
      let _el       = e.target,
        _rule       = _el.getAttribute('data-validate'),
        _reg        = /custom_/,
        _customRule = _reg.exec(_rule);

      if(_rule != 'isAll') {
        if(_customRule == null) {
          _displayValidationResult(validateValue(_el.value, _rule), _el);
        } else {
          let _cRule = _customRule.input.split(_customRule[0])[1],
              _isValid = _customValidation(_cRule, _el);
          if(!_isValid) _formNotValidCount++;
        }
      }
    };

    const _customValidation = (customRule, formElem) => {
      let _isValid = true;
      switch(customRule) {
        case 'isEqualWith':
          let _isValid = formElem.value == document.querySelector('#' + formElem.id.substring(0, formElem.id.length - 1)).value;
          _displayValidationResult(_isValid, formElem);
          break;
      }
      return _isValid;
    };

    const _displayValidationResult = (status, formElem) => {
      if (status) {
        formElem.style.borderBottomColor = _errorColor;
        formElem.parentElement.querySelector('[data-name="validMessage"]').style.display = 'none';
      } else {
        formElem.style.borderBottomColor = '';
        formElem.parentElement.querySelector('[data-name="validMessage"]').style.display = 'block';
      }
    };

    _pointer.style.position = 'absolute';
    _pointer.style.bottom = '90%';
    _pointer.style.left = '5px';
    _pointer.style.width = '0';
    _pointer.style.height = '0';
    _message.style.display = 'block';
    _pointer.style.zIndex = 10;
    _pointer.style.border = '9px solid transparent';
    _pointer.style.borderBottomColor = _errorColor;

    _message.style.position = 'absolute';
    _message.style.top = '110%';
    _message.style.left = 0;
    _message.style.zIndex = 20;
    _message.style.backgroundColor = _errorColor;
    _message.style.color = '#FFF';
    _message.style.padding = '6px 10px';
    _message.style.fontSize = '10px';
    _message.style.display = 'none';
    _message.style.boxShadow = '0 1px 4px 0 rgba(0,0,0,.2)';
    _message.setAttribute('data-name', 'validMessage');

    const _setValidMessage = () => _fieldsToValidate.forEach(formEl => {
      let __message = _message = _message.cloneNode(true);

      __message.innerHTML = formEl.getAttribute('data-message');
      formEl.parentElement.appendChild(__message);
      __message.appendChild(_pointer.cloneNode(true));

      _messageBalloons.push(__message);

      formEl.addEventListener('keyup', _validateField, false);
      formEl.addEventListener('change', _validateField, false);
    });

    _setValidMessage();

    const _validateToSubmit = () => {
        _validateForm() ? el.dispatchEvent(_isvalid) : el.dispatchEvent(_notValid);
    }

    const _resetValidation = () => {
      _messageBalloons.forEach(balloon => balloon.style.display = 'none');
    }

    if(_submitBtn != null && _submitBtn.length > 0) {
      _submitBtn.forEach(cta => cta.addEventListener('click', _validateToSubmit, false));
    }

    if(typeof _revalTrigger !== 'undefined' && _revalTrigger != null) {
      _revalTrigger.addEventListener('revalidate', _validateForm, false);
    }

    if(typeof _resetTrigger !== 'undefined' && _resetTrigger != null) {
      _resetTrigger.addEventListener('reset', _resetValidation, false);
    }

    const _isActive = el => {
      let _style = window.getComputedStyle(el);
      return _style.display !== 'none';
    };
  },
  updated: function(el, binding) {
    let _fieldsToValidate = [].slice.call(
        el.querySelectorAll('[data-validate]'));
    el.setAttribute('data-nrformfield', _fieldsToValidate.length)
  },
  unmounted: function(el, binding) {
    let _fieldsToValidate = el.querySelectorAll('[data-validate]');
    _fieldsToValidate.forEach(formEl => {
      if(typeof _validateForm !== 'undefined') {
        formEl.removeEventListener('keyup', _validateField, false);
        formEl.removeEventListener('change', _validateField, false);
      }
    });
    if(typeof _submitBtn !== 'undefined' && _submitBtn.length > 0) {
      _submitBtn.forEach(cta => cta.removeEventListener('click', _validateToSubmit, false));
    }
    if(typeof _revalTrigger !== 'undefined' && _revalTrigger.length > 0) {
      _revalTrigger.forEach(trigger => trigger.removeEventListener('revalidate', _validateForm, false));
    }
    if(typeof _resetTrigger !== 'undefined' && _resetTrigger.length > 0) {
      _resetTrigger.forEach(trigger => trigger.removeEventListener('reset', _resetValidation, false));
    }
  }
};
