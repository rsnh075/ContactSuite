<template>
  <div>
    <div :class="['colorpicker__wrapper', {'colorpicker__wrapper--small' : size === 'small'}]" ref="colorpickercomponent" data-e2e="color-picker">
      <a class="colorpicker__button" @click="openColors()">&#xF266<span v-if="size === 'small'" class="swatch--small" :style="`background-color:${selectedColor}`"></span></a>
      <div class="colorpicker__selected" @click="openColors()" ref="selected"><span class="swatch" :style="`background-color:${selectedColor}`"></span>{{ selectedColor }}</div>
      <ul class="colorpicker__opionlist" @click="selectValue($event)" ref="optionsWrap" :data-selectedval="selectedcolor">
        <li v-for="color in defaultcolors" class="colorpicker__opion select--js" :data-value="color" :style="`background-color:${color}`"></li>
        <li class="colorpicker__opion--freechoise">
          <input type="text" v-model="freeColor" class="colorpicker__opion--freechoise-field" placeholder="#XXXXXX">
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name : 'ColorPicker',
    props : {
      defaultcolors : {
        type    : Array,
        default : () => ([
          '#FFFFFF',
          '#000000'
        ]),
      },
      selectedcolor : {
        type    : String,
        default : '#FFFFFF',
      },
      size : {
        type    : String,
        default : 'normal'
      }
    },
    data: () => {
      return {
        optionsWrapper   : null,
        maxHeightOptions : '300',
        selectedColor    : null,
        freeColor        : '',
      }
    },
    watch: {
      'selectedcolor' : function(newVal, oldVal) {
        this.selectedColor = newVal;
        if(newVal == '' || newVal == '#FFFFFF') {
          this.freeColor     = '';
          [...this.optionsWrapper.querySelectorAll('LI')].forEach(option => option.classList.remove('colorpicker__opion--selected'));
        }
      },
      'freeColor' : function(newVal, oldVal) {
        let _pat = new RegExp(/^(#{0,1})([0-9A-F]{8}|[0-9A-F]{6})$/);
        if(_pat.test(newVal)) {
          this.selectedColor = newVal;
          [...this.optionsWrapper.querySelectorAll('LI')].forEach(option => option.classList.remove('colorpicker__opion--selected'));
          this.$emit('select', this.selectedColor);
          setTimeout(this.openColors, 200);
        }
      }
    },
    methods: {
      openColors() {
        this.maxHeightOptions = document.documentElement.clientHeight - this.$refs.colorpickercomponent.getBoundingClientRect().top - 100;
        this.optionsWrapper.style['max-height'] = this.maxHeightOptions + 'px';
        this.optionsWrapper.classList.toggle('colorpicker__opionlist--open');
      },
      selectValue(evt) {
        let _target    = evt.target,
            _option    = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

        if(_option === 'select--js') {
          this.selectedColor = (_target.getAttribute('data-value')) ? _target.getAttribute('data-value') : _target.parentElement.getAttribute('data-value');
          this.freeColor     = '';
          
          [...this.optionsWrapper.querySelectorAll('LI')].forEach(option => option.classList.remove('colorpicker__opion--selected'));
          
          _target.classList.add('colorpicker__opion--selected');
          
          this.$emit('select', this.selectedColor);
          
          setTimeout(this.openColors, 200);
        }
      },
    },
    mounted() {
      this.optionsWrapper   = this.$refs.optionsWrap;
      this.selected         = this.$refs.selected;

      this.selectedColor    = this.selectedcolor;
    },
  }
</script>

<style lang="scss">
  
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";
  
  .colorpicker__wrapper {
    position: relative;
    display: block;
    float: left;
    width: 100%;
    height: 40px;
    line-height: 40px;
    margin: 2px;
    &--small {
      width: 30px;
      height: 30px;
      line-height: 30px;
    }
  }

  .colorpicker__button {
    position: absolute;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    top: 17px;
    right: 0;
    cursor: pointer;
    font-family: 'Material Design Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 1.4em;
    color: globals.$color-gray40;
    z-index: 100;
    user-select: none;
    .swatch--small {
      position: absolute;
      right: 3px;
      bottom: 3px;
      display: block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      box-shadow: inset 0 0 2px 1px rgba(0, 0, 0, 0.2);
      z-index: 10;
    }
    &:hover {
      color: globals.$color-gray60;
    }
  }

  .colorpicker__wrapper--small {
    .colorpicker__button {
      width: 30px;
      height: 30px;
      line-height: 30px;
      .swatch--small {
        right: 1px;
        bottom: 1px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }
  }

  .colorpicker__selected {
    position: relative;
    display: block;
    float: left;
    border-bottom: 1px solid globals.$color-gray35;
    background-color: transparent;
    box-shadow: inset 0 -32px 0px 0px #F9F9F9;
    height: 40px;
    line-height: 40px;
    width: 100%;
    padding: 5px 30px 0 3px;
    color: globals.$color-gray60;
    font-size: 1rem;
    margin-top: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default;
    user-select: none;
    .swatch {
      display: block;
      float: left;
      width: 20px;
      height: 20px;
      margin: 8px 7px 0 0;
      border-radius: 50%;
      box-shadow: inset 0 0 2px 1px rgba(0, 0, 0, 0.2);
    }
  }

  .colorpicker__opionlist {
    position: absolute;
    top: calc(100% + 17px);
    right: 0;
    width: #{(4*38px) + 14px};
    list-style-type: none;
    padding: 5px;
    background-color: globals.$color-white;
    border: 1px solid globals.$color-gray20;
    border-radius: 3px;
    z-index: 1000;
    display: none;   
    &--open {
      display: block;
    }
    overflow: overlay;
  }

  .colorpicker__opion {
    position: relative;
    display: block;
    float: left;
    width: 30px;
    height: 30px;
    margin: 4px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: inset 0 0 2px 1px rgba(0, 0, 0, 0.2);
    &--selected {
      box-shadow: inset 0 0 2px 1px rgba(0, 0, 0, 0.5);
      &:after {
        content: '\FE6E';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 1.2em;
        color: globals.$color-white;
        text-shadow: 0px 0px 3px rgba(0,0,0,.6);
      }
    }
    &:hover {
      transform: scale(1.1);
    }
  }

  .colorpicker__opion--freechoise {
    display: block;
    float: left;
    margin: 5px;
    width: calc(100% - 10px);
    //border-top: 1px solid globals.$color-gray20;
    height: 40px;
    line-height: 40px;
  }

  .colorpicker__opion--freechoise-field {
    width: 100%;
    height: 30px;
    line-height: 30px;
    border-radius: 3px;
    border: 1px solid globals.$color-gray20;
    padding: 0 5px;
    font-size: 1em;
    color: globals.$color-gray60;
  }

  .colorpicker__wrapper--small {
    .colorpicker__button {
      top: 0;
    }
    .colorpicker__selected {
      display: none;
    }
    .colorpicker__opionlist {
      top: calc(100% + 5px);
      right: auto;
      left: 0;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .2);
    }
  }


</style>