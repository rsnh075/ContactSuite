<template>
  <div class="ipfield-wrapper" data-e2e="ip-field">
    <input type="text" v-model="ipParts[0]" placeholder="000" @keypress="checkInput($event)" @keyup="onchange" @click="clearField" @focus="clearField" :ref="'field_' + tabindex" />
    <span>.</span>
    <input type="text" v-model="ipParts[1]" placeholder="000" @keypress="checkInput($event)" @keyup="onchange" @click="clearField" @focus="clearField" :ref="'field_' + (tabindex + 1)" />
    <span>.</span>
    <input type="text" v-model="ipParts[2]" placeholder="000" @keypress="checkInput($event)" @keyup="onchange" @click="clearField" @focus="clearField" :ref="'field_' + (tabindex + 2)" />
    <span>.</span>
    <input type="text" v-model="ipParts[3]" placeholder="000" @keypress="checkInput($event)" @keyup="onchange" @click="clearField" @focus="clearField" :ref="'field_' + (tabindex + 3)" />
  </div>
</template>

<script>

export default {
  name: "IPfield",
  props: {
    ipaddress: {
      type: String,
      default: '',
    },
    tabindex: {
      type: Number,
      default: 1,
    },
    setfocus: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ipParts: [],
    };
  },
  watch: {
    ipaddress: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.ipParts = [];
        this.ipParts = this.ipaddress.split(".");
        if (newVal.replace(".", "").length >= 4) {
          this.$emit("lastready");
        }
      }
    },
    setfocus: function (newVal, oldVal) {
      if (newVal) this.$refs[`field_${this.tabindex}`].focus();
    },
  },
  methods: {
    preventDef(evt) {
      let _evt = evt || window.event;

      _evt.returnValue = false;
      if (evt.preventDefault()) evt.preventDefault();
    },
    checkInput(evt) {
      let _evt = evt || window.event,
        _key = _evt.keyCode || _evt.which,
        _keystr = String.fromCharCode(_key),
        _val = evt.target.value,
        _currentIndex,
        _currentField,
        _nextIndex,
        _nextField;

      for (const field in this.$refs) {
        if (this.$refs[field] === evt.target) {
          _currentIndex = parseInt(field.replace("field_", ""));
          _currentField = this.$refs[`field_${_currentIndex}`];
          _nextIndex = _currentIndex + 1;
          _nextField = this.$refs[`field_${_nextIndex}`];
        }
      }

      if (_key === 46 && _val?.length >= 1 && _currentIndex !== 3) {
        //First check if dot is pressed
        this.preventDef(evt);
        if (_nextField) _nextField.focus();
        return;
      }

      if ((_key === 46 && _val?.length >= 1 && _currentIndex === this.tabindex + 3) || (_val?.length === 3 && _currentIndex === this.tabindex + 3)) {
        this.$emit("ready");
      }

      if (_val?.length >= 0 && _currentIndex === this.tabindex + 3) {
        this.$emit("lastready");
      }

      if ((_val + _keystr).length > 3) {
        this.preventDef(evt);

        if (!_val.match(/^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/)) {
          this.ipParts[_currentIndex] = _currentField.value = "";
          _currentField.focus();
          return;
        }

        if (_keystr.match(/^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/)) {
          if (_nextField) {
            _nextField.focus();
            this.ipParts[_nextIndex] = _nextField.value = _keystr;
          }
          return;
        }
      }

      if ((_val + _keystr).match(/^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/)) {
        return;
      } else {
        this.preventDef(evt);
        this.ipParts[_currentIndex] = "";
        _currentField.focus();
      }
    },
    clearField(evt) {
      evt.target.select();
      //evt.target.value = '';
    },
    isValid() {
      return this.ipParts.length == 4;
    },
    onchange() {
      let _tempArr = [];
      for (let i = 0; i < 4; i++) {
        if (this.ipParts[i]) _tempArr.push(this.ipParts[i]);
        //else
        //  _tempArr.push(0);
      }
      if (this.isValid()) {
        this.$emit("ipchange", _tempArr.slice(0, 4).join("."));
      }
    },
  },
  mounted() {
    this.ipParts = this.ipaddress.split(".");
    if (this.setfocus) this.$refs[`field_${this.tabindex}`].focus();
  },
};
</script>

<style lang="scss" scoped>
@use "@/scss/includes/functions";
@use "@/scss/includes/globals";

.ipfield-wrapper {
  float: left;
  display: block;
  width: 100%;
  height: 40px;
  line-height: 40px;
  margin-bottom: 20px;
  input {
    text-align: center;
    width: calc(25% - 10px);
  }
  span {
    width: 10px;
    text-align: center;
  }
}
</style>
