export const CSList = {
  mounted: function(el, binding, vnode) {
    const _options     = {
            separator              : ',',
            minChars               : 2,
            inputClass             : 'ui__csl-input',
            chipClass              : 'ui__csl-chip',
            chipLabelClass         : 'ui__csl-chip-label',
            chipRemoveBtnClass     : 'ui__csl-removebtn',
            chipRemoveAllBtnClass  : 'ui__csl-removeallbtn',
            copyBtnClass           : 'ui__csl-copybtn'
          },
          _closeIcon    = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>',
          _copyIcon     = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg>';

    let _csList = [];

    const _init = () => {
      for(let key in binding.value) {
        _options[key] = binding.value[key];
      }

      let _cslformfield = el.querySelector('INPUT');
      _csList           = _getList(_cslformfield.value);
      _cslformfield.setAttribute('type', 'hidden');
      _cslformfield.setAttribute('data-field', '');

      if(_csList.length > 0) {
        _createChips(el, _csList);
      }

      _createCSLinput(el);
      _createClearAll(el);
      _createCopyList(el);

      el.addEventListener('click', evt => {
        el.querySelector('.' + _options.inputClass).focus();
      }, false);
    };

    const _getList = list => {
     if(list !== '')
        return list.split(_options.separator);
      else
        return [];
    };

    const _getWrapper = item => {
      let __el = item;
      while(__el !== el) {
        __el = __el.parentElement;
      }
      return __el;
    };

    const _getIndex = item => {
      let __wrapper = item.parentElement;
      return [...__wrapper.children].findIndex(el => el === item);
    };

    const _editListItem = evt => {
      evt.stopPropagation();
      evt.target.setAttribute('contenteditable', true);
    };

    const _updateListItem = evt => {
      evt.stopPropagation();
      let __target = evt.target,
          __value  = __target.innerHTML,
          __field  = _getWrapper(__target).querySelector('[data-field]'),
          __list   = __field.value.split(_options.separator),
          __index  = _getIndex(__target.parentElement);

      __list[__index] = __value;
      __target.setAttribute('contenteditable', false);

      let x = new CustomEvent('listupdate', {
        detail: {
          list : __list.join(',')
        }
      });
      vnode.props.onListUpdate(x);
    };

    const _removeListItem = evt => {
      evt.stopPropagation();
      let __item   = evt.currentTarget.parentElement,
          __index  = _getIndex(__item),
          __field  = _getWrapper(__item).querySelector('[data-field]'),
          __list   = __field.value.split(_options.separator);

      __list.splice(__index, 1);
      __item.parentElement.removeChild(__item.parentElement.children[__index]);
      let x = new CustomEvent('listupdate', {
        detail: {
          list : __list.join(',')
        }
      });
      vnode.props.onListUpdate(x);
    };

    const _removeList = evt => {
      evt.stopPropagation();
      let __target   = evt.target,
          __wrapper  = _getWrapper(__target),
          __field    = __wrapper.querySelector('[data-field]');

      while(__wrapper.firstElementChild.classList.contains(_options.chipClass)) {
        __wrapper.removeChild(__wrapper.firstChild);
      };

      __field.value = '';
    };

    const _copyList = evt => {
      evt.stopPropagation();
      let __field     = _getWrapper(evt.target).querySelector('[data-field]'),
          __copyField = document.createElement('TEXTAREA');
      document.body.appendChild(__copyField);
      __copyField.value = __field.value;
      __copyField.select();
      document.execCommand("copy");
      document.body.removeChild(__copyField);
    };

    const _handleInput = evt => {
      let __target = evt.target;
      if(evt.key === _options.separator && __target.value.length > _options.minChars) {
        let __list = __target.nextSibling.value + ',' + __target.value.slice(0,-1);

        let x = new CustomEvent('listupdate', {
          detail: {
            list : __list.replace(/^,/, '')
          }
        });
        vnode.props.onListUpdate(x);

        _addChip(__target.parentElement, __target.value.slice(0,-1));
        __target.value = '';
      }
      if(evt.key === _options.separator && __target.value.length <= _options.minChars) {
        __target.value = __target.value.slice(0,-1)
      }
    };

    const _addChip = (el, label) => {
      let _chip            = document.createElement('DIV');
      _chip.className      = _options.chipClass;

      let _chipLabel       = document.createElement('DIV');
      _chipLabel.className = _options.chipLabelClass;
      _chipLabel.innerHTML = label;
      _chipLabel.setAttribute('contenteditable', false);
      _chipLabel.addEventListener('click', _editListItem, false);
      _chipLabel.addEventListener('blur', _updateListItem, false);

      _chip.append(_chipLabel);

      let _removeBtn       = document.createElement('A');
      _removeBtn.className = _options.chipRemoveBtnClass;
      _removeBtn.innerHTML = _closeIcon;
      _removeBtn.addEventListener('click', _removeListItem, false);

      _chip.append(_removeBtn);

      el.insertBefore(_chip, el.querySelector('INPUT'));
    };

    const _createChips = (el, chipList) => {
      chipList.forEach((chip, index) => {
        _addChip(el, chipList[index]);
      });
    };

    const _createCSLinput = el => {
      let _input          = document.createElement('INPUT');
      _input.className    = _options.inputClass;

      _input.addEventListener('keyup', _handleInput, false);

      el.insertBefore(_input, el.querySelector('INPUT'));
    };

    const _createClearAll = el => {
      let _removeAllBtn       = document.createElement('A');
      _removeAllBtn.className = _options.chipRemoveAllBtnClass;
      _removeAllBtn.innerHTML = _closeIcon;
      _removeAllBtn.addEventListener('click', _removeList, false);

      el.append(_removeAllBtn);
    };

    const _createCopyList = el => {
      let _copyBtn       = document.createElement('A');
      _copyBtn.className = _options.copyBtnClass;
      _copyBtn.innerHTML = _copyIcon;
      _copyBtn.addEventListener('click', _copyList, false);

      el.append(_copyBtn);
    };

    _init();


  }
}
