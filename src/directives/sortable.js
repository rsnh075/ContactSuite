export const sortable = {
    mounted: function(el, binding, vnode) {
      const _w           = window,
            _b           = document.body,
            _d           = document.documentElement,
            _container   = el;

      let   _click       = null,
            _dragItem    = null,
            _clickItem   = null,
            _hovItem     = null,
            _dragging    = false,
            _sortLists   = [],
            _oldPos      = -1,
            _newPos      = -1,
            _aniFr       = 0,
            _fps         = 30/1000,
            _lastTime    = 0;

      const _init = () => {
        _container.setAttribute( "data-is-sortable", 1 );
        _container.style["position"] = "static";

        _container.addEventListener("mousedown",  _onPress,   { passive: true });
        _container.addEventListener("touchstart", _onPress,   { passive: true });
        _container.addEventListener("mouseup",    _onRelease, { passive: true });
        _container.addEventListener("touchend",   _onRelease, { passive: true });
        _container.addEventListener("mousemove",  _onMove,    { passive: true });
        _container.addEventListener("touchmove",  _onMove,    { passive: true });

      };

      const _getDragItem = target => {
        let _item = target;
        while(_item.parentElement !== _container) {
          _item = _item.parentElement;
        }
        return _item;
      };

      // get position of mouse/touch in relation to viewport
      const _getPoint = e => {
        let scrollX = Math.max( 0, _w.pageXOffset || _d.scrollLeft || _b.scrollLeft || 0 ) - ( _d.clientLeft || 0 ),
            scrollY = Math.max( 0, _w.pageYOffset || _d.scrollTop || _b.scrollTop || 0 ) - ( _d.clientTop || 0 ),
            pointX  = e ? ( Math.max( 0, e.pageX || e.clientX || 0 ) - scrollX ) : 0,
            pointY  = e ? ( Math.max( 0, e.pageY || e.clientY || 0 ) - scrollY ) : 0;

        return { x: pointX, y: pointY };
      };


      const  _trashDragItem = () => {
        if(_dragItem && _clickItem) {
          _clickItem.style["opacity"] = '';
          _clickItem.style["border"]  = '';
          _clickItem = null;

          _container.removeChild(_dragItem);
          _dragItem  = null;
        }
      };

      const _makeDragItem = (item) => {
        _trashDragItem();
        _clickItem = item.closest('LI');
        _clickItem.style["opacity"]  = .3;
        _clickItem.style["border"]   = '1px dashed #538BE0';

        _sortLists = document.querySelectorAll( "[data-is-sortable]" );
        _oldPos    = _newPos = [..._container.children].findIndex(item => item === _clickItem);
        _dragItem                    = document.createElement( _clickItem.tagName );
        _dragItem                    = _clickItem.cloneNode(true);
        _dragItem.className          = "list-item--dragging";
        _dragItem.style["position"]  = "absolute";
        _dragItem.style["z-index"]   = "999";
        _dragItem.style["left"]      = ( (_clickItem.offsetLeft - _container.scrollLeft) || 0 ) + "px";
        _dragItem.style["top"]       = ( (_clickItem.offsetTop - _container.scrollTop) || 0 ) + "px";
        _dragItem.style["width"]     = ( _clickItem.offsetWidth || 0 ) + "px";
        _dragItem.style["opacity"]   = .8;

        _container.appendChild(_dragItem);
      };

      const _moveItem = (item, x, y) => {
        item.style["-webkit-transform"] = "translateY( "+ y +"px )";
        item.style["-moz-transform"]    = "translateY( "+ y +"px )";
        item.style["-ms-transform"]     = "translateY( "+ y +"px )";
        item.style["transform"]         = "translateY( "+ y +"px )";
      };

      const _autoScroll = y => {
        if(y > (_container.getBoundingClientRect().height - 20) && _container.scrollTop < (_container.scrollHeight - _container.offsetHeight)) {
          _container.scrollTop += 5;
        }
        if(y < 20 && _container.scrollTop !== 0) {
          _container.scrollTop -= 5;
        }
      };

      const _isOnTop = (item, x, y) => {
        let box   = item.getBoundingClientRect(),
            isx   = (x > box.left && x < (box.left + box.width)),
            issub = true,
            isy   = (y > box.top  && y < (box.top + box.height));

        return (isx && isy);
      };

      const _swapItems = (item1, item2) => {
        let parent1 = item1.parentNode,
            parent2 = item2.parentNode;

        _newPos = [..._container.children].findIndex(item => item === item2);

        let temp    = document.createElement( "div" );
            parent1.insertBefore( temp, item1 );
            parent2.insertBefore( item1, item2 );
            parent1.insertBefore( item2, temp );
            parent1.removeChild( temp );
      };

      const _onPress = evt => {
        if (
            binding.value.isSortable &&
            evt && evt.target && evt.target !== _container &&
            (
                evt.target.hasAttribute("sorterhandle") ||
                evt.target.children[0]?.hasAttribute("sorterhandle")
            )
        ) {
            evt.preventDefault();
            _dragging = true;
            _click    = _getPoint(evt);
            _makeDragItem(_getDragItem(evt.target));
            _onMove(evt);
        }
      };

      const _onRelease = evt => {
        if(_dragging && binding.value.isSortable && evt && evt.target && evt.target.tagName !== 'A' && evt.target.tagName !== 'UL') {
          _dragging = false;
          _trashDragItem();
          let x = new CustomEvent('sortend', {
            detail: {
              oldIndex : _oldPos,
              newIndex : _newPos
            }
          });
          if(_oldPos !== _newPos) {
              el.dispatchEvent(x);
          }
        }
      };

      const _onMove = evt => {
        if(binding.value.isSortable && _dragItem && _dragging) {
          const point     = _getPoint(evt);
          _moveItem(_dragItem, (point.x - _click.x), (point.y - _click.y));

          window.cancelAnimationFrame(_aniFr);
          _autoScroll(evt.pageY - _container.getBoundingClientRect().top);

          // check if current drag item is over another item and swap places
          for(let i = 0; i < _container.children.length; ++i ) {
            let __subItem = _container.children[i];
            if(__subItem === _clickItem || __subItem === _dragItem) {
              continue;
            }
            if(_isOnTop(__subItem, point.x, point.y)) {
              _hovItem = __subItem;
              _swapItems( _clickItem, __subItem );
            }
          }
        }
      };

      _init();
    }
  }
