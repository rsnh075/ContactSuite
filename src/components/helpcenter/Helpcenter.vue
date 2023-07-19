<template>
  <div data-e2e="help-center">
    <div class="helpcenter-wrapper" @click="handleSubMenu($event)">
      <div class="helpcenter-top">
        <div class="helpcenter-content">
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <figure class="helpcenter__logo">
                <img src="/assets/images/cs_logo_icon.svg">
                <figcaption>{{ $store.state.settings.helpcenter.title }}</figcaption>
              </figure>
              <div class="grid--push grid--push-300">
                <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                  <input type="text" id="search" v-model="searchStr" class="search--js" :placeholder="$store.state.settings.servicenumbers.searchtxt" @keyup="searchItem()" @focus="searchItem()">
                </div>
              </div>
            </div>
          </div>
          <div class="grid-row">
            <nav class="helpcenter-nav-wrapper" ref="menu">
              <div class="grid-row">
                <div v-for="(mainItem, index) in categories.slice(0,7)" class="helpcenter-nav__item" @mouseover="hoverItem($event, categoryColor(mainItem.id))" @mouseout="hoverOut($event)" :data-index="index"  data-active="0">
                  <i class="helpcenter-nav__item-icon item--js" v-html="placeIcon(mainItem.id)" :data-label="getLabel(mainItem.id)" :data-color="categoryColor(mainItem.id)"></i>
                  <div class="helpcenter-nav__submenu">
                    <h1 :style="'color:' + categoryColor(mainItem.id)">{{ getLabel(mainItem.id) }}</h1>
                    <ol>
                      <li v-for="item in mainItem.articles" class="helpcenter-nav__menu-item link--js" :data-id="item.id">{{ item.title[browserLanguage] }}</li>
                    </ol>
                  </div>  
                </div>
              </div>
              <div class="grid-row">
                <div v-for="(mainItem, index) in categories.slice(7)" class="helpcenter-nav__item" @mouseover="hoverItem($event, categoryColor(mainItem.id))" @mouseout="hoverOut($event)" :data-index="index+7"  data-active="0">
                  <i class="helpcenter-nav__item-icon item--js" v-html="placeIcon(mainItem.id)" :data-label="getLabel(mainItem.id)" :data-color="categoryColor(mainItem.id)"></i>
                  <div class="helpcenter-nav__submenu">
                    <h1 :style="'color:' + categoryColor(mainItem.id)">{{ getLabel(mainItem.id) }}</h1>
                    <ol>
                      <li v-for="item in mainItem.articles" class="helpcenter-nav__menu-item link--js" :data-id="item.id">{{ item.title[browserLanguage] }}</li>
                    </ol>
                  </div>  
                </div>
              </div>
            </nav>
          </div>  
        </div>
      </div>  
      <div class="helpcenter-content--bottom">
         <!--
         <div class="grid-row">
            <div class="grid-unit--alpha">
              <h2>{{ $store.state.settings.helpcenter.articletitle }} </h2>
            </div>
         </div>
         <div class="grid-row">
           <div class="grid-unit--alpha grid-articlewrapper--beta">
             <div v-for="article in mostread" class="article-wrapper">
               <h3><span v-html="placeIcon(article.categoryId)" :style="'color:' + categoryColor(article.categoryId)"></span>{{ article.title }}</h3>
               <p>{{ article.body }}</p>
               <a @click="goToArticle(article.id)" class="readmore--js">{{ $store.state.settings.helpcenter.readmore }}</a>
             </div>
           </div>
         </div>
         -->
      </div>
    </div>

    <Helparticle v-if="articleVisibility"
      :dataid="selectedAricleId" 
      :color="selectedcolor"
      :icon="selectedicon"
      @atclose="closeArticle"
      @atrelated="openArticle"
    />

  </div>
</template>

<script>
  import Axios                  from 'axios';
  import { categoryLabels }     from './categorydata';
  import { calculateMaxHeight } from './../../use/helperFunctions';
  import Helparticle            from './Helparticle.vue';

  export default {
    name: 'Helpcenter',
    data: () => {
      return {
        browserLanguage    : 'nl',
        categories         : [],
        mostread           : [],
        categoryLabels     : [],
        searchStr          : '',
        selectedAricleId   : 1,
        articleVisibility  : false,
        selectedcolor      : '#CCC',
        selectedicon       : '&#xF2EE'
      }
    },
    inject: ['showLoader'],
    components: {
      Helparticle
    },
    methods: {
      getLabel(id) {
        return this.categoryLabels.find(cat => cat.id === id)[this.browserLanguage];
      },
      hoverItem(evt, color) {
        evt.currentTarget.style.color = color;
      },
      hoverOut(evt) {
        evt.currentTarget.style.color = '';
      },
      closeAllSubmenus() {
        [...this.$refs.menu.querySelectorAll('[data-active]')].forEach(item => {
          item.style['margin-bottom']       = '';
          item.children[0].style['color']   = '';
          item.setAttribute('data-active', 0);
          item.classList.remove('helpcenter-nav__item--search');
        });
      },
      handleSubMenu(evt) {
        let _target  = evt.target,
            _trigger = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

        switch(_trigger) {
          case 'item--js':
            this.closeAllSubmenus();
            _target.parentElement.style['margin-bottom'] = calculateMaxHeight(_target.parentElement.children[1]) + 'px';
            _target.style['color']                       = _target.getAttribute('data-color');
            _target.parentElement.setAttribute('data-active', 1);
            break;
          case 'link--js':
            let _aricleId   = parseInt(_target.getAttribute('data-id'));
            //find category corresponding with article
            let _selectedCategoryId = parseInt(_target.parentElement.parentElement.parentElement.getAttribute('data-index')) + 1;
            this.openArticle(_selectedCategoryId, _aricleId);
            break;
          case 'readmore--js':
            ;
            break;
          case 'search--js':
            ;
            break;    
          default:
            this.closeAllSubmenus();
            break;
        }
      },
      openArticle(catId, artId) {
        this.articleVisibility = false;
        this.selectedAricleId   = artId;
        this.selectedcolor      = this.categoryLabels.find(cat => parseInt(cat.id) === parseInt(catId)).color;
        this.selectedicon       = this.placeIcon(parseInt(catId));
        this.showLoader(true);
        this.articleVisibility  = true;
      },
      placeIcon(id) {
        return "&#x" + this.categoryLabels.find(cat => cat.id === id).iconcode;
      },
      categoryColor(id) {
        return this.categoryLabels.find(cat => cat.id === id).color;
      },
      closeArticle() {
        this.articleVisibility = false;
      },
      getData() {
        let _url = `${this.$store.getters.getHelpcentreUrl()}/listdata.json`;
        Axios.get(_url).then(response => {
          this.categoriesRaw      = [...response.data.categories];
          this.mostread           = [...response.data.mostread];
          this.categoryLabels     = [...categoryLabels.categories];
          this.categories         = this.categoriesRaw.reduce((cats, cat) => {
          let _catArticles = cat.articles.reduce((arts, art) => {
                if(art.rights.findIndex(right => this.$store.getters.getPermission(right)) != -1 && art.published) 
                  arts.push(art);
                return arts;
              }, []);
            if(_catArticles.length > 0) cats.push({articles: _catArticles, id: cat.id});
           return cats;
          }, []);
        }).catch(error => {
          console.error(error);
        });
      },
      searchItem() {
        let _searchArr = this.searchStr.toLowerCase().split(' ');
        
        this.categories.forEach((cat, index) => {
          let _mItem = this.$refs.menu.querySelector("[data-index='" + index + "']");
          
          _mItem.style['margin-bottom']       = '';
          _mItem.children[0].style['color']   = '';
          _mItem.setAttribute('data-active', 0);
          _mItem.classList.remove('helpcenter-nav__item--search');

          const check = (s, a) => {
            return a.reduce((cum, curr) => {
              if(s.includes(curr.trim()))
                cum = cum.concat(curr.trim())

              return cum;
            }, []);
          }

          cat.articles.forEach((_article, _index) => {
            let _link        = _mItem.querySelector('OL').children[_index],
                _includesIt  = check(_searchArr, _article.tags[this.browserLanguage]);
            
            if(_includesIt.length !== 0) {
              _mItem.classList.add('helpcenter-nav__item--search');
              _link.classList.add('helpcenter-nav__menu-item--search');
            } else {
              _link.classList.remove('helpcenter-nav__menu-item--search');
            }
          })
        });
      }
    },
    updated() {
      this.browserLanguage    = this.$store.getters.getLang();
    },
    mounted() {
      this.browserLanguage    = this.$store.getters.getLang();

      this.showLoader(false);

      this.getData();

    }
  }
</script>

<style lang="scss">

  @use "@/scss/includes/functions";
  @use "@/scss/includes/globals";

  .helpcenter-wrapper {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #F2F2F2;
  }

  .helpcenter-top {
    background-color: #FAFAFA;
  }

  .helpcenter-content,
  .helpcenter-content--bottom {
    margin-right: auto;
    margin-left: auto;
    width: 100%;
    max-width: 980px;
    padding: 4rem 2rem 2rem 2rem;
  }

  .helpcenter-content--bottom {
    .grid-row .grid-unit--alpha {
      padding-left: calc(1.5rem + 10px);
      padding-right: calc(1.5rem + 10px);
    }
    .grid-articlewrapper--beta {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

    }
  }

  .article-wrapper {
    position: relative;
    width: calc(50% - 15px);
    margin: 15px;
    padding: 20px 25px 40px 25px;
    background-color: globals.$color-white;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,.2);
    color: globals.$color-gray60;
    font-size: .9em;
    line-height: 1.4;
    border-radius: 2px;
    &:nth-child(odd) {
      margin-left: 0;
    }
    &:nth-child(even) {
      margin-right: 0;
    }
    h3 {
      padding-bottom: .5em;
      span {
        display: inline-block;
        vertical-align: middle;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 1.4em;
        padding-right: 10px;
      }
    }
    a {
      position: absolute;
      right: 15px;
      bottom: 10px;
      font-size: .9em;
      text-decoration: underline;
      color: globals.$color-darkblue;
      cursor: pointer;
    }
  }
  
  .helpcenter__logo {
    position: relative;
    float: left;
    height: 80px;
    img {
      float: left;
      height: 80%;
    }
    figcaption {
      float: left;
      height: 80px;
      line-height: 60px;
      padding-left: 10px;
      font-size: 2.2em;
      color: globals.$color-home;
      font-family: 'Open Sans Regular', sans-serif;
    }
  }

  .grid--push-300 {
    width: 320px;
  }

  .helpcenter-nav-wrapper {
    position: relative;
    margin-top: 2.5em;
    margin-right: auto;
    margin-left: auto;
    width: 100%;
    max-width: 980px;
  }

  .helpcenter-nav__item {
    float: left;
    height: 80px;
    width: calc(14.285% - 20px);
    margin: 10px 10px 40px 10px;
    display: block;
    color: globals.$color-gray60;
    cursor: pointer;
    &-icon {
      position: relative;
      float: left;
      width: calc(100% - 30px);
      height: 80px;
      margin: 0 20px;
      padding-top: 10px;
      background-color: transparent;
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
      text-align: center;
      font-size: 2.1em;
      user-select: none;
      border-radius: 4px 4px 0 0;
      &:after {
        content: attr(data-label);
        position: absolute;
        left: -15px;
        top: calc(100% - 20px);
        width: calc(100% + 30px);
        text-align: center;
        font-family: 'Abel', sans-serif;
        font-size: .42em;
        user-select: none;
      }
    }
    &--search .helpcenter-nav__item-icon:before {
      content: '';
      position: absolute;
      left: 50%;
      top: calc(50% - 10px);
      width: 50px;
      height: 50px;
      transform: translate(-50%, -50%);
      background-color: rgba(75,170,240, .2); //globals.$color-helpcenter;
      border: 3px solid globals.$color-menu-active; //globals.$color-warning;
      border-radius: 50%;
      //opacity: .8;
      filter: blur(1px);
    }
  }


  [data-active="1"] {
    .helpcenter-nav__item-icon {
      background-color: globals.$color-white;
      box-shadow: 0 0 3px 0 rgba(0,0,0,.2);
      height: 60px;
      &:before {
        content: '';
        position: absolute;
        width: 100%;
        height: 10px;
        right: 0;
        left: 0;
        bottom: -5px;
        background-color: globals.$color-white;
        z-index: 20;
      }
      &:after {
        display: none;
      }
    }
    .helpcenter-nav__submenu {
      display: block;
    }
  }

  .helpcenter-nav__submenu {
    position: absolute;
    top: 75px;
    left: 15px; //30px;
    width: calc(100% - 20px); //calc(100% - 60px);
    background-color: globals.$color-white;
    display: none;
    padding: 50px 20px 20px 20px;
    z-index: 10;
    box-shadow: 0 0 3px 0 rgba(0,0,0,.2);
    overflow: hidden;
    border-radius: 4px;
    cursor: default;
    h1 {
      position: absolute;
      background-color: globals.$color-white;
      height: 40px;
      line-height: 50px;
      top: 0;
      width: aut0;
      font-family: 'Abel', sans-serif;
      font-size: 1.2em;
      z-index: 10;
      padding-left: 20px;
      left: 0;
    }
  }

  .helpcenter-nav-wrapper {
    div:nth-of-type(n+8) {
      .helpcenter-nav__submenu {
        top: 220px;
      }
    }
  }

  .helpcenter-nav__menu-item {
    position: relative;
    float: left;
    width: 33.333%;
    height: 30px;
    line-height: 30px;
    font-size: .85em;
    padding: 0 10px 0 15px;
    color: globals.$color-gray60;
    cursor: pointer;
    text-overflow: ellipsis;
    overflow: hidden; 
    white-space: nowrap;
    &:hover {
      color: globals.$color-gray90;
      text-decoration: underline;
    }
    &:before {
      content: '\F142';
      position: absolute;
      left: 0;
      font-family: 'Material Design Icons';
      font-weight: normal;
      font-style: normal;
    }
    &--search {
      color: globals.$color-black;
      font-family: 'Open Sans SemiBold', sans-serif;
    }
  }

</style>