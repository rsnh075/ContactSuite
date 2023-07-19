<template>
  <div data-e2e="cell-editor">
    <div v-show="visibility" class="editor-modal" @click="cancel"></div>
    <div v-show="visibility" class="editor__pannel">
      <header class="editor__pannel-header">{{ $store.state.settings.usermanagement.editvaluelbl}}: {{ newData.prop }}</header>
      <div class="editor__pannel-body">
        <div class="row" v-if="String(newData.prop).toLowerCase() === 'callgroups'">
          <div class="form__multiSelector">
            <div v-for="(item, index) in listData" :key="index">
              <input type="checkbox" :id="'listitem_' + index" @change="setListItems(item.Id)" :checked="selectedListItems.has(item.Id.toString())">
              <label :for="'listitem_' + index">{{ item.Titel }}</label>
            </div>
          </div>
        </div>
        <div class="row" v-else-if="String(newData.prop).toLowerCase() === 'rol'">
          <div class="form__multiSelector form__multiSelector--radio">
            <div v-for="(item, index) in listData" :key="index">
              <input type="checkbox" :id="'listitem_' + index" @change="setOneListItem(item.RoleId)" :checked="selectedListItems.has(item.RoleId.toString())">
              <label :for="'listitem_' + index">{{ item.Name }}</label>
            </div>
          </div>
        </div>
        <div class="row" v-else-if="String(newData.prop).toLowerCase() === 'afdeling'">
          <div class="form__multiSelector form__multiSelector--radio">
            <div v-for="(item, index) in listData" :key="index">
              <input type="checkbox" :id="'listitem_' + index" @change="setOneListItem(item.Id)" :checked="selectedListItems.has(item.Id.toString())">
              <label :for="'listitem_' + index">{{ item.Title }}</label>
            </div>
          </div>
        </div>
        <div class="row" v-else>
          <div class="form-textfield form-textfield--bground">
            <input v-if="String(newData.prop).toLowerCase() === 'voipnummer'" type="number" v-model="newData.val" @keypress="checkNumber($event)" ref="inputfield">
            <input v-else-if="String(newData.prop).toLowerCase() === 'startdatum'" type="text" v-model="newData.val" ref="inputfield" autocomplete="off">
            <input v-else type="text" v-model="newData.val" ref="inputfield">
            <label class="form-label form-label--hidden">{{ newData.prop }}</label>
          </div>
        </div>
        <div v-if="String(newData.prop).toLowerCase() === 'startdatum' || String(newData.prop).toLowerCase() === 'callgroups' || String(newData.prop).toLowerCase() === 'rol' || String(newData.prop).toLowerCase() === 'afdeling'" class="row">
          <div class="form-checkbox form-checkbox--mod">
            <input type="checkbox" id="doall" :checked="optiontype !== ''" @change="setOption('applyToAll')">
            <label for="doall">{{ $store.state.settings.usermanagement.doall }}</label>
          </div>
        </div>
        <div v-if="String(newData.prop).toLowerCase() === 'voipnummer'" class="row">
          <div class="form-checkbox form-checkbox--mod">
            <input type="checkbox" id="numberdown" :checked="optiontype !== ''" @change="setOption('continueNumbering')">
            <label for="numberdown">{{ $store.state.settings.usermanagement.numberdown }}</label>
          </div>
        </div>
      </div>
      <footer class="editor__pannel-footer">
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="cancel">{{ $store.state.settings.usermanagement.canceleditorlbl }}</a>
          <a class="button-primary button-primary" @click="save">{{ $store.state.settings.usermanagement.saveeditorlbl }}</a>
        </span>
      </footer>
    </div>
</div>
</template>

<script>

  export default {
    name: 'CellEditor',
    props : {
      visibility : {
        type : Boolean,
        default : false
      },
      data : {
        type : Object,
        default : {}
      },
      list : {
        type : Array,
        default: () => []
      }
    },
    data: () => {
      return {
        newData : {},
        optiontype : '',
        datepickerFrom : '',
        listData: [],
        selectedListItems: new Set(),
      }
    },
    watch: {
      data: function(newVal, oldVal) {
        this.newData          = JSON.parse(JSON.stringify(newVal));
        this.listData         = [...this.list];
        this.selectedListItems.clear();
        if(String(this.newData.prop).toLowerCase() === 'callgroups' && this.newData.val !== '') {
          this.selectedListItems = new Set(this.newData.val.split(','));
        }
        this.optiontype       = '';
        this.setDatePicker();
        this.focusOnInput();
      }
    },
    methods: {
      setOneListItem(val) {
        this.selectedListItems.clear();
        this.selectedListItems.add(val.toString());
        this.newData.val = [...this.selectedListItems.values()][0];
        this.$forceUpdate();
      },
      setListItems(val) {
        if(this.selectedListItems.has(val.toString())) {
          this.selectedListItems.delete(val.toString());
        } else {
          this.selectedListItems.add(val.toString());
        }

        this.newData.val = [...this.selectedListItems.values()].join(',');
      },
      setDate(date) {
        this.newData.val = date;
      },
      setDatePicker() {
        if(String(this.newData.prop).toLowerCase() === 'startdatum') {
          this.datepickerFrom = new PikaDay({
            field: this.$refs.inputfield,
            format: 'D-M-YYYY',
            minDate: new Date(),
            i18n: this.$store.state.settings.datepicker,
            onSelect: () => {
              this.setDate(this.datepickerFrom.toString());
            },
          })
        } else {
          if(this.datepickerFrom)
            this.datepickerFrom.destroy();
        }
      },
      focusOnInput() {
        if(String(this.newData.prop).toLowerCase() !== 'startdatum' && String(this.newData.prop).toLowerCase() !== 'callgroups' && String(this.newData.prop).toLowerCase() !== 'rol')
          setTimeout(() => {
            if(this.$refs.inputfield)
              this.$refs.inputfield.focus()
          }, 0);
      },
      checkNumber(evt) {
        if(evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57) {
          evt.preventDefault();
        }
      },
      setOption(type) {
        this.optiontype = type ? type : '';
      },
      cancel() {
        this.$emit('oncancel');
      },
      save() {
        this.$emit('onsave', {
          data   : this.newData,
          option : this.optiontype
        });
      }
    },
    mounted() {

    }
  }
</script>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";

  .editor-modal {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: rgba(0,0,0,.15);
    z-index: 1000;
  }

  .editor__pannel {
    position: absolute;
    display: block;
    top: 200px;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    max-width: 480px;
    min-height: 120px;
    background-color: globals.$color-white;
    border-radius: 3px;
    box-shadow: 0 0 40px 0 rgba(0,0,0,.2);
    z-index: 2000;
  }

  .editor__pannel-header {
    position: relative;
    height: 45px;
    line-height: 45px;
    padding: 0 15px;
    color: globals.$color-gray60;
    font-size: 1.1em;
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 15px;
      right: 15px;
      height: 1px;
      background-color: globals.$color-gray10;
    }
  }

  .editor__pannel-body {
    padding: 15px;
  }

  .editor__pannel-footer {
    height: 45px;
    padding: 5px 15px 0 15px;
  }

  .row {
    position: relative;
  }

  .form-checkbox--mod {
    label {
      padding-left: 28px;
      &:before {
        line-height: 30px;
      }
    }
  }

  .form__multiSelector {
    position: relative;
    height: 180px;
    overflow-x: hidden;
    overflow-y: scroll;
    border: 1px solid globals.$color-gray20;
    div {
      height: 35px;
      line-height: 35px;
      input[type=checkbox] {
        position: absolute;
        left: 0;
        visibility: hidden;
        z-index: 10;
        width: 30px;
      }
      label {
        display: inline-block;
        cursor: pointer;
        position: relative;
        user-select: none;
        width: 100%;
        height: 40px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        user-select: none !important;
        &:before {
          content: "\F12E";
          width: 30px;
          display: inline-block;
          font-family: 'Material Design Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 22px;
          height: 40px;
          line-height: 40px;
          padding-top: 2px;
          color: globals.$color-gray10;
        }
      }
      input[type=checkbox]:checked + label:before {
        content: "\F132";
        color: globals.$color-secondary;
        text-shadow: none;
      }
    }
    &--radio div label:before {
      content: "\F43D";
    }
    &--radio div input[type=checkbox]:checked + label:before {
      content: "\F43E";
    }
  }
</style>
