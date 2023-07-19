<template>
  <div v-if="status && content.hasOwnProperty('title')" class="editor-modal" :style="'left:' + leftpos" data-e2e="text-editor">
    <div class="editor-screen">
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="editor-screen__title">{{ $store.state.settings.helpcenter.textedithead }}</span>
          <a class="dialog__window-close" @click="cancelText">
            <span></span>
            <span></span>
          </a>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--beta">
          <div class="form-textfield form-textfield--bground">
            <input type="text" name="title" id="title" :placeholder="$store.state.settings.helpcenter.articletitlelbl" v-model="content.title">
            <label for="title" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.helpcenter.articletitlelbl }}</label>
          </div>
        </div>
        <div class="grid-unit--beta">
          <div class="form-selectfield form-selectfield--inline-bground">
            <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.helpcenter.textlinklabel }}</label>
            <select v-model="content.linkmodule" ref="linkselector">
              <option value="">{{ $store.state.settings.helpcenter.defaultlinklbl }}</option>
              <option v-for="link in menuItems" :value="link.url">{{ link.label }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--alpha">
          <editor
            api-key="8d024zhva6wrbyqsdn1c8x30mflx0ml8gq787vb562fofraz"
            :init="{
              height   : 500,
              menubar  : false,
              plugins  : [
                         'advlist autolink lists link image charmap print preview anchor',
                         'searchreplace visualblocks code fullscreen',
                         'insertdatetime media table paste code help wordcount'
                        ],
              toolbar  :
                        'undo redo | bold italic | \
                        alignleft aligncenter alignright | \
                        bullist numlist outdent indent | removeformat | help'
            }"
            v-model="bodyTxt"
          />
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--alpha">
          <span class="grid--push">
            <a class="button-primary button-primary--gray" @click="cancelText">{{ $store.state.settings.helpcenter.cancelarticlelbl }}</a>
            <a class="button-primary" @click="saveText">{{ $store.state.settings.helpcenter.savearticlelbl }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  
  import { MENU }  from './../../settings/menu';
  import Editor    from '@tinymce/tinymce-vue';

  
  export default {
    name: 'TextEditor',
    props: ['textdata', 'lang', 'status', 'leftpos'],
    data: () => {
      return {
        content   : {},
        bodyTxt   : '',
        menuItems : [],
      }
    },
    components: {
      'editor' : Editor
    },
    watch: {
      'status' : function(newVal, oldVal) {
        if(newVal) {
          this.content = JSON.parse(JSON.stringify(this.textdata));
          this.bodyTxt = unescape(this.content.body);
        }
      },
    },
    methods: {
      cancelText() {
        this.$emit('onCancel');
      },
      saveText() {
        this.content.body      = escape(this.bodyTxt);
        this.$emit('onSave', this.content);
      },
      getMenuItems(tree) {
        let _list = [];
        
        const getLabels = (tree, parent = '') => {
          let _lastparent = '';
          tree.forEach(el => {
            if(el.appMenu && el.appMenu.length > 0) {
              getLabels(el.appMenu);
            } else {
              if(parent != '') {
                parent != _lastparent ? _list.splice(_list.length - 1) : false;
                _lastparent = parent;
                _list.push({
                  "label" : parent + ' - ' + el.label[this.lang],
                  "url"   : el.url
                });
               } else {
                _list.push({
                  "label" : el.label[this.lang],
                  "url"   : el.url
                });
               }
            }
            if(el.subMenu && el.subMenu.length > 0) {
              getLabels(el.subMenu, el.label[this.lang]);
            }
          });
        }

        getLabels(tree);
      
        return Array.from(new Set(_list.map(JSON.stringify))).map(JSON.parse);
      }
    },
    mounted() {
      this.menuItems = this.getMenuItems(MENU.mainMenuItems);
    }
  }

</script>

<style lang="scss">

  //@import "./../../../scss/includes/functions";
  @use "@/scss/includes/globals";

  .editor-modal {
    position: fixed;
    top: 80px;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, .2);
    z-index: 100;
  }

  .editor-screen {
    position: relative;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 0 10px 10px 10px;
    width: 100%;
    max-width: 768px;
    background-color: globals.$color-white;
    box-shadow: 0 0 10px 0 rgba(0,0,0,.2);
  }

  .editor-screen__title {
    float: left;
    margin-top: 8px;
    font-size: 1.2em;
    color: globals.$color-gray60;
  }

</style>