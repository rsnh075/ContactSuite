<template>
  <div class="country-select__wrapper" ref="countryselectcomponent" @click="handleToggle($event)" data-e2e="country-select">
    <a class="country-select__button toggle--js"></a>
    <div class="country-select__selected toggle--js"><span v-if="currentValue" :class="['flag flag--inline', 'flag_' + currentValue]"></span>{{ currentLabel }}</div>
    <div class="country-select__optionlist" ref="countryselectoptionswrap">
      <ul @click="selectValue($event)" :data-selectedval="selectedvalue">
        <li class="country-select__option select--js" data-value="null">{{ $store.state.settings.countryselect.defaultselectlbl }}</li>
        <li v-for="language in languageList" class="country-select__option select--js" :key="language.code" :data-value="language.code"><span :class="['flag flag--inline', 'flag_' + language.code]"></span>{{ language.label }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
  /**
   *
   * country select
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   */

  export default {
    name : 'CountrySelect',
    props : {
      selectedvalue  : {
        type : Number,
        default : null
      }
    },
    data: () => {
      return {
        currentLabel     : '',
        currentValue     : null,
        optionsWrapper   : null,
        maxHeightOptions : '300',
        defaultlabel     : '',
        languageList : [
          {label : 'Nederlands', code : 1},
          {label : 'English',    code : 2},
          {label : 'Français',   code : 3},
          {label : 'Deutsch',    code : 4},
          {label : 'Svenska',    code : 5},
          {label : 'Suomi',      code : 6},
          {label : 'Norsk',      code : 7},
          {label : 'Dansk',      code : 8},
          {label : 'Magyar',     code : 9},
          {label : 'Espagnol',   code : 10},
          {label : 'Italiano',   code : 11},
          {label : 'Polska',     code : 12},
          {label : 'Vlaams',     code : 13},
          {label : 'Български',  code : 14},
          {label : 'Hrvatski',   code : 15},
          {label : 'Čeština',    code : 16},
          {label : 'Eesti',      code : 17},
          {label : 'Ελληνικά',   code : 18},
          {label : 'Latvijas',   code : 19},
          {label : 'Lietuvos',   code : 20},
          {label : 'Português',  code : 21},
          {label : 'Român',      code : 22},
          {label : 'Slovenčina', code : 23},
          {label : 'Slovenski',  code : 24},
          {label : 'Schweizer',  code : 25},
        ]
      }
    },
    watch: {
      'selectedvalue': function(newVal, oldVal) {
        this.currentValue   = newVal;
        let _selOption      = this.languageList.find(opt => opt.code == newVal);
        if(newVal)
          this.currentLabel = _selOption.label;
        else
          this.currentLabel = this.defaultlabel;
      },
    },
    methods: {
      selectValue(evt) {
        let _target    = evt.target,
            _option    = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

        if(_option === 'select--js') {
          let _currentVal = parseInt(_target.getAttribute('data-value'));
          if(!Number.isNaN(_currentVal)) {
            [...this.optionsWrapper.querySelectorAll('LI')].forEach(option => option.classList.remove('country-select__option--selected'));
            _target.classList.add('country-select__option--selected');
            this.$emit('change', _currentVal)
          } else {
            this.$emit('change', null);
          }
        }
        this.toggleOptions();
      },
      handleToggle(evt) {
        if(evt.target.classList.contains('toggle--js')) {
          if(this.optionsWrapper.classList.contains('country-select__optionlist--open')) {
          } else { //first close all open select searches
            let _openinstances    = [].slice.call(document.querySelectorAll('.country-select__optionlist--open'));
            _openinstances.forEach(el => {
              el.classList.remove('country-select__optionlist--open');
            });
          }
          this.toggleOptions();
        }
      },
      toggleOptions() {
        this.maxHeightOptions = window.innerHeight - this.$refs.countryselectcomponent.getBoundingClientRect().top - 100;
        this.optionsWrapper.style['max-height'] = this.maxHeightOptions + 'px';

        this.optionsWrapper.classList.toggle('country-select__optionlist--open');
      },
    },
    mounted() {
      this.optionsWrapper   = this.$refs.countryselectoptionswrap;
      this.defaultlabel     = this.$store.state.settings.countryselect.defaultselectlbl;
    },
  }
</script>

<style lang="scss">
  @use "@/scss/includes/flags";
  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals" as g;
.country-select__wrapper {
  position: relative;
  width: 100%;
  height: 58px;
}

.country-select__button {
  position: absolute;
  width: 30px;
  height: 40px;
  top: 12px;
  right: 0;
  cursor: pointer;
  &:before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    top: calc(50% + 2px);
    left: calc(100% - 20px);
    border: 6px solid transparent;
    border-top-color: g.$color-gray35;
    z-index: 2;
    pointer-events:none;
    user-select: none;
  }
}

.country-select__selected {
  position: relative;
  display: block;
  float: left;
  border-bottom: 1px solid g.$color-gray35;
  background-color: transparent;
  height: 40px;
  line-height: 40px;
  width: 100%;
  padding: 5px 30px 0 3px;
  color: g.$color-gray60;
  font-size: 1rem;
  margin-top: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
  user-select: none;
  span {
    margin-right: 10px;
  }
}

.country-select__optionlist {
  position: absolute;
  top: 52px;
  left: 0;
  width: 100%;
  height: auto;
  min-height: 120px;
  overflow: hidden;
  overflow-y: auto;
  list-style-type: none;
  padding: 5px;
  background-color: g.$color-white;
  border: 1px solid g.$color-gray20;
  z-index: 1000;
  display: none;
  &--open {
    display: block;
  }
}

.country-select__option {
  height: 35px;
  line-height: 35px;
  width: calc(100% + 15px);
  margin-left: -5px;
  padding-right: 10px;
  padding-left: 10px;
  color: g.$color-gray60;
  text-overflow: ellipsis;
  overflow: hidden;
  width: calc(100% + 15px);
  white-space: nowrap;
  cursor: default;
  span {
    margin-right: 10px;
  }
  &:hover {
    background-color: g.$color-gray10;
    color: g.$color-gray60;
  }
  &--selected {
    background-color: functions.tint(g.$color-help, 50%);
    color: g.$color-white;
    span {
      color: g.$color-white;
    }
  }

}
</style>