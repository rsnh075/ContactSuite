<template>
  <div class="detailscreen-wrapper detailscreen-wrapper--visable" data-e2e="help-article">
    <div v-if="hasData" class="detailscreen">
      <div class="grid-row">
        <div class="grid-unit--alpha detailscreen-wrapper__title">
          <span class="detailscreen__title"><span v-html="icon" :style="'color:' + color"></span>{{ articleData[browserLanguage].maintitle }}</span>
          <a class="dialog__window-close" @click="closeArticle">
            <span></span>
            <span></span>
          </a>
        </div>
      </div>
      <div v-if="articleData[browserLanguage].video[selectedVideo] && articleData[browserLanguage].video[selectedVideo].url.length > 0" class="grid-row">
        <div class="grid-unit-alpha">
          <h3 class="video__title">{{ articleData[browserLanguage].video[selectedVideo].title }}</h3>
          <div class="video__player">
            <iframe :src="articleData[browserLanguage].video[selectedVideo].url" frameborder="0" allowfullscreen></iframe>  
          </div>
          <nav class="video__nav">
            <a v-for="(vid, index) in articleData[browserLanguage].video" @click="switchVideo(index)" :class="isactive(index)">{{ vid.title }}</a>
          </nav>
        </div>
      </div>
      <div v-if="articleData[browserLanguage].articles.length > 0">
        <div v-for="article in articleData[browserLanguage].articles" class="grid-row">
          <div class="grid-unit-alpha typo__article" v-html="handleContent(article)"></div>  
        </div>
      </div>  
      <div v-if="articleData[browserLanguage].related.length > 0">
        <div class="grid-row">
          <div class="grid-unit-alpha typo__article">
            <h2 >{{ $store.state.settings.helpcenter.relatedarticle }}</h2>
            <ol>
              <li v-for="link in articleData[browserLanguage].related"><a @click="loadRelated(link.catId, link.artId)">{{ link.label }}</a></li>
            </ol>
          </div>
        </div>
      </div>
      <div class="detailscreen-footer detailscreen-footer--inside">
        
          <span class="ranking">
            <label>{{ $store.state.settings.helpcenter.ratinglbl }}</label>
            <a class="button-ranking--negative" @click="rankIt('-')">&#xF512</a>
            <a class="button-ranking--positive" @click="rankIt('+')">&#xF514</a>
          </span>
          <span class="grid--push mod--padding-top">
            <a class="button-primary button-primary--close" @click="closeArticle">{{ $store.state.settings.helpcenter.closelbl }}</a>
          </span>
        
      </div>  
    </div>
  </div>
</template>

<script>
import Axios   from 'axios';
import { IPCCCConfigurator } from '../../ipccc/js/configurator';
import BoxProps, { ModalType } from '../../types/BoxProps';

  export default {
    name: 'Helparticle',
    props: ['dataid', 'color', 'icon'],
    data: () => {
      return {
        hasData         : false,
        articleData     : {},
        selectedVideo   : 0,
        browserLanguage : 'en',
      }
    },
    inject: ['showLoader', 'showModalDialog'],
    watch: {
      'dataid' : function(oldVal, newVal) {
        if(oldVal !== newVal) {
          this.hasData       = false;
          this.articleData   = {};
          this.selectedVideo = 0;
          this.getArticle();
        }
      }
    },
    methods: {
      handleContent(contentblock) {
        let _html = `<h2>${contentblock.title}</h2>`;
        if(contentblock.image !== '')
          // _html += `<img src="${siteroot}/assets/helpcenter/images/${contentblock.image}" class="img_${contentblock.imagepos}">`;
          _html += `<img src="/assets/helpcenter/images/${contentblock.image}" class="img_${contentblock.imagepos}">`;
        _html += decodeURIComponent(contentblock.body);
        if(contentblock.linkmodule !== '')
          _html += `<a href="#${contentblock.linkmodule}">${this.$store.state.settings.helpcenter.gotolbl}</a>`;

        return _html;
      },
      isactive: function(i) {
        return i === this.selectedVideo ? 'isactive' : '';
      },
      loadRelated(catId, artId) {
        this.$emit('atrelated', catId, artId);
      },
      getArticle() {
        let _guid = '_' + Math.random().toString(32).substring(2, 11),
            _url  = `${this.$store.getters.getHelpcentreUrl()}/article_${this.dataid}.json?${_guid}`;
        Axios.get(_url).then(response => {
          const data = response?.data ?? response;
          Object.assign(this.articleData, this.isJsonString(data) ? JSON.parse(data) : data);
          this.hasData = Object.keys(this.articleData).length > 0;
          if(!this.hasData) {
            this.closeArticle();
          }
          this.showLoader(false);
        }).catch(error => {
          this.showLoader(false);
          this.closeArticle();
          console.error(error);
        });
        
      },
      isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
      },
      closeArticle() {
        this.articleData = {};
        this.$emit('atclose');
      },
      switchVideo(index) {
        this.selectedVideo = index;
      },
      rankIt(val) {
        this.showLoader(true);
        IPCCCConfigurator.RequestData('helpcenterscore', { ArticleId: +this.dataid, Action: val })
        .then(_ => {
          this.showLoader(false);
          this.showModalDialog(new BoxProps(ModalType.Alert, this.$store.state.settings.helpcenter.scoreheader, this.$store.state.settings.helpcenter.scorebody));
        })
        .catch(error => {
          this.showLoader(false);
          console.error(error);
        });
      },
    },
    updated() {
      this.browserLanguage    = this.$store.getters.getLang();
    },
    mounted() {
      this.browserLanguage    = this.$store.getters.getLang();

      this.getArticle();
    }
  }

</script>

<style lang="scss">

  @use "@/scss/includes/functions";
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

  .detailscreen__title span {
    float: left;
    font-family: 'Material Design Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 1.4em;
    padding-right: 8px;
  }

  .video__title {
    font-size: 1em;
    border-bottom: 1px solid globals.$color-gray20;
    margin-bottom: 5px;
    padding-bottom: 3px;
  }

  .video__player {
    position: relative;
    padding-bottom: 56%;
    height: 0; 
    overflow: hidden;
    width: 100%;
    float: left;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.2);
    iframe,
    object,
    embed {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
  }

  .video__nav {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
    border-top: 1px solid globals.$color-gray20;
    border-bottom: 1px solid globals.$color-gray20;
    margin-top: 5px;
    padding: 0 5px;
    font-family: 'Abel', sans-serif;
    font-size: 1em;
    a {
      height: 40px;
      line-height: 40px;
      padding: 0 7px;
      cursor: pointer;
      color: functions.tint(globals.$color-helpcenter, 60%);
    }
    .isactive {
      color: functions.shade(globals.$color-helpcenter, 10%);
    }
  }

  .typo__article {
    position: relative;
    padding-bottom: 3rem !important;
    font-size: .9em;
    line-height: 1.6;
    textarea {
      user-select: auto !important;
    }
    h2 {
      font-size: 1.1em;
      margin-bottom: 1em;
      padding-bottom: .2em;;
      border-bottom: 1px solid globals.$color-gray20;
    }
    .img_left {
      float: left;
      width: 30%;
      margin-right: 20px;
      margin-bottom: .25em;
      margin-top: .2em;
    }
    .img_right {
      float: right;
      width: 30%;
      margin-left: 20px;
      margin-bottom: .25em;
      margin-top: .2em;
    }
    a {
      position: absolute;
      right: 0;
      bottom: 5px;
      display: block;
      color: globals.$color-helpcenter;
      height: 40px;
      line-height: 40px;
      text-decoration: none;
      &:after {
        content: '\F142';
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
      }
    }
    ol {
      column-count: 2;
      column-gap: 20px;
      color: globals.$color-helpcenter;
      li {
        &:before {
          content: '\F44A';
          position: relative;
          display: block;
          float: left;
          font-family: 'Material Design Icons';
          font-weight: normal;
          font-style: normal;
          padding-right: 5px;
          height: 30px;
          line-height: 30px;
          color: globals.$color-gray50;
        }
        a {
          position: relative;
          display: block;
          float: left;
          width: calc(100% - 20px);
          text-decoration: underline;
          height: 30px;
          line-height: 30px;
          bottom: 0;
          cursor: pointer;
          &:after {
            display: none;
          }
          &:hover {
            text-decoration: none;
          }
        }
      }
    }
    ul {
      ul {
        padding-left: 20px;
      }
      li {
        padding-left: 5px;
        ul {
          padding-left: 20px;
        }
      }
    }
  }

  .grid-unit-alpha.typo__article a {
    position: relative;
  }

  .detailscreen-footer--inside {
    padding-left: 10px;
    padding-right: 10px;
  }

  .ranking {
    label {
      height: 45px;
      line-height: 45px;
      font-size: 1em;
      padding-right: 10px;
      display: block;
      float: left;
    }
  }

  .button-ranking--negative,
  .button-ranking--positive {
    display: block;
    float: left;
    width: 45px;
    height: 45px;
    line-height: 45px;
    color: globals.$color-white;
    font-family: 'Material Design Icons';
    font-weight: normal;
    font-style: normal; 
    text-align: center;
    font-size: 1.3em;
    margin-right: 10px;
    background-color: globals.$color-green;
    border-radius: 50%;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,.2);
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    transition: box-shadow .2s;
    &:hover {
      box-shadow: 0 2px 5px 0 rgba(0,0,0,.2);
      background-color: functions.tint(globals.$color-green, 10%);
    }
  }

  .button-ranking--negative {
    color: globals.$color-gray60;
    background-color: globals.$color-gray5;
    &:hover {
      box-shadow: 0 2px 5px 0 rgba(0,0,0,.2);
      background-color: functions.tint(globals.$color-black, 98%);
    }
  }

  .mod--padding-top {
    padding-top: 12px;
  }

  .detailscreen-footer--inside {
    border-top: 1px solid globals.$color-gray20;
  }

</style>