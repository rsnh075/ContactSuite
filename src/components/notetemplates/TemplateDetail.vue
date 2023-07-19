<template>
  <div v-if="visible" :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="template-detail">
    <context-menu
      :visability  = "contextMenuVisability"
      :position    = "contextPosition"
      :itemList    = "contextMenuItems"
      @mouseisout  = "contextMenu"
    >
      <template v-slot="{ row }">
        <div class="context-item" @click="handleContextAction($event, row.eventtype)">
          <span v-if="row.icon !== ''" class="context-item__icon" v-html="row.icon"></span>
          <span :class="['context-item__label', {'context-item__label--header' : row.eventtype === 'null'}]">{{ row.label }}</span>
        </div>
      </template>
    </context-menu>
    <!-- FIELDTYPE EDITOR -->
    <div class="fieldtype-editor-wrapper">
      <component
        :is="selectedFieldType"
        :visible="showFieldSettings"
        :fielddata="dataSelectedField"
        @removeunsavedfield="deleteInputField(selectedFieldIndex)"
        @close="closeField"
        @save="saveField"
      ></component>
    </div>
    <!-- TEMPLATE DETAIL -->
    <div id="detailscreen" class="detailscreen">
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ showTitle }}</span>
        </div>
      </div>
      <form @valid="saveDetail()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
        <div class="grid-row">
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="detailName" id="detailName" v-model="dataDetail.Name" :placeholder="$store.state.settings.notetemplates.formname" data-validate="isNotEmpty" :data-message="$store.state.settings.notetemplates.validatename">
              <label for="detailName" class="form-label form-label--hidden">{{ $store.state.settings.notetemplates.formname }}</label>
            </div>
          </div>
          <div class="grid-unit--beta">
            <div class="form-textfield form-textfield--bground">
              <input type="text" name="formdescription" id="formdescription" v-model="dataDetail.Description" :placeholder="$store.state.settings.notetemplates.formdescription" data-validate="isNotEmpty" :data-message="$store.state.settings.notetemplates.validatedescription">
              <label for="formdescription" class="form-label form-label--hidden">{{ $store.state.settings.notetemplates.formdescription }}</label>
            </div>
          </div>
        </div>
        <div class="grid-row">
          <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.notetemplates.inputfieldsheader }}</h2>
        </div>
        <!-- INPUTS -->
        <div class="grid-row">
          <div v-for="(inputfield, index) in dataDetail.Template.FieldMappings" :key="index" :class="[{'grid-unit--beta' : inputfield.fieldwidth == 'Single'}, {'grid-unit--alpha' : inputfield.fieldwidth == 'Double'}, getHeightClass(inputfield.fieldheight)]">
            <span :class="['inputfields__label', {'inputfields__label--empty' : inputfield.fieldlabel[selectedLang].length == 0}]">{{ inputfield.fieldlabel[selectedLang] }}</span>
            <span v-if="inputfield.fieldissubject" class="inputfields__subject">{{ $store.state.settings.notetemplates.fieldissubjectlbl }}</span>
            <div :class="['inputfields__button', {'inputfields__button--noclick' : (inputfield.metadatafield)}]" @click="openFieldSettings(index, $event, inputfield.metadatafield)">
              <span class="inputfields__button__fieldicon" v-html="inputfield.fieldicon"></span>
              <span class="inputfields__button__label">{{ inputfield['fieldtypename_' + selectedLang] }}</span>
              <span v-if="inputfield.hasfieldheighticon" :class="['inputfields__button__fieldheighticonup', {'inputfields__button__fieldheighticonup--disabled' : inputfield.fieldheight == 5}]" @click="changeLayoutHeight('up', inputfield.fieldheight, index, $event)">&#xF791;</span>
              <span v-if="inputfield.hasfieldheighticon" :class="['inputfields__button__fieldheighticondown', {'inputfields__button__fieldheighticondown--disabled' : inputfield.fieldheight == 1}]" @click="changeLayoutHeight('down', inputfield.fieldheight, index, $event)">&#xF798;</span>
              <span class="inputfields__button__fieldwidthicon" @click="changeFieldWidth(inputfield.fieldwidth, index, $event)" v-html="fieldWidthIcon(inputfield.fieldwidth)"></span>
              <span class="inputfields__button__contextmenu" @click="contextMenu($event, index, inputfield.fieldtype, inputfield.metadatafield)">&#xF1D9;</span>
            </div>
          </div>
          <div class="grid-unit--beta inputfields__button-height">
            <div class="inputfields__button-empty">
              <div class="addbutton-wrapper">
                <AddSingleSelectSearchFlyOut
                  :selectBoxConfig="selectBoxConfig"
                  :list="fieldsList"
                  @addSelected="addInputField"
                />
              </div>
            </div>
          </div>
        </div>

      </form>
      <!-- BUTTONS -->
      <div class="detailscreen-footer detailscreen-footer--inside">
        <!-- <span>
          <a v-if="dataDetail.Id >= 0" class="button-primary button-primary--delete" @click="deleteDetail()">{{ $store.state.settings.notetemplates.deletebtnlbl }}</a>
        </span> -->
        <span class="grid--push">
          <a class="button-primary button-primary--gray" @click="closeDetail()">{{ $store.state.settings.notetemplates.closebtnlbl }}</a>
          <a class="button-primary js-submitbtn">{{ $store.state.settings.notetemplates.savebtnlbl }}</a>
        </span>
      </div>

    </div>
  </div>
</template>

<script>
  /**
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   * If 'Duits/German' becomes a browser language add 'fieldtypename_de' etc. to templatefields
   *
   */

  import { defineComponent,
           defineAsyncComponent }     from 'vue'
  import ContextMenu                  from './../v2_components/ContextMenu.vue';
  import { NOTEFIELDS }               from './noteTemplateFields/NoteTemplateFields';
  import AddSingleSelectSearchFlyOut  from './../v2_components/AddSingleSelectSearchFlyOut.vue';
  import { ValidateDir }              from './../../directives/validate';

  const TextField      = defineAsyncComponent(() => import('./noteTemplateFields/TextField.vue'));
  const SelectField    = defineAsyncComponent(() => import('./noteTemplateFields/SelectField.vue'));
  const RadioListField = defineAsyncComponent(() => import('./noteTemplateFields/RadioListField.vue'));
  const TextAreaField  = defineAsyncComponent(() => import('./noteTemplateFields/TextAreaField.vue'));

  export default defineComponent({
    name: 'TemplateDetail',
    props: ['visible', 'datadetail', 'selectedid'],
    data: () => {
      return {
        showHelp                 : false,
        dataDetail               : null,
        selectedFieldType        : null,
        selectedFieldIndex       : -1,
        dataSelectedField        : null,
        showFieldSettings        : false,
        selectBoxConfig          : {},
        fieldsList               : [],
        selectedLang             : null,
        contextMenuVisability    : false,
        contextPosition          : { x : 0, y : 0 },
        contextMenuItems         : [],
        cutOutField              : null,
      }
    },
    components: {
      ContextMenu,
      AddSingleSelectSearchFlyOut,
      TextField,
      SelectField,
      RadioListField,
      TextAreaField,
    },
    directives: {
      Validate : ValidateDir
    },
    computed: {
      showTitle() {
        return this.dataDetail.Name ? this.dataDetail.Name.length > 0 ? this.dataDetail.Name : this.$store.state.settings.notetemplates.newnameplaceholder : this.$store.state.settings.notetemplates.newnameplaceholder;
      },
    },
    watch: {
      datadetail: function(newVal, oldVal) {
        this.resetDataDetail();
        if(newVal) this.dataDetail = JSON.parse(JSON.stringify(newVal));
      }
    },
    methods: {
      saveDetail() {
        this.$emit('save', this.dataDetail);
      },
      // deleteDetail() {
      //   this.$emit('delete', this.dataDetail);
      // },
      closeDetail() {
        this.$emit('close');
      },
      //=========================================================== START EDIT DETAIL
      addInputField(item) {
        let _newField = JSON.parse(JSON.stringify(item));
        if(item.metadatafield) {
          this.dataDetail.Template.FieldMappings.push(_newField);
          this.resetSelectedField();
        } else {
          _newField.isnew = true;
          this.dataDetail.Template.FieldMappings.push(_newField);
          this.openFieldSettings(this.dataDetail.Template.FieldMappings.length - 1);
        }
      },
      deleteInputField(fieldindex) {
        this.dataDetail.Template.FieldMappings.splice(fieldindex, 1);
      },
      openFieldSettings(fieldindex, e = null, ismetadata = false) {
        if(e != null) e.stopPropagation();
        if(ismetadata) return;
        this.selectedFieldIndex = fieldindex;
        this.dataSelectedField  = JSON.parse(JSON.stringify(this.dataDetail.Template.FieldMappings[fieldindex]));
        this.selectedFieldType  = this.dataSelectedField.fieldtype;
        this.showFieldSettings  = true;
      },
      cutField(fieldindex) {
        this.cutOutField = this.dataDetail.Template.FieldMappings.splice(fieldindex, 1)[0];
      },
      pasteField(fieldindex) {
        if(this.cutOutField) this.dataDetail.Template.FieldMappings.splice(fieldindex, 0, JSON.parse(JSON.stringify(this.cutOutField)));
      },
      insertBeforeField(fieldindex) {
        //TODO
      },
      insertAfterField(fieldindex) {
        //TODO
      },
      changeFieldWidth(fieldwidth, fieldindex, e) {
        e.stopPropagation();
        this.dataDetail.Template.FieldMappings[fieldindex].fieldwidth = fieldwidth == 'Single' ? 'Double' : 'Single';
        this.$forceUpdate();
      },
      changeLayoutHeight(type, fieldheight, fieldindex, e) {
        e.stopPropagation();
        if(type == 'up') {
          this.dataDetail.Template.FieldMappings[fieldindex].fieldheight = fieldheight + 1;
        } else {
          this.dataDetail.Template.FieldMappings[fieldindex].fieldheight = fieldheight - 1;
        }
        this.$forceUpdate();
      },
      closeField() {
        this.showFieldSettings = false;
        this.resetSelectedField();
      },
      saveField(data) {
        this.dataDetail.Template.FieldMappings[this.selectedFieldIndex] = JSON.parse(JSON.stringify(data));
        this.checkSubjectField(this.selectedFieldIndex); //remove subjectfield from all other fields if necesssary
        this.checkIsNewField(this.selectedFieldIndex); //remove isnew if necesssary
        this.showFieldSettings = false;
        this.resetSelectedField();
      },
      //==========================================HELPER FUNCTIONS
      checkSubjectField(fieldindex) {
        if(this.dataDetail.Template.FieldMappings[fieldindex].fieldissubject) {
          this.dataDetail.Template.FieldMappings.forEach((el, index) => {
            el.fieldissubject = index == fieldindex;
          });
        }
      },
      checkIsNewField(fieldindex) {
        if(this.dataDetail.Template.FieldMappings[fieldindex].isnew) {
          delete this.dataDetail.Template.FieldMappings[fieldindex].isnew;
        }
      },
      getHeightClass(fieldheight) {
        return 'inputfields__button-height' + fieldheight;
      },
      contextMenu(e, fieldindex = -1, fieldtype = '', ismetadatafield = false) {
        if(e.type.toLowerCase() === 'mouseisout') {
          this.contextMenuVisability     = false;
        } else {
          e.stopPropagation();
          this.selectedFieldIndex         = fieldindex;
          this.contextMenuItems[1].active = !ismetadatafield; //
          this.contextMenuItems[3].active = this.cutOutField ? true : false;
          this.contextMenuVisability      = true;
          this.contextPosition            = { x : e.clientX, y : e.clientY };
        }
      },
      handleContextAction(e, eventType) {
        e.stopPropagation();
        switch(eventType) {
          case 'edit':
            this.openFieldSettings(this.selectedFieldIndex);
            this.contextMenuVisability = false;
            break;
          case 'cut':
            this.cutField(this.selectedFieldIndex);
            this.contextMenuVisability = false;
            break;
          case 'paste':
            this.pasteField(this.selectedFieldIndex);
            this.contextMenuVisability = false;
            break;
          case 'delete':
            this.deleteInputField(this.selectedFieldIndex);
            this.contextMenuVisability = false;
            break;
          default:
            return false;
        }
      },
      fieldWidthIcon(fieldwidth) {
        return fieldwidth == 'Single' ? '&#xF84D;' : '&#xF84B;';
      },
      resetDataDetail() {
        this.dataDetail = null;
        this.resetSelectedField();
      },
      resetSelectedField() {
        this.selectedFieldIndex = -1;
        this.selectedFieldType  = null;
        this.dataSelectedField  = null;
      },
      displayHelp() {
        this.showHelp = !this.showHelp;
      },
      shakeIt() {
        let _elm = document.querySelector("#detailscreen");
        _elm.classList.add('detailscreen--shake');
        setTimeout(() => {
          _elm.classList.remove('detailscreen--shake');
        }, 1000);
      },
    },
    created() {
      this.fieldsList = NOTEFIELDS.reduce((fieldlist, field) => (fieldlist = [ ...fieldlist, { ...field, "Icon" : field.fieldicon }]), []);
      this.selectedLang = this.$store.getters.getLang();
      this.contextMenuItems = [
        {
          icon      : '',
          label     : this.$store.state.settings.notetemplates.contextmenu[0],
          eventtype : 'null',
          active    : true,
        }, {
          icon      : '&#xF3EB;',
          label     : this.$store.state.settings.notetemplates.contextmenu[1],
          eventtype : 'edit',
          active    : true,
        }, {
          icon      : '&#xF190;',
          label     : this.$store.state.settings.notetemplates.contextmenu[2],
          eventtype : 'cut',
          active    : true,
        }, {
          icon      : '&#xF192;',
          label     : this.$store.state.settings.notetemplates.contextmenu[3],
          eventtype : 'paste',
          active    : true,
        }, {
          icon      : '&#xF1C0;',
          label     : this.$store.state.settings.notetemplates.contextmenu[6],
          eventtype : 'delete',
          active    : true,
        }
      ];
    },
    mounted() {
      this.selectBoxConfig.title           = this.$store.state.settings.notetemplates.selectfieldtypeheader;
      this.selectBoxConfig.filterProperty  = this.$store.state.settings.notetemplates.selectfieldtypename;
    }
  });

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";
  @use "@/scss/includes/functions";
  @use "@/scss/includes/font";
  @use "@/scss/includes/mixins";

  .inputfields {
    &__wrapper {
      width: 100%;
      padding: 10px;
      min-height: 300px;
      overflow: auto;
    }
    &__label {
      display: block;
      padding-left: 3px;
      // font-family: 'Open Sans SemiBold', sans-serif;
      @include font.font-medium();
      font-size: 0.7rem;
      line-height: 26px;
      color: globals.$color-gray35;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: calc(100% - 60px);
      &--empty {
        margin-top: 26px;
      }
    }
    &__subject {
      color: globals.$color-settings;
      font-size: 0.7rem;
      line-height: 26px;
      display: block;
      width: 60px;
      position: absolute;
      right: 7px;
      top: 8px;
    }
    &__button-empty {
      margin-top: 26px;
      display: grid;
      justify-content: center;
      height: 40px;
      color: globals.$color-gray60;
      border-radius: 2px;
      border: dashed 2px globals.$color-gray20;
      background-color: rgba(255, 255, 255, 0.8);
      &__emptylabel {
        overflow: hidden;
        display: block;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .addbutton-wrapper {
        position: relative;
        margin-top: -2px;
        width: 40px;
      }
    }
    &__button {
      position: relative;
      width: 100%;
      height: calc(100% - 30px);
      background-color: functions.tint(globals.$color-black, 93%);
      border-radius: 2px;
      box-shadow: 1px 1px 1px 0 rgba(0,0,0,.2);
      &:hover {
        cursor: pointer;
      }
      &--noclick:hover {
        cursor: default;
      }
      &__label {
        position: absolute;
        padding-left: 40px;
        font-size: 0.9rem;
        line-height: 40px;
        color: globals.$color-black;
        width: calc(100% - 105px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &__fieldicon,
      &__fieldwidthicon,
      &__fieldheighticondown,
      &__fieldheighticonup,
      &__contextmenu {
        position: absolute;
        top: 4px;
        right: 5px;
        width: 30px;
        height: 30px;
        line-height: 30px;
        color: globals.$color-gray30;
        border-radius: 50%;
        font-size: 1.2em;
        text-align: center;
        // @include font-icon();
        font-family: 'Material Design Icons';
        cursor: pointer;
        &:hover,
        &-active {
          background-color: globals.$color-white;
        }
      }
      &__fieldicon {
        right: initial;
        left: 5px;
        &:hover {
          background-color: initial;
        }
      }
      &__fieldwidthicon {
        right: 40px;
      }
      &__fieldheighticondown {
        right: 75px;
      }
      &__fieldheighticonup {
        right: 110px;
      }
      &__fieldheighticondown--disabled,
      &__fieldheighticonup--disabled {
        pointer-events: none;
        color: globals.$color-gray15;
      }
    }
    &__button-height1 {
      height : 82px;
    }
    &__button-height2 {
      height : 164px;
    }
    &__button-height3 {
      height : 246px;
    }
    &__button-height4 {
      height : 328px;
    }
    &__button-height5 {
      height : 410px;
    }
  }

  .context-item {
    height: 40px;
    line-height: 40px;
    padding: 0 30px 0 20px;
    cursor: pointer;
    &:hover {
      background-color: globals.$color-gray5;
    }
    &__icon {
      margin-right: 5px;
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      color: globals.$color-gray60;
    }
    &__label {
      padding-right: 10px;
      font-size: .9em;
      color: globals.$color-gray60;
      &--header {
        font-family: 'Open Sans Bold', sans-serif;
      }
    }
  }

</style>
