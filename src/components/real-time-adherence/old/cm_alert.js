/**
 * Notification/Alert
 * 
 * @constructor
 * @param {string} title - The title of the alertbox.
 * @param {string} message - The message in the alertbox. 
 * @param {string} type - The type alert = dialog with buttons, notification = dialog thats displays for x seconds.
 * @param {string} position:
 *  CC: Center of screen
 *  TL: Top Left
 *  TC: Top Center
 *  TR: Top Right
 *  BL: Bottom Left
 *  BC: Bottom Center
 *  BR: Bottom Right  
 * @param {string} onConform - callBack function
 * @param {string} hasCancel - Display a cancel button
 * @param {string} width - The width of the dialog
 * @param {string} displayTime - The time to show the notivication
 * @param {string} confirmLbl - The confirm button text
 * @param {string} cancelLbl - The cancel button text
 * @param {string} iconClass - The class for a icon on the right side of the dialog sample:
 *  position: absolute;
 *  display: block;
 *  top: 20px;
 *  right: 20px;
 *  height: 50px;
 *  line-height: 50px;
 *  width: 50px;
 *  &:before {
 *    content: '\F026';
 *    position: absolute;
 *    top: 0;
 *    right: 0;
 *    bottom: 0;
 *    left: 0;
 *    @include font-icon();
 *    text-align: center;
 *    color: $color-unavailable;
 *    font-size: 2.5rem;
 *    width: 60px;
 *  }
 * 
 * @author Wim Jurriaans <wim@jurriaans.org>
 * 
 * @version 0.5
 * 
 * @todo 
 * 
 */

class cm_alert {

  constructor(options) {
    
    let _dialog     = null,
        _modal      = null,
        _top        = '50%',
        _right      = 'auto',
        _bottom     = 'auto',
        _left       = '50%',
        _translate  = 'translate(-50%, -50%)',
        _height     = 0,
        _confirm    = null,
        _cancel     = null,
        _header     = null,
        _message    = null,
        _icon       = null;

    this._defaultOptions = {
      title       : 'ContactSuite Alert',
      message     : 'Alert!',
      type        : 'alert',
      position    : 'CC',
      onConfirm   : null,
      hasCancel   : false,
      width       : 320,
      displayTime : 1,
      confirmLbl  : 'OK',
      confirmCol  : '#EEEEEE',
      cancelLbl   : 'Cancel',
      iconClass   : null,
      hasModal    : false,
    }
    
    this._init(options);
  }
  
  //METHODS
  _init(opt) {
    Object.keys(opt).forEach(key => {
        if(typeof opt[key] != 'undefined') 
          this._defaultOptions[key] = opt[key];   
    });

    this._createAlert();
  }

  _positionDialog() {
    this._height = this._dialog.offsetHeight * -1;
    switch(this._defaultOptions.position) {
      case 'CC':
        this._dialog.style.top         = (this._height - 20) + 'px';
        this._dialog.style.bottom      = 'auto';
        this._dialog.style.left        = '50%';
        this._dialog.style.transform   = 'translate(-50%, -50%)';
      break;
      case 'TL':
        this._dialog.style.top        = (this._height - 20) + 'px';
        this._dialog.style.bottom     = 'auto';
        this._dialog.style.left       = '25%';
        this._dialog.style.transform  = 'translateX(-50%)';
      break;
      case 'TC':
        this._dialog.style.top        = (this._height - 20) + 'px';
        this._dialog.style.bottom     = 'auto';
        this._dialog.style.left       = '50%';
        this._dialog.style.transform  = 'translateX(-50%)';
      break;
      case 'TR':
        this._dialog.style.top        = (this._height - 20) + 'px';
        this._dialog.style.bottom     = 'auto';
        this._dialog.style.left       = '75%';
        this._dialog.style.transform  = 'translateX(-50%)';
      break;
      case 'BL':
        this._dialog.style.top        = 'auto';
        this._dialog.style.bottom     = (this._height - 20) + 'px';
        this._dialog.style.left       = '25%';
        this._dialog.style.transform  = 'translateX(-50%)';
      break;
      case 'BC':
        this._dialog.style.top        = 'auto';
        this._dialog.style.bottom     = (this._height - 20) + 'px';
        this._dialog.style.left       = '50%';
        this._dialog.style.transform  = 'translateX(-50%)';
      break;
      case 'BR':
        this._dialog.style.top        = 'auto';
        this._dialog.style.bottom     = (this._height - 20) + 'px';
        this._dialog.style.left       = '75%';
        this._dialog.style.transform  = 'translateX(-50%)';
      break;
    }
  }

  show(title = this._defaultOptions.title, message = this._defaultOptions.message, iconClass = this._defaultOptions.iconClass, onConfirm = this._defaultOptions.onConfirm) {
    if(this._defaultOptions.hasModal) {
      this._modal.style.right        = 0;
      this._modal.style.bottom       = 0;
      this._modal.style.opacity      = 1;
    }
    this._height                   = this._dialog.offsetHeight;
    this._header.innerHTML         = title;
    this._message.innerHTML        = message;
    this._defaultOptions.iconClass = iconClass;
    this._icon.className           = iconClass;
    if(onConfirm == null) {
      this._confirm.style.width      = '100%';
      this._cancel.style.dislpay     = 'none';
      this._confirm.addEventListener('click', _ => this.hide(), false);
    } else {
      if(this._defaultOptions.hasCancel) 
        this._cancel.style.dislpay     = 'block';
      this._defaultOptions.onConfirm = onConfirm;
      this._confirm.addEventListener('click', onConfirm, false);
    }
    this._dialog.style.display = 'block';
    

    switch(this._defaultOptions.position) {
      case 'CC':
        this._dialog.style.top = '50%';
        break;
      case 'TL':
      case 'TC':
      case 'TR':
        this._dialog.style.top = '50px';
      break;
      case 'BL':
      case 'BC':
      case 'BR':
        this._dialog.style.bottom = '20px';
      break;
    }
    if(this._defaultOptions.type.toLowerCase() != 'alert') {
      setTimeout(() => {
        this.hide()
      }, this._defaultOptions.displayTime * 1000);
    }

  }

  hide() {
    if(this._defaultOptions.hasModal) {
      this._modal.style.right        = '100%';
      this._modal.style.bottom       = '100%';
      this._modal.style.opacity      = 0;
    }

    this._confirm.removeEventListener('click', this._defaultOptions.onConfirm, false);

    this._height = this._dialog.offsetHeight * -1;
    switch(this._defaultOptions.position) {
      case 'CC':
      case 'TL':
      case 'TC':
      case 'TR':
        this._dialog.style.top = (this._height - 20) + 'px';
      break;
      case 'BL':
      case 'BC':
      case 'BR':
        this._dialog.style.bottom = (this._height - 20) + 'px';
      break;
    }

    this._dialog.style.display = 'none';
  }

  _createAlert() {
    if(this._defaultOptions.hasModal) {
      this._modal = document.createElement('div');
      this._setStyle(this._modal, {
        'position'           : 'absolute',
        'display'            : 'block',
        'top'                : 0,
        'right'              : '100%',
        'bottom'             : '100%',
        'left'               : 0,
        'overflow'           : 'hidden',
        'backgroundColor'    : 'rgba(0,0,0,.2)',
        '-webkit-transition' : 'opacity .1s ease-out',
        '-ms-transition'     : 'opacity .1s ease-out',
        'transition'         : 'opacity .1s ease-out',
        'opacity'            : 0,
        'zIndex'             : 99999998
      });

      document.body.insertBefore(this._modal, document.querySelector('BODY > div'));  

    }

    this._dialog = document.createElement('div');
    this._setStyle(this._dialog, {
      'position'           : 'absolute',
      'display'            : 'none',
      'top'                : '-2000px',
      'width'              : this._defaultOptions.width + 'px',
      'min-height'         : '80px',
      'overflow'           : 'hidden',
      'backgroundColor'    : '#FFF',
      '-webkit-transition' : 'all .2s ease-in-out',
      '-ms-transition'     : 'all .2s ease-in-out',
      'transition'         : 'all .2s ease-in-out',
      'box-shadow'         : '0 0 10px 0 rgba(0,0,0,.3)',
      'padding-top'        : '5px',
      'zIndex'             : 99999999
    });

    this._header           = document.createElement('H2');
    this._header.innerHTML = this._defaultOptions.title;
    this._setStyle(this._header, {
      'float'             : 'left',
      'width'             : '100%',
      'height'            : '40px',
      'line-height'       : '40px',
      'font-family'       : 'sans-serif',
      'font-size'         : '18px',
      'font-weight'       : 'normal',
      'padding'           : '0 20px',
      'text-align'        : 'left',
      'color'             : '#067895'
    });
    this._dialog.appendChild(this._header);

    this._message           = document.createElement('p');
    this._message.innerHTML = this._defaultOptions.message;
    this._setStyle(this._message, {
      'float'             : 'left',
      'width'             : '100%',
      'height'            : 'auto',
      'line-height'       : '1',
      'font-family'       : 'sans-serif',
      'font-size'         : '14px',
      'font-weight'       : 'normal',
      'padding'           : '0 70px 0 20px',
      'text-align'        : 'left',
      'color'             : '#999'
    });
    this._dialog.appendChild(this._message);

    this._icon           = document.createElement('i');
      
    this._dialog.appendChild( this._icon );

    this._dialog.appendChild( this._addButtons() );
    
    document.body.insertBefore(this._dialog, document.querySelector('BODY > div'));        
    this._positionDialog();
  }

  _addButtons() {
    let __footer = document.createElement('div');
    this._setStyle(__footer, {
      'float'             : 'left',
      'width'             : '100%',
      'height'            : '40px',
      'line-height'       : '40px',
      'display'           : 'block',
      'font-family'       : 'sans-serif',
      'font-size'         : '14px',
      'font-weight'       : 'normal',
      'padding'           : '0',
      'text-align'        : 'left',
      'color'             : '#999999',
      'margin-top'        : '20px'
    });

    this._confirm = this._createBtn(this._defaultOptions.confirmLbl);
    this._confirm.addEventListener('click', this._defaultOptions.onConfirm, false);
    __footer.appendChild(this._confirm);

    if(this._defaultOptions.hasCancel) {
      this._confirm.style.width           = '50%';
      this._confirm.style.borderRight     = '1px solid #CCC';
      this._confirm.style.fontWeight      = 'bold';

      this._cancel = this._createBtn(this._defaultOptions.cancelLbl);
      this._cancel.addEventListener('click', () => this.hide() ,false);
      this._cancel.style.width           = '50%';
      __footer.appendChild(this._cancel);
    }

    return __footer;
  }

  _createBtn(t) {
    let __btn       = document.createElement('a');
    __btn.innerHTML = t;
    __btn.href      = 'javascript:;';
    this._setStyle(__btn, {
      'float'             : 'left',
      'width'             : '100%',
      'height'            : '40px',
      'line-height'       : '40px',
      'display'           : 'block',
      'font-family'       : 'sans-serif',
      'font-size'         : '14px',
      'font-weight'       : 'normal',
      'padding'           : '0',
      'text-align'        : 'center',
      'background-color'  : this._defaultOptions.confirmCol,
      'text-decoration'   : 'none',
      'color'             : '#666666',
    });
    __btn.addEventListener('mouseover', () => {
      __btn.style.backgroundColor = this._shadeColor(this._defaultOptions.confirmCol, 10);
    }, false);
    __btn.addEventListener('mouseout', () => {
      __btn.style.backgroundColor = this._defaultOptions.confirmCol;
    }, false);
    return __btn;
  }

  _setStyle(obj, propertyObject) {
    for (var property in propertyObject)
        obj.style[property] = propertyObject[property];
  }

  _shadeColor(col, amt) {
    let usePound = false;
  
    if(col[0] == "#") {
      col = col.slice(1);
      usePound = true;
    }
 
    let num = parseInt(col,16),
        r   = (num >> 16) + amt;
 
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
 
    let b = ((num >> 8) & 0x00FF) + amt;
 
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
 
    let g = (num & 0x0000FF) + amt;
 
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
 
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  }

  destroy() {
    this._confirm.removeEventListener('click', this._defaultOptions.onConfirm, false);
    this._cancel.removeEventListener('click', this.hide() ,false);
  }

};

export { cm_alert };
