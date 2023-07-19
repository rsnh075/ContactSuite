<template>
  <div class="autocomplete-wrapper" ref="autocompletecomponent">
    <input type="text" name="autoCompleteField" v-model="currentValue" :data-validate="setValidation" :data-message="setValidationMsg" :placeholder="placeholder" @keyup="getSuggestions($event)" @blur="closeSuggestions()" ref="autocompleteinput">
    <label for="autoCompleteField" class="form-label form-label--hidden">{{ label }}</label>
    <ul class="autocomplete__opionlist" @click="selectOption" ref="autocompleteWrap" :data-selectedval="selectedvalue">
      <li v-for="option in suggestions" class="autocomplete__opion select--js" :data-value="option">{{ option }}</li>
    </ul>
  </div>
</template>

<script>

  export default {
    name : 'AutoCompleteInput',
    props : ['validationtype', 'validationmsg', 'placeholder', 'label', 'completelist', 'selectedvalue'],
    data: () => {
      return {
        currentValue     : null,
        optionsWrapper   : null,
        maxHeightOptions : '300',
        suggestions      : [],
        closeTimer       : null,
        selectedOption   : null,
        inputField       : null
      }
    },
    computed: {
      setValidation() {
        return this.validationtype === 'none' ? '' : this.validationtype;
      },
      setValidationMsg() {
        return this.validationmsg === 'none' ? '' : this.validationmsg;
      },
    },
    methods: {
      getSuggestions(evt) {
        let _event = window.event ? window.event : evt;

        if(_event.key !== 'ArrowUp' && _event.key !== 'ArrowDown' && _event.key !== 'Enter') {
          this.suggestions = this.completelist.filter(suggestion => suggestion.toLowerCase().startsWith(this.currentValue.toLowerCase()));
          if(this.suggestions.length > 0 && this.currentValue.length > 0) {
            this.optionsWrapper.classList.add('autocomplete__opionlist--open');
            this.maxHeightOptions                   = window.innerHeight - this.$refs.autocompletecomponent.getBoundingClientRect().top - 100;
            this.optionsWrapper.style['max-height'] = this.maxHeightOptions + 'px';
            setTimeout(() => this.setOptionSelected(this.selectedOption));
          } else {
            this.optionsWrapper.classList.remove('autocomplete__opionlist--open');
            this.optionsWrapper.style['max-height'] = '';
          }
        }

        this.$emit('selectValue', this.currentValue);
      },
      closeSuggestions() {
        setTimeout(() => this.optionsWrapper.classList.remove('autocomplete__opionlist--open'), 100);
      },
      selectOption(evt) {
        let _target    = evt.target,
            _option    = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

        if(_option === 'select--js') {
          this.currentValue = (_target.getAttribute('data-value')) ? _target.getAttribute('data-value') : _target.parentElement.getAttribute('data-value');
        }

        this.$emit('selectValue', this.currentValue);
      },
      setOptionSelected(_selOption) {
        [...this.optionsWrapper.querySelectorAll('LI')].forEach(option => option.classList.remove('autocomplete__opion--selected'));
        if(this.optionsWrapper.querySelector("[data-value='" + _selOption + "']"))
          this.optionsWrapper.querySelector("[data-value='" + _selOption + "']").classList.add('autocomplete__opion--selected');
      },
      handleKeyBoardNavigation(evt) {
        let _event = window.event ? window.event : evt,
            _index = this.suggestions.findIndex(sug => sug === this.selectedOption);

        switch(_event.key) {
          case 'ArrowDown':
            this.selectedOption = this.currentValue = this.suggestions[ _index == this.suggestions.length-1 ? _index : _index+1 ];
            this.setOptionSelected(this.selectedOption);
            break;
          case 'ArrowUp':
            this.selectedOption = this.currentValue = this.suggestions[ _index == 0 ? _index : _index-1 ];
            this.setOptionSelected(this.selectedOption);
            break;
          case 'Enter':
            this.closeSuggestions();
            break;  
        }
        
        if(this.selectedOption) {
          setTimeout(() => {
            this.inputField.selectionStart = this.inputField.selectionEnd = this.selectedOption.length;
          }, 0);
        }
      }
    },
    mounted() {
      this.optionsWrapper   = this.$refs.autocompleteWrap;
      this.selected         = this.$refs.selected;
      this.currentValue     = this.selectedvalue;
      this.inputField       = this.$refs.autocompleteinput;

      this.selectedOption   = this.completelist.find(opt => opt == this.selectedvalue);
      if(this.selectedOption) this.setOptionSelected(this.selectedOption);
      
      document.addEventListener('keydown', this.handleKeyBoardNavigation, false);
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.handleKeyBoardNavigation, false);
    },
  }
</script>

<style lang="scss" scoped>

@use "@/scss/includes/globals";
@use "@/scss/includes/functions";
  
  .autocomplete-wrapper { 
    position: relative;
    width: 100%;
  }

  .autocomplete__opionlist {
    position: absolute;
    top: 52px;
    left: -6000px;
    width: 100%; 
    height: auto;
    overflow: hidden;
    overflow-y: auto;
    list-style-type: none;
    padding: 5px;
    background-color: globals.$color-white;
    border: 1px solid globals.$color-gray20;
    z-index: 1000;
    &--open {
      left: 0;
    }
  }

  .autocomplete__opion {
    height: 30px;
    line-height: 30px;
    width: calc(100% + 10px);
    margin-left: -5px;
    padding-right: 10px;
    padding-left: 10px;
    color: globals.$color-gray60;
    user-select: none;
    cursor: pointer;
    display: block;
    &:hover {
      background-color: globals.$color-gray10;
      color: globals.$color-gray60;
    }
    &--selected {
      background-color: globals.$color-help;
      color: globals.$color-white;
      span {
        color: globals.$color-white;
      }
    }
  }

</style>