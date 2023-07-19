<template>
  <div class="widget widget--interaction widget__call-bar" data-e2e="cal-bar-widget">
    <input type="text" name="" :placeholder="$store.state.settings.dashboard.searchplaceholder" v-model="phoneNumber" @paste="pasteNumber" @keyup="validateNumber" @keydown="numberInput" @keyup.enter="dailNumber" ref="nrField" data-e2e="cal-bar-widget-input">
    <button @click="dailNumber" :disabled="numberValid" data-e2e="cal-bar-widget-button">&#xF3F2;</button>
  </div>
</template>

<script>
import { formatPhoneNumber }    from './../../../use/formatPhoneNumber.ts';
import { isNumber }             from './../../../use/validationFunctions.ts';
import { IPCCCCallControl }     from './../../../ipccc/js/callcontrol.js';
import { useSetDevice }         from '../../../use/setDeviceFunction';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'CallBarWidget',
    props: [],
    data: () => {
        return {
            lang              : '',
            numberIsValid     : false,
            phoneNumber       : '',
            numberField       : null,
            setDeviceFn       : useSetDevice(),
        }
    },
    computed: {
        numberValid() {
            return this.phoneNumber.length < 3;
        }
    },
    methods: {
        pasteNumber() {
            setTimeout(() => {
                formatPhoneNumber(this.phoneNumber, (nr) => {
                    this.phoneNumber = nr;
                    this.validateNumber();
                });
            });
        },
        numberInput(evt) {
            let _evt   = evt || window.evt,
                _key   = _evt.keyCode || _evt.which,
            _keystr   = String.fromCharCode( _key ),
            _regex   = /[0-9#+]/,
            _ctrlDown  = _evt.ctrlKey || _evt.metaKey,
            _shiftDown = _evt.shiftKey;

            if(_ctrlDown && _key == 86 || _ctrlDown && _key == 65  || _ctrlDown && _key == 67) {
                this.validateNumber();
            } else {
                if( (!_regex.test(_keystr) && _key != 8 && _key != 46 && _key != 37 && _key != 39 &&
                    _key != 9 && _key != 96 && _key != 97 && _key != 98 && _key != 99 &&
                    _key != 100 && _key != 101 && _key != 102 && _key != 103 && _key != 104 &&
                    _key != 105 && _key != 107 && (_key == 187 && !_shiftDown)) ||
                    ( (_key != 51 && _key != 56 && _key != 187) && _shiftDown) ) {
                    _evt.returnValue = false;
                    if(_evt.preventDefault) _evt.preventDefault();
                }
            }
        },
        validateNumber() {
            let _stripedNr = this.phoneNumber.replace("+", ""),
                        _l = _stripedNr.length;

            if (_l >= 3 && isNumber(_stripedNr))
            this.numberIsValid = true;
            else
            this.numberIsValid = false;

            this.numberField.focus();
        },
        dailNumber() {
            if(this.numberIsValid) {
                IPCCCCallControl.Call(this.phoneNumber).then(() => {
                    //
                }).catch((error) => {
                    console.error(error.Message);
                    if (this.$store.getters.getHasWebPhone() && error.Message == "Uw telefoontoestel is geblokkeerd") {
                        this.setDeviceFn.handleWebRTCErrorState();
                    }
                });
                this.phoneNumber = '';
                this.numberIsValid = false;
            }
        },
        callOnEnter(evt) {
            evt.preventDefault();
            let _evt       = evt || window.event,
                _key       = _evt.keyCode || _evt.which;

            if(_key == 13 ) this.dailNumber();
        },
    },
    mounted() {
        this.lang        = this.$store.state.browserLanguage;
        this.numberField = this.$refs.nrField;
    }
})
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";
  @use "@/scss/includes/font";

  .widget {
    position: relative;
    width: 100%;
    margin-top: 13px;

    label {
      width: 100%;
      padding-left: 3px;
      font-size: .85em;
      color: globals.$color-gray40;
    }
    select {
      width: 100%;
      margin-top: 0;
      border: none;
    }
    &:before {
      top: calc(50% + 12px);
      left: calc(100% - 34px);
    }
  }

  .widget__call-bar {
  height: 70px;
  input[type='text'],
  button {
    float: left;
    height: 40px;
    line-height: 40px;
  }
  input[type='text'] {
    width: calc(100% - 60px);
    border: none;
    border-bottom: 1px solid globals.$color-gray20;
    padding: 0 5px 0 25px;
  }
  button {
    width: 40px;
    height: 40px;
    background-color: globals.$color-green;
    color: globals.$color-white;
    cursor: pointer;
    @include font.font-icon();
    font-size: 1.2rem;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,.2);
    border-radius: 5px;
    margin-left: 20px;

    &:disabled {
      opacity: .35;
      background-color: functions.tint(globals.$color-green, 50%);
      box-shadow: 0 0 0 0 rgba(0,0,0,0);
    }
  }
  &:before {
    content: '\F61C';
    position: absolute;
    left: 20px;
    top: 40%;
    transform: translateY(-50%);
    height: 50px;
    line-height: 50px;
    @include font.font-icon();
    font-size: 1.1rem;
    color: globals.$color-gray40;
  }
}

</style>