<template>
  <div class="imageupload__wrapper" data-e2e="image-loader">
    <a class="imageloader__button" @click="openImageLoader()" ref="button">&#xF2E9</a>
    <div :class="['imageupload__droparea', {'imageupload__droparea--active' : isActive}]" ref="droparea" @click="closeImageLoader">
    </div>  
    <div :class="['imageupload__uploadwindow', {'imageupload__uploadwindow--active' : isActive}]">
      <header>{{ $store.state.settings.wallscreen.imageuploadheader }}<a class="close" @click="closeImageLoader">&#xF156</a></header>
      <canvas class="imageCanvas" ref="imageCanvas"></canvas>
      <input type="file" name="imageSrc" id="uploadedImage" ref="uploadedImage" class="fileupload" @change="drawLogoOnCanvas()">
      <label for="imageUpload" class="fileupload__btn">{{ $store.state.settings.wallscreen.imageuploadchoose  }}</label>
      <footer>
        <a class="button-primary" @click="saveImage()">{{ $store.state.settings.wallscreen.imageuploadsave }}</a>
      </footer>
    </div>  
  </div>
</template>

<script>
  export default {
    name : 'ImageLoader',
    props : ['destSize', 'backgroundcolor', 'imagestr'],
    data: () => {
      return {
        isActive     : false,
        modalCoords  : {},
        imageCanvas  : null,
        fileSrc      : null,
        bgColor      : '#FFFFFF',
        imgString    : ''
      }
    },
    watch: {
      'isActive' : function(newVal, oldVal) {
        if(newVal) {
          this.setListeners(newVal);
          this.imgString = this.imagestr;
          this.bgColor   = this.backgroundcolor;
          
          let _ctx       = this.imageCanvas.getContext('2d'),
              _dim       = this.imgDimentions(),
              _img       = new Image();
          
          _ctx.fillStyle = this.bgColor;
          _ctx.fillRect(0, 0, _dim._width, _dim._height);
          if(this.imgString !== '') {
            _img.src       = this.imgString;
            _img.onload = () => {
              _ctx.drawImage(_img, 0, 0, _dim._width, _dim._height);
            }
          } else {
            this.placeDropTxt();
          }
        }
      }
    },
    methods: {
      imgDimentions() {
        let _dimStr = this.destSize.split('x')
        return {
          _width : _dimStr[0],
          _height: _dimStr[1]
        }
      },
      getModalCoords() {
        let _elmPos = this.$refs.button.getBoundingClientRect(),
            _win    = this.$refs.button.ownerDocument.defaultView;
        return {
          _top    : (_elmPos.top + _win.pageYOffset) * -1 + 'px',
          _left   : (_elmPos.left + _win.pageXOffset) * -1 + 'px',
          _width  : _win.innerWidth + _elmPos.width + 'px',
          _height : _win.innerHeight + 'px'
        };
      },
      openImageLoader() {
        this.$refs.droparea.style.top    = this.modalCoords._top;
        this.$refs.droparea.style.left   = this.modalCoords._left;
        this.$refs.droparea.style.width  = this.modalCoords._width;
        this.$refs.droparea.style.height = this.modalCoords._height;

        this.isActive = true;
      },
      closeImageLoader() {
        this.$refs.droparea.style        = "";
        this.isActive                    = false;
      },
      drawLogoOnCanvas() {
        let _img    = new Image(),
            _dimStr = this.destSize.split('x'),
            _file   = this.fileSrc.files[0],
            _url    = window.URL || window.webkitURL,
            _src    = _url.createObjectURL(_file),
            _ctx    = this.imageCanvas.getContext('2d');

        _ctx.clearRect(0, 0, parseInt(_dimStr[0]), parseInt(_dimStr[1]));
        _ctx.fillStyle = this.bgColor;
        _ctx.fillRect(0, 0, parseInt(_dimStr[0]), parseInt(_dimStr[1]));
        
        _img.src    = _src;
        _img.onload = () => {
          let _ghostCanvas = document.createElement('canvas'),
              _ghostCTX    = _ghostCanvas.getContext('2d'),
              _srcRatio    = _img.height / _img.width,
              _hRatio      = this.imgDimentions()._height/_img.height,
              _vRatio      = this.imgDimentions()._width/_img.width,
              _scaleFactor = Math.min(_hRatio, _vRatio),
              _offsetX     = 0, 
              _offsetY     = 0;
          
          _ghostCanvas.width  = _scaleFactor * _img.width;
          _ghostCanvas.height = _scaleFactor * _img.height;
          
          _ghostCTX.drawImage(_img, 0, 0, _scaleFactor * _img.width, _scaleFactor * _img.height);
          
          _ctx = this.imageCanvas.getContext('2d');

          if(_ghostCanvas.width < this.imageCanvas.width) 
            _offsetX = Math.abs(_ghostCanvas.width - this.imageCanvas.width) / 2;
          else 
            _offsetY = Math.abs(_ghostCanvas.height - this.imageCanvas.height) / 2;

          _ctx.drawImage(_ghostCanvas, _offsetX, _offsetY, _ghostCanvas.width, _ghostCanvas.height);
          
          _url.revokeObjectURL(_src);
        }
      },
      placeDropTxt() {
        let _ctx       = this.imageCanvas.getContext('2d');
        
        _ctx.font      = "14px Open Sans SemiBold";
        _ctx.fillStyle = "#CCCCCC";
        _ctx.textAlign = "center";
        
        _ctx.fillText(this.$store.state.settings.wallscreen.imagedroptext , this.imageCanvas.width / 2, (this.imageCanvas.height / 2) + 5);
      },
      saveImage() {
        this.imgString = this.imageCanvas.toDataURL("image/jpeg", 1);
        this.$emit('saveimage', this.imgString);
        this.$refs.uploadedImage.value = '';
        this.closeImageLoader();
      },
      _dragEnter(evt) {
        if(evt.target.id != "uploadedImage") {
          evt.preventDefault();
          evt.dataTransfer.effectAllowed = "none";
          evt.dataTransfer.dropEffect    = "none";
        }
      },
      _dragOver(evt) {
        if(evt.target.id != "uploadedImage") {
          evt.preventDefault();
          evt.dataTransfer.effectAllowed = "none";
          evt.dataTransfer.dropEffect    = "none";
        }
      },  
      _drop(evt) {
        if(evt.target.id != "uploadedImage") {
          evt.preventDefault();
          evt.dataTransfer.effectAllowed = "none";
          evt.dataTransfer.dropEffect    = "none";
        }
      },
      setListeners(status) {
        if(status) {
          window.addEventListener("dragenter", this._dragEnter, false);
          window.addEventListener("dragover", this._dragOver, false);
          window.addEventListener("drop", this._drop, false);
        } else {
          window.removeEventListener("dragenter", this._dragEnter, false);
          window.removeEventListener("dragover", this._dragOver, false);
          window.removeEventListener("drop", this._drop, false);
        }
      },
    },
    mounted() {
      this.modalCoords = {...this.getModalCoords()};
      this.imageCanvas = this.$refs.imageCanvas;

      let _dim                = this.imgDimentions();
      this.imageCanvas.height = _dim._height;
      this.imageCanvas.width  = _dim._width;

      this.imageCanvas.mozImageSmoothingEnabled    = false;
      this.imageCanvas.webkitImageSmoothingEnabled = false;
      this.imageCanvas.msImageSmoothingEnabled     = false;
      this.imageCanvas.imageSmoothingEnabled       = false;

      this.fileSrc = this.$refs.uploadedImage;

      this.placeDropTxt();

    },
  }
</script>

<style lang="scss">
  
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  .imageupload__wrapper {
    position: relative;
    display: block;
    float: left;
    width: 30px;
    height: 30px;
    line-height: 30px;
    margin: 2px;
  }

  .imageloader__button {
    position: relative;
    display: block;
    float: left;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    font-family: 'Material Design Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 1.4em;
    color: globals.$color-gray40;
    z-index: 100;
    user-select: none;
    &:hover {
      color: globals.$color-gray60;
    }
  }

  .imageupload__droparea {
    position: fixed;
    top: 100%;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    background-color: rgba(0, 0, 0, .1);
    z-index: 50000;
    &--active {
      top: 0;
    }
  }

  .imageupload__uploadwindow {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    display: none;
    background-color: globals.$color-white;
    box-shadow: 0 0 12px 0 rgba(0,0,0,.4);
    border-radius: 5px;
    z-index: 51000;
    padding-bottom: 40px;
    &--active {
      display: block;
    }
    header {
      display: block;
      height: 36px;
      line-height: 36px;
      background-color: globals.$color-gray5;
      border-radius: 5px 5px 0 0;
      padding-left: 10px;
      font-family: 'Open Sans SemiBold', sans-serif;
      color: globals.$color-gray60;
      font-size: .9em;
      .close {
        float: right;
        margin: 6px;
        width: 24px;
        height: 24px;
        line-height: 24px;
        border-radius: 50%;
        background-color: globals.$color-white;
        color: globals.$color-gray40;
        text-align: center;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 1.1em;
        display: block;
        cursor: pointer;
      }
    }
    footer {
      position: absolute;
      bottom: 0;
      display: block;
      width: 50%;
      right: 0;
      height: 40px;
      padding: 0 20px;
      border-radius: 0 0 5px 5px;
      .button-primary {
        float: right;
        padding: 0 20px;
      }
      z-index: 100;
    }
  }

  .imageCanvas {
    float: left;
    border: 1px dotted globals.$color-gray20;
    margin: 10px 20px;
  }

  .fileupload {
    position: absolute;
    top: 35px;
    left: 0;
    bottom: 10px;
    width: 100%;
    opacity: 0;
    z-index: 10;
  }

  .fileupload__btn {
    position: absolute;
    left: 20px;
    bottom: 10px;
    padding: 0 10px;
    font-size: 1em;
    color: globals.$color-white; 
    background-color: globals.$color-gray30;
    border-radius: 3px;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.2);
    cursor: pointer;
    user-select: none;
  }
  

</style>