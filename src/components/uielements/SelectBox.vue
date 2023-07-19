<template>
  <div class="selectbox__wrapper" ref="selectboxcomponent" data-e2e="select-box">
    <a class="selectbox__button" @click="openOptions()"></a>
    <div class="selectbox__selected" @click="openOptions()" ref="selected" v-html="currentLabel"></div>
    <ul class="selectbox__opionlist" @click="selectValue($event)" ref="optionsWrap" :data-selectedval="selectedvalue">
      <li class="selectbox__opion select--js" data-value="null" v-html="defaultlabel"></li>
      <li v-for="option in options" class="selectbox__opion select--js" :data-value="option[valueproperty]" v-html="createLabel(option[labelproperty], option[iconproperty], option[iconcolorproperty])"></li>
    </ul>
  </div>
</template>

<script>

  export default {
    name : 'Selectbox',
    props : {
      options : {
        type    : Array,
        default : [],
      },
      labelproperty  : {
        type    : String,
        default : '',
      },
      valueproperty  : {
        type    : String,
        default : '',
      },
      iconproperty  : {
        type    : String,
        default : '',
      },
      selectedvalue  : {
        default : null
      },
      selectedlabel  : {
        type    : String,
        default : '',
      },
      defaultlabel : {
        type    : String,
        default : ''
      },
      iconcolorproperty : {
        type    : String,
        default : ''
      },
      iconsize : {
        type    : String,
        default : '1em'
      }
    },
    data: () => {
      return {
        currentLabel     : '',
        currentValue     : null,
        optionsWrapper   : null,
        selected         : null,
        maxHeightOptions : '300',
      }
    },
    watch: {
      'options' : function(newVal, oldVal) {
        if(this.selectedvalue === null) {
          this.currentLabel  = this.defaultlabel;
          this.currentValue  = this.currentValue
        } else {
          this.currentValue  = this.selectedvalue;
          let _selOption     = this.options.find(opt => opt[this.valueproperty] == this.selectedvalue);
          if(_selOption)
            this.currentLabel  = this.createLabel(_selOption[this.labelproperty], _selOption[this.iconproperty]);
        }
        this.$emit('change', this.currentValue);
      },
      'selectedvalue': function(newVal, oldlal) {
        this.currentValue  = this.selectedvalue;
        let _selOption     = this.options.find(opt => opt[this.valueproperty] == this.selectedvalue);
        if(_selOption)
          this.currentLabel  = this.createLabel(_selOption[this.labelproperty], _selOption[this.iconproperty]);
      },
    },
    methods: {
      createLabel(label, icon = null, color = null) {
        let _stylestr = '';
        if(!icon.startsWith('&#x'))
          icon = '&#x' + icon;
         
        _stylestr = color ? `font-size:${this.iconsize};color:${color}` : `font-size:${this.iconsize}`;
        
        return (icon === null || icon === 'null') ? label : `<span class="select--js" style="${_stylestr}">${icon}</span>${label}`;
    l },
      openOptions() {
        this.maxHeightOptions = window.innerHeight - this.$refs.selectboxcomponent.getBoundingClientRect().top - 100;
        this.optionsWrapper.style['max-height'] = this.maxHeightOptions + 'px';

        this.optionsWrapper.classList.toggle('selectbox__opionlist--open');
      },
      setCurrentLabel() {
        let _selOption    = this.options.find(opt => opt[this.valueproperty] == this.currentValue);
        this.currentLabel = this.createLabel(_selOption[this.labelproperty], _selOption[this.iconproperty], _selOption[this.iconcolorproperty]);
      },
      selectValue(evt) {
        let _target    = evt.target,
            _option    = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

        if(_option === 'select--js') {
          this.currentValue = (_target.getAttribute('data-value')) ? _target.getAttribute('data-value') : _target.parentElement.getAttribute('data-value');
          if(this.currentValue != 'null') {
            [...this.optionsWrapper.querySelectorAll('LI')].forEach(option => option.classList.remove('selectbox__opion--selected'));
            _target.classList.add('selectbox__opion--selected');
            let _selOption    = this.options.find(opt => opt[this.valueproperty] == this.currentValue);
            setTimeout(this.setCurrentLabel, 0);
            this.$emit('change', this.currentValue)
          } else {
            this.currentLabel = this.defaultlabel;
            this.$emit('change', this.currentValue);
          }
        }
        
        this.openOptions();
      },
    },
    mounted() {
      this.optionsWrapper   = this.$refs.optionsWrap;
      this.selected         = this.$refs.selected;

    },
  }
</script>