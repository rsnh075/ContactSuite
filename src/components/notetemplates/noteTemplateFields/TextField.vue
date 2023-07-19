<template>
  <div id="textfield" :class="['dialog__modal dialog__modal--second', {'dialog__modal--open' : visible}]" data-e2e="text-field">
    <div :class="['dialog__window dialog__window--w680', {'dialog__window--open' : visible}]">
      <div class="dialog__window-header">
        <span class="dialog__window-title">{{ $store.state.settings.notetemplates.textfieldheader }}</span>
        <span v-if="fieldData" class="form-checkbox form-checkbox--medium">
          <input type="checkbox" id="showeassubject" v-model="fieldData.fieldissubject">
          <label for="showeassubject">{{ $store.state.settings.notetemplates.showeassubjectlbl }}</label>
        </span>
        <a class="dialog__window-close" @click="closeField()">
          <span></span>
          <span></span>
        </a>
      </div>
      <div class="dialog__window-body" v-if="fieldData">
        <form @valid="saveField()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn--textfield'}">
          <div class="grid-row">
            <div class="grid-unit--beta">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="textfieldproperty" id="textfieldproperty" v-model="fieldData.fieldproperty" @keyup="setFieldLabel($event)" :placeholder="$store.state.settings.notetemplates.textfieldpropertylbl" data-validate="isNotEmpty" :data-message="$store.state.settings.notetemplates.validtextfield">
                <label for="textfieldproperty" class="form-label form-label--hidden">{{ $store.state.settings.notetemplates.textfieldpropertylbl }}</label>
              </div>
            </div>
            <div class="grid-unit--beta form-textfield__form-togglefield">
              <div class="form-textfield form-textfield--bground">
                <input type="text" name="toggle_fieldrequiredlbl" :value="$store.state.settings.notetemplates.requiredlbl" readonly>
                <label for="toggle_fieldrequiredlbl" class="form-label form-label--hidden"></label>
              </div>
              <div class="form-togglefield">
                <input type="checkbox" name="toggle_textfieldrequired" id="toggle_textfieldrequired" v-model="fieldData.fieldrequired">
                <label for="toggle_textfieldrequired"></label>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="grid-unit--alpha dialog__window-footer">
        <a class="button-primary dialog__window-cancel" @click="closeField()">{{ $store.state.settings.notetemplates.closebtnlbl }}</a>
        <a class="button-primary button-primary--important js-submitbtn--textfield">{{ $store.state.settings.notetemplates.savebtnlbl }}</a>
      </div>
    </div>
  </div>
</template>

<script>
  /**
   *
   * TextField
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   *
   */

  import { ValidateDir }      from '../../../directives/validate';
  import { defineComponent }  from 'vue'

  export default defineComponent({
    name: 'TextField',
    props: ['visible', 'fielddata'],
    data: () => {
      return {
        fieldData          : null,
      }
    },
    directives: {
      Validate : ValidateDir
    },
    methods: {
      setFieldLabel(evt) {
        let _val = evt.target.value;
        this.fieldData.fieldlabel = {"nl" : _val, "en" : _val};
      },
      closeField() {
        if(this.fieldData.isnew) this.$emit('removeunsavedfield');
        this.$emit('close')
      },
      saveField() {
        this.$emit('save', this.fieldData);
      },
      //==========================================HELPER FUNCTIONS
      shakeIt() {
        let _elm = document.querySelector("#textfield");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
    },
    mounted() {
      this.fieldData          = this.fielddata;
    }
  });
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  #textfield .grid-row .grid-unit--beta:first-of-type {
    padding-top: .5rem;
    padding-right: .5rem;
    padding-bottom: .5rem;
  }
  #textfield .grid-row .grid-unit--beta:last-of-type {
    padding-top: .5rem;
    padding-left: .5rem;
    padding-bottom: .5rem;
  }
  #textfield .grid-row .grid-unit--alpha {
    padding-top: .5rem;
    padding-bottom: .5rem;
  }
  #textfield .form-textfield__form-togglefield .form-togglefield {
    right: 1.5rem;
  }
  #textfield .form-checkbox.form-checkbox--medium {
    right: 50px;
    width: initial;
    height: initial;
    margin-top: initial;
    label:before {
      color: globals.$color-white;
    }
    input[type=checkbox]:checked + label:before {
      color: globals.$color-secondary;
    }
  }


</style>