<template>
  <div class="detailscreen-wrapper detailscreen-wrapper--visable" ref="parentWrapper" data-e2e="help-article-edit">
    <div v-if="hasData" class="detailscreen">
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title">{{ articleData[selectedLanguage].maintitle }}</span>
          <a class="dialog__window-close" @click="closeArticle">
            <span></span>
            <span></span>
          </a>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit-alpha">
          <nav class="langswitch-wrapper">
            <a v-for="lang in languages" :key="lang.code" @click="switchLanguage($event, lang.code)" :data-lang="lang.code" :class="{isactive : lang.code === selectedLanguage}">{{ lang.label }}</a>
          </nav>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--beta">
          <div class="form-textfield form-textfield--bground">
            <input type="text" name="articletitle" id="articletitle" :placeholder="$store.state.settings.helpcenter.articletitlelbl" v-model="articleData[selectedLanguage].maintitle" data-validate="isNotEmpty" :data-message="$store.state.settings.helpcenter.messagearticletitlelbl">
            <label for="articletitle" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.helpcenter.articletitlelbl }}</label>
          </div>
        </div>
        <div class="grid-unit--beta">
          <div class="form-selectfield form-selectfield--inline-bground">
            <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.helpcenter.categorylbl }}</label>
            <select v-model.sync="categoryId">
              <option v-for="cat in categorys" :key="cat.id" :value="cat.id">{{ cat[selectedLanguage] }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit-alpha">
          <div class="sort-list-header">
            <span>{{ $store.state.settings.helpcenter.videoheader }}</span>
            <button type="button" class="sort-list__button--add" @click="addVideoItem()">{{ $store.state.settings.helpcenter.addvideolbl }}</button>
          </div>
          <ul class="sort-list-wrapper" v-sorter="options" @sortend="updateList($event, 'video')" ref="vidcontainer">
            <li v-for="vid in articleData[selectedLanguage].video" :key="vid.id">
              <span sorterhandle class="sort-list__drag">&#xF1DD;</span>
              <span class="sort-list__coll40">
                <input type="text" :id="'title'+vid.id" :name="'title'+vid.id" v-model="vid.title" :readonly="vid.id !== vidIdToEdit">
              </span>
              <span class="sort-list__coll60">
                <input type="text" :id="'url'+vid.id" :name="'url'+vid.id" v-model="vid.url" :readonly="vid.id !== vidIdToEdit">
              </span>
              <span class="sort-list__controls">
                <a :class="['button__icon button__icon--edit' ,{'button__icon--save' : vid.id === vidIdToEdit}]" @click="editVideoItem(vid.id, 'video')" v-html="setEditIcon(vid.id)"></a>
                <a class="button__icon button__icon--delete" @click="deleteVideoItem(vid.id, 'video')">&#xF1C0;</a>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit-alpha">
          <div class="sort-list-header">
            <span>{{ $store.state.settings.helpcenter.textheader }}</span>
            <button type="button" class="sort-list__button--add" @click="addText()">{{ $store.state.settings.helpcenter.addtextlbl }}</button>
          </div>
          <ul class="sort-list-wrapper" v-sorter="options" @sortend="updateList($event, 'articles')" ref="articlecontainer">
            <li v-for="article in articleData[selectedLanguage].articles" :key="article.id">
              <span sorterhandle class="sort-list__drag">&#xF1DD;</span>
              <span class="sort-list__coll40">{{ article.title }}</span>
              <span class="sort-list__coll60">{{ decodeStr(article.body) }}</span>
              <span class="sort-list__controls">
                <a class="button__icon button__icon--edit" @click="editText(article.id)">&#xF3EB;</a>
                <a class="button__icon button__icon--delete" @click="deleteText(article.id)">&#xF1C0;</a>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit-alpha">
          <div class="sort-list-header">
            <span>{{ $store.state.settings.helpcenter.settingsheader }}</span>
          </div>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--beta">
          <div class="form-selectfield form-selectfield--inline-bground">
            <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.helpcenter.modulelbl }}</label>
            <select v-model="articleData.module">
              <option value="0">{{ $store.state.settings.helpcenter.defaultmodulelbl }}</option>
              <option v-for="cat in categorys" :key="cat.id" :value="cat.id">{{ cat[selectedLanguage] }}</option>
            </select>
          </div>

          <label class="form-label ui__csl-label">{{ $store.state.settings.helpcenter.tagslbl }}</label>
          <div class="ui__csl" v-csl="cslOptions" @listupdate="updateTags($event)">
            <input type="text" id="csl" name="csl" v-model="articleData[selectedLanguage].tags">
          </div>

        </div>
        <div class="grid-unit--beta">

          <div class="form-togglefield form-togglefield--mod">
            <input type="checkbox" name="published" id="published" v-model="articleData.published">
            <label for="published">
              <span class="label-inline">{{ $store.state.settings.helpcenter.publishedlbl }}</span>
            </label>
          </div>
          <label class="sort-list-header sort-list-header--label">
            <span>{{ $store.state.settings.helpcenter.relatedlbl }}</span>
            <button type="button" class="sort-list__button--add grid-push" @click="addRelated()">{{ $store.state.settings.helpcenter.addrelatedlbl }}</button>
          </label>
          <ul class="sort-list-wrapper" v-sorter="options" @sortend="updateList($event, 'related')">
            <li v-for="related in articleData[selectedLanguage].related" :key="related.artId">
              <span sorterhandle class="sort-list__drag">&#xF1DD;</span>
              <span class="sort-list__coll95">{{ related.label }}</span>
              <span class="sort-list__controls sort-list__controls--mod">
                <a class="button__icon button__icon--delete" @click="deleteRelated(related)">&#xF1C0;</a>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="grid-row">
        <div class="grid-unit--beta">
          <div class="form-selectfield form-selectfield--inline-bground">
            <label class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.helpcenter.rightslbl }}</label>
            <select v-model.sync="selectedRight">
              <option v-for="(right, index) in rightsList" :key="index" :value="right">{{ right }}</option>
            </select>
          </div>
        </div>
        <div class="grid-unit--beta">

        </div>
      </div>

      <div class="detailscreen-footer detailscreen-footer--inside">
        <span>
          <a class="button-primary button-primary--delete" @click="deletArticle">{{ $store.state.settings.helpcenter.deletearticlelbl }}</a>
        </span>
        <span class="grid--push mod--padding-top">
          <a class="button-primary button-primary--gray" @click="closeArticle">{{ $store.state.settings.helpcenter.cancelarticlelbl }}</a>
          <a class="button-primary" @click="saveArticle">{{ $store.state.settings.helpcenter.savearticlelbl }}</a>
        </span>
      </div>

      <TextEditor
        :textdata  ="selectedText"
        :status    ="textstatus"
        :leftpos   ="modalLeft"
        :lang      ="selectedLanguage"
        @onCancel  ="closeText"
        @onSave    ="saveText"
      />

      <SelectPopup
        :data     ="relatedData[selectedLanguage]"
        :status   ="relatedstatus"
        :leftpos  ="modalLeft"
        @onClose  ="closeRelated"
        @onChange ="updateRelated"
      />

    </div>
  </div>
</template>

<script>

  import Axios               from 'axios';
  import { categoryLabels }  from './categorydata';
  import { sortable }        from './../../directives/sortable';
  import { CSList }          from './../../directives/CSList';
  import TextEditor          from './TextEditor.vue';
  import SelectPopup         from './SelectPopup.vue';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';
  import { currentLocalDateTimeISO }  from '../../use/dateFunctions';

  export default {
    name: 'HelparticleEdit',
    props: ['catid', 'dataid', 'color', 'icon', 'articleList', 'selectedright'],
    data: () => {
      return {
        hasData          : false,
        articleData      : {},
        browserLanguage  : 'en',
        languages        : [
          {
            label : 'Nederlands',
            code  : 'nl'
          }, {
            label : 'English',
            code  : 'en'
          }
        ],
        selectedLanguage : 'en',
        categoryId       : -1,
        categorys        : [],
        options          : {'isSortable': true},
        vidIdToEdit      : -1,
        cslOptions       : {
          'minChars'  : 4
        },
        selectedText     : null,
        textstatus       : false,
        modalLeft        : '250px',
        relatedstatus    : false,
        relatedData      : {},
        rightsList       : [],
        selectedRight    : '',
      }
    },
    inject: ['showLoader'],
    directives: {
      Sorter : sortable,
      csl    : CSList
    },
    components: {
      TextEditor,
      SelectPopup
    },
    watch: {
      'dataid' : function(newVal, oldVal) {
        if(oldVal !== newVal) {
          this.hasData       = false;
          this.categoryId    = this.catid;
          this.articleData   = {};
          this.vidIdToEdit   = -1;
          this.selectedRight = this.selectedright;
          if(this.dataid > 0)
            this.getArticle();
        }
      },
      'categoryId' : function(newVal, oldVal) {
        if(oldVal !== newVal) {
          this.$emit('changeCat', newVal);
        }
      }
    },
    methods: {
      setEditIcon(id) {
        return id === this.vidIdToEdit ? '&#xF193' : '&#xF3EB';
      },
      switchLanguage(evt, langcode) {
        [...document.querySelectorAll("[data-lan4g]")].forEach(btn => btn.classList.remove('isactive'));
        evt.target.classList.add('isactive');
        this.selectedLanguage = langcode;
        this.hasData          = false;
        let _cache            = JSON.parse(JSON.stringify(this.articleData));
        setTimeout(() => {
          this.articleData      = JSON.parse(JSON.stringify(_cache));
          this.hasData          = true;
        }, 0);
      },
      getArticle() {
        let _url = `${this.$store.getters.getHelpcentreUrl()}/article_${this.dataid}.json`;
        Axios.get(_url).then(response => {
          this.articleData   = JSON.parse(JSON.stringify(response.data));
          this.hasData       = Object.keys(this.articleData).length > 0;
          this.relatedData   = this.prepareRelatedData(this.articleList);
          this.rightsList    = this.$store.getters.getPermissionList();
          if(!this.hasData) {
            this.closeArticle();
          }
          this.showLoader(false);
        }).catch(error => {
          //if(error.response.status === 404) {
            this.createNew();
          //} else {
          //  this.closeArticle();
          //  console.error(error.response);
          //}
          this.showLoader(false);
        });
      },
      createNew() {
        this.articleData   = {
          	"published": true,
            "nl": {
              "maintitle": "",
              "video": [],
              "articles": [],
              "related": [],
              "tags": []
            },
            "en": {
              "maintitle": "",
              "video": [],
              "articles": [],
              "related": [],
              "tags": []
            },
            "module": 0,
            "score": {
              "negative": 0,
              "positive": 0
            }
        };
        this.hasData       = Object.keys(this.articleData).length > 0;
        this.relatedData   = this.prepareRelatedData(this.articleList);
      },
      closeArticle() {
        this.$emit('atCancel');
      },
      saveArticle() {
        if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] saveArticle: ', this.articleData);
        IPCCCConfigurator.Request(1, "HelpCenter", "save", this.articleData, `article_${this.dataid}.json`).then(succes => {
          console.log(`article_${this.dataid}.json saved`);
          this.$emit('atSave', {
            data   : this.articleData,
            id     : this.dataid,
            rights : this.selectedRight
          });
        }).catch(error => {
          console.error(`article_${this.dataid}.json not saved!`, error);
        });

        // let _file = new Blob([JSON.stringify(this.articleData)], {type: 'text/plain', endings: 'native'}),
        //     _link = document.createElement("a");

        // _link.download = `article_${this.dataid}.json`;

        // if(window.webkitURL != null) {
        //   _link.href          = window.webkitURL.createObjectURL(_file);
        // } else {
        //   _link.href          = window.URL.createObjectURL(_file);
        //   _link.style.display = "none";
        //   document.body.appendChild(_link);
        // }
        // _link.click();
        // this.$emit('atSave', {
        //   data   : this.articleData,
        //   id     : this.dataid,
        //   rights : this.selectedRight
        // });
      },
      deletArticle() {
        IPCCCConfigurator.Request(1, "HelpCenter", "delete",  this.articleData, `article_${this.dataid}.json`).then(succes => {
        //   console.log(`article_${this.dataid}.json deleted`);
          this.$emit('atDelete', this.dataid);
        }).catch(error => {
          console.error(`article_${this.dataid}.json not deleted!`, error);
        })
      },
      decodeStr(str) {
        return unescape(str).replace(/<[^>]*>?/gm, '');
      },
      updateList(evt, listprop) {
        this.articleData[this.selectedLanguage][listprop].splice(parseInt(evt.detail.newIndex), 0, this.articleData[this.selectedLanguage][listprop].splice(parseInt(evt.detail.oldIndex), 1)[0]);
      },
      addVideoItem() {
        let _id = this.nextId('video');
        let _newVid = {
          id    : _id,
          title : "",
          url   : ""
        }
        this.articleData[this.selectedLanguage].video.push(_newVid);
        setTimeout(() => {
          this.options.isSortable           = false;
          this.vidIdToEdit                  = _id;
          this.$refs.vidcontainer.scrollTop = this.$refs.vidcontainer.scrollHeight;
        }, 100);
      },
      editVideoItem(id, type) {
        if(this.vidIdToEdit !== id) {
          this.options.isSortable = false;
          this.vidIdToEdit        = id;
        } else {
          this.options.isSortable = true;
          this.vidIdToEdit        = -1;
        }
      },
      deleteVideoItem(id) {
        this.options.isSortable = true;
        let _indexToDelete      = this.articleData[this.selectedLanguage].video.findIndex(v => parseInt(v.id) === parseInt(id));
        this.articleData[this.selectedLanguage].video.splice(_indexToDelete, 1);
        this.options.isSortable = false;
      },
      addText(id) {
        this.modalLeft    = this.$refs.parentWrapper.getBoundingClientRect().x + 'px';
        let _id = this.nextId('articles');
        this.selectedText = {
          body        : "",
          id          : _id,
          image       : "",
          imagepos    : "left",
          linklabel   : "",
          linkmodule  : "",
          title       : ""
        };
        this.articleData[this.selectedLanguage].articles.push(this.selectedText);
        setTimeout(() => {
          this.options.isSortable           = false;
          this.$refs.articlecontainer.scrollTop = this.$refs.articlecontainer.scrollHeight;
        }, 100);

        this.textstatus   = true;
      },
      editText(id) {
        this.modalLeft    = this.$refs.parentWrapper.getBoundingClientRect().x + 'px';
        this.selectedText = this.articleData[this.selectedLanguage].articles.find(text => parseInt(text.id) === parseInt(id));
        this.textstatus   = true;
      },
      saveText(evt) {
        let _indexToReplace = this.articleData[this.selectedLanguage].articles.findIndex(article => parseInt(article.id) === parseInt(evt.id));
        this.articleData[this.selectedLanguage].articles.splice(_indexToReplace, 1, evt);
        this.textstatus         = false;
        this.selectedText       = null;
        this.options.isSortable = true;
      },
      deleteText(id) {
        let _indexToDelete = this.articleData[this.selectedLanguage].articles.findIndex(article => parseInt(article.id) === parseInt(id));
        this.articleData[this.selectedLanguage].articles.splice(_indexToDelete, 1);
      },
      closeText() {
        this.textstatus         = false;
        this.selectedText       = null;
        this.options.isSortable = true;
      },
      updateTags(evt) {
        this.articleData[this.selectedLanguage].tags = evt.detail.list.split(',');
      },
      prepareRelatedData(list) {

        const removeSelected = (list, articleData, lang) => {
          const reducer = (accList, article) => {
            let _index = articleData[lang].related.findIndex(relatedArticle => article[lang].catId === relatedArticle.catId && article[lang].artId === relatedArticle.artId && article[lang].label === relatedArticle.label);

            if(_index === -1) {
              accList = [...accList, {
                value : `${article[lang].catId},${article[lang].artId}`,
                label : article[lang].label
              }];
            }
            return accList;
          };
          let _result               = list.reduce(reducer, []),
              _selectedArticleIndex = _result.findIndex(article => `${this.catid},${this.dataid}` === article.value && this.articleData[lang].maintitle === article.label);

          _result.splice(_selectedArticleIndex, 1);
          return _result;
        }

        return {
          nl : removeSelected(list, this.articleData, 'nl'),
          en : removeSelected(list, this.articleData, 'en')
        };
      },
      addRelated() {
        this.modalLeft     = this.$refs.parentWrapper.getBoundingClientRect().x + 'px';

        this.relatedstatus = true;
      },
      deleteRelated(relatedItem) {
        this.relatedData[this.selectedLanguage].push({
          value : `${relatedItem.catId},${relatedItem.artId}`,
          label : relatedItem.label
        });
        let _indexToDelete = this.relatedData[this.selectedLanguage].findIndex(i => i.artId == relatedItem.artId && i.catId == relatedItem.catId && i.label == relatedItem.label);
        this.articleData[this.selectedLanguage].related.splice(_indexToDelete, 1);
      },
      updateRelated(item) {
        let _relatedItem = {
          catId : parseInt(item.value.split(',')[0]),
          artId : parseInt(item.value.split(',')[1]),
          label : item.label
        }
        this.articleData[this.selectedLanguage].related.push(_relatedItem);
        let _indexToDelete = this.relatedData[this.selectedLanguage].findIndex(i => i.value == item.value && i.label == item.label);
        this.relatedData[this.selectedLanguage].splice(_indexToDelete, 1);
      },
      closeRelated() {
        this.relatedstatus = false;
      },

      /////////////////////////////////////////TEMP
      nextId(listprop) {
        let _highestId = 0;
        this.articleData[this.selectedLanguage][listprop].forEach(item => {
          _highestId = item.id > _highestId ? item.id : _highestId;
        });
        return _highestId + 1;
      }
    },
    updated() {
      this.browserLanguage    = this.$store.getters.getLang();
    },
    mounted() {
      this.browserLanguage    = this.$store.getters.getLang();
      this.selectedLanguage   = this.browserLanguage;
      this.categorys          = [...categoryLabels.categories];
      this.options.isSortable = true;
      this.vidIdToEdit        = -1;

    },
    beforeUnmount() {
      this.textstatus   = false;
      this.selectedText = null;
    }
  }

</script>

<style lang="scss" scoped>

  @use "@/scss/includes/globals";

  .detailscreen-wrapper {
    z-index: 500;
    .detailscreen {
      width: 100%;
      max-width: 900px;
      min-height: 400px;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      padding-bottom: 40px;
    }
  }

  .langswitch-wrapper {
    position: relative;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: left;
    align-items: left;
    width: 100%;
    padding: 0;
    font-family: 'Abel', sans-serif;
    font-size: 1em;
    border-bottom: 1px solid globals.$color-gray20;
    a {
      position: relative;
      height: 40px;
      line-height: 40px;
      padding: 0 7px;
      cursor: pointer;
      color: globals.$color-gray20;
    }
    a.isactive {
      color: globals.$color-gray80;
      &:after {
        content: '';
        position: absolute;
        top: calc(100% - 1px);
        right: -1px;
        bottom: -2px;
        left: -1px;
        background-color: globals.$color-helpcenter;
        z-index: 10;
      }
    }
  }

  .sort-list-header {
    font-weight: bold;
    color: globals.$color-gray60;
    margin-top: -6px;
    height: 40px;
    line-height: 31px;
    padding: 6px 0 0 0;
    border-bottom: 1px solid globals.$color-gray30;
    &--label {
      font-weight: normal;
      border-bottom: none;
      color: globals.$color-gray35;
      font-family: 'Open Sans SemiBold', sans-serif;
      font-size: .7rem;
    }
  }

  .sort-list__button--add {
    font-weight: bold;
    float: right;
    background-color: transparent;
    vertical-align: middle;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    &:after {
      content: '\F419';
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 1.4em;
      color: globals.$color-secondary;
      padding: 0 0 0 5px;
      vertical-align: middle;
    }
  }

  .sort-list-wrapper {
    float: left;
    margin-top: -7px;
    width: 100%;
    list-style-type: none;
    height: 151px;
    border: 1px solid;
    border-color: transparent globals.$color-gray10 globals.$color-gray10 globals.$color-gray10;
    overflow-y: scroll;
  }

  .sort-list-wrapper li {
    height: 35px;
    font-size: .9em;
    color: globals.$color-gray60;
    &:nth-child(even) {
      background-color: globals.$color-gray2;
    }
    span {
      display: inline-block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  .sort-list__drag {
    width: 15px;
    font-family: 'Material Design Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 1.2em;
    color: globals.$color-gray40;
    height: 35px;
    line-height: 35px;
  }

  .sort-list__coll40 {
    width: calc(40% - 60px);
  }

  .sort-list__coll60 {
    width: calc(60% - 60px);
    input {
      height: 25px;
      width: 100%;
    }
  }

  .sort-list__coll95 {
    width: calc(95% - 60px);
  }

  .sort-list__coll40,
  .sort-list__coll60,
  .sort-list__coll95 {
    line-height: 35px;
    input {
      height: 25px;
      width: 100%;
      vertical-align: middle;
      color: globals.$color-gray80;
      border-radius: 2px;
      border: 1px solid globals.$color-helpcenter;
      background-color: globals.$color-white;
      padding: 0 3px;
      &:read-only {
        border: none;
        color: globals.$color-gray60;
        background-color: transparent;
        cursor: default;
      }
    }
  }

  .sort-list__controls {
    width: 85px;
    a {
      width: 29px;
      height: 29px;
      line-height: 29px;
      margin: 3px;
    }
    &--mod {
      width: 45px;
    }
  }

  .button__icon--save {
    color: globals.$color-green;
  }

  .form-togglefield--mod {
    padding: 10px 0;
    margin-bottom: 15px;

    .label-inline {
      height: 20px;
      line-height: 20px;
      padding-left: 50px;
      font-weight: normal;
      border-bottom: none;
      color: globals.$color-gray60;
      font-family: 'Open Sans SemiBold', sans-serif;
      font-size: .9rem;
    }
  }


</style>