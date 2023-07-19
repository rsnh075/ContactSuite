<template>
  <div data-e2e="help-center-management">

    <HelparticleEdit v-show="selectedArticleId !== -2"
      :catid="selectedCatId"
      :dataid="selectedArticleId"
      :color="selectedArticleColor"
      :icon="selectedArticleIcon"
      :articleList="articleList"
      :selectedright="selectedRight"
      @changeCat="categorySelected"
      @atSave="articleIsSaved"
      @atDelete="articleIsDeleted"
      @atCancel="articleIsClosed"
    />

    <!-- LIST SCREEN -->
    <div class="list-wrapper list-wrapper--mod">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="list-topbar__select">
            <Selectbox ref="catSelector"
              :options="categorylbls"
              :selectedvalue="selectedCatId"
              :defaultlabel="$store.state.settings.helpcenter.defaultselectedCat"
              :labelproperty="browserLanguage"
              valueproperty="id"
              iconproperty="iconcode"
              iconcolorproperty="color"
              iconsize="1.4em"
              selectedlabel="selectedCatId"
              @change="categorySelected"
            />
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button type="button" @click="addHelpDocument()">{{ $store.state.settings.helpcenter.adddocumentlbl }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper" ref="listContentWrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--7"  @click="sortColumn('published', $event)" data-sortorder="NONE"></span>
              <span class="list-content__row-cell list-content__row-cell--30">{{ $store.state.settings.helpcenter.listlabels[1] }}</span>
              <span class="list-content__row-cell list-content__row-cell--55" @click="sortColumn('title', $event)" data-sortorder="title">{{ $store.state.settings.helpcenter.listlabels[2] }}</span>
              <span class="list-content__row-cell list-content__row-cell--10" @click="sortColumn('thescore', $event)" data-sortorder="NONE">{{ $store.state.settings.helpcenter.listlabels[3] }}</span>
            </div>
          </div>
          <div class="list-content">
            <ol v-if="selectedList.length > 0" @click="editArticle($event)">
              <li v-for="article in selectedList" :key="article.id" class="list-content__row list-content__row--hover-action article--js" :data-id="article.id">
                <span class="list-content__row-cell list-content__row-cell--7 list-content__row-cell--icon child--js" v-html="setIcon(article.published)"></span>
                <span class="list-content__row-cell list-content__row-cell--30 child--js" v-html="getCategory(article.id)"></span>
                <span class="list-content__row-cell list-content__row-cell--55 child--js" v-html="article.title[browserLanguage]"></span>
                <span :class="['list-content__row-cell list-content__row-cell--10 list-content__row-cell--score child--js', {'list-content__row-cell--negative' : article.thescore < 0}]" v-html="article.thescore + '%'"></span>

              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import Selectbox              from './../uielements/SelectBox.vue';
  import Axios                  from 'axios';
  import { categoryLabels }     from './categorydata';
  import HelparticleEdit        from './HelparticleEdit.vue';
  import { dynamicSort }      from '../../use/sortFunctions';
  import { IPCCCData } from './../../ipccc/js/data';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';

  export default {
    name: 'HelpcenterManagement',
    data: () => {
      return {
        browserLanguage      : 'nl',
        categorylbls         : [],
        categories           : [],
        selectedCatId        : null,
        selCatHasArt         : false,
        selectedListUnordred : [],
        selectedList         : [],
        selectedArticleId    : -2,
        selectedRight        : '',
        selectedArticleColor : '#CCCCCC',
        selectedArticleIcon  : '&#xF625',
        sortSetting          : {},
        articleList          : [],
        rankingList          : [],
      }
    },
    inject: ['showLoader'],
    components: {
      HelparticleEdit,
      Selectbox
    },
    methods: {
      setIcon(status) {
        return status ? '' : '&#xF209';
      },
      getCategory() {
        return this.categorylbls.find(cat => parseInt(cat.id) === parseInt(this.selectedCatId))[this.browserLanguage];
      },
      editArticle(evt) {
        let _target   = evt.target,
            _trigger  = [..._target.classList].find(cls => cls.indexOf('--js') != -1);

        if(_trigger === 'child--js') {
          _target       = evt.target.parentElement,
          _trigger      = [..._target.classList].find(cls => cls.indexOf('--js') != -1);
        }

        switch(_trigger) {
          case 'article--js':
            this.openArticle(_target.getAttribute('data-id'));
            break;
        }
      },
      openArticle(id) {
        let _cat       = this.categorylbls.find(cat => parseInt(cat.id) === parseInt(this.selectedCatId)),
            _catIndex  = this.categories.findIndex(cat => parseInt(cat.id) === parseInt(this.selectedCatId))
        this.selectedArticleColor = _cat.color;
        this.selectedArticleIcon  = '&#x' + _cat.iconcode;
        this.selectedArticleId    = id;
        this.selectedArticleIndex = this.categories[_catIndex].articles.findIndex(article => parseInt(article.id) === parseInt(id));
        this.selectedRight        = this.categories[_catIndex].articles[this.selectedArticleIndex].rights[0];
      },
      articleIsSaved(evt) {
        //UPDATE LIST AND SAVE IT
        let _changedArticleIndex = this.selectedListUnordred.findIndex(article => parseInt(article.id) === parseInt(evt.id)),
            _foundIdInList       = _changedArticleIndex != -1 ? this.selectedListUnordred[_changedArticleIndex].id : -1;

        if(_foundIdInList == this.selectedArticleId) { //UPDATE RECORD
          let _catIndex  = this.categories.findIndex(cat => parseInt(cat.id) === parseInt(this.selectedCatId))

          this.categories[_catIndex].articles[_changedArticleIndex].title.nl  = evt.data.nl.maintitle;
          this.categories[_catIndex].articles[_changedArticleIndex].title.en  = evt.data.en.maintitle;
          this.categories[_catIndex].articles[_changedArticleIndex].score     = {...evt.data.score};
          this.categories[_catIndex].articles[_changedArticleIndex].published = evt.data.published;
          this.categories[_catIndex].articles[_changedArticleIndex].tags.nl   = [...evt.data.nl.tags];
          this.categories[_catIndex].articles[_changedArticleIndex].tags.en   = [...evt.data.en.tags];
          this.categories[_catIndex].articles[_changedArticleIndex].rights    = [evt.rights];
          this.saveCategoriesFile();
          this.articleIsClosed();

        } else { //NIEUW RECODR
          let _catIndex  = this.categories.findIndex(cat => parseInt(cat.id) === parseInt(this.selectedCatId))

          this.categories[_catIndex].articles.push({
            id: evt.id,
            title: {
              nl: evt.data.nl.maintitle,
              en: evt.data.en.maintitle
            },
            score: {...evt.data.score},
            tags: {
              nl: [...evt.data.nl.tags],
              en: [...evt.data.en.tags]
            },
            published: true,
            rights: [evt.rights]
          });

          this.saveCategoriesFile();
          this.articleIsClosed();
        }

      },
      articleIsDeleted(id) {
        let _currentcatIndex  = this.categories.findIndex(c => parseInt(c.id) == parseInt(this.selectedCatId)),
            _indexToDelete    = this.categories[_currentcatIndex].articles.findIndex(a => parseInt(a.id) == parseInt(id));

        this.categories[_currentcatIndex].articles.splice(_indexToDelete, 1);
        this.categorySelected(this.selectedCatId);
        this.saveCategoriesFile();
        this.articleIsClosed();
      },
      saveCategoriesFile() {
        // let _content = JSON.stringify({categories : this.categories, mostread: [{title: "", body: "", categoryId: -1, id: -1}]});
        let _content = {categories : this.categories, mostread: [{title: "", body: "", categoryId: -1, id: -1}]};
        IPCCCConfigurator.Request(1, "HelpCenter", "save",  _content, "listdata.json").then(succes => {
          console.log('listdata.json saved');
          this.categorySelected(this.selectedCatId);
        }).catch(error => {
          console.error('listdata.json not saved');
        });


        // let _file = new Blob([JSON.stringify({categories : this.categories, mostread: [{title: "", body: "", categoryId: -1, id: -1}]})], {type: 'text/plain', endings: 'native'}),
        //     _link = document.createElement("a");
        //     _link.download = 'listdata.json';

        // if(window.webkitURL != null) {
        //   _link.href          = window.webkitURL.createObjectURL(_file);
        // } else {
        //   _link.href          = window.URL.createObjectURL(_file);
        //   _link.style.display = "none";
        //   document.body.appendChild(_link);
        // }
        // _link.click();
      },
      articleIsClosed() {
        this.selectedArticleId    = -2;
        this.selectedArticleColor = '#CCCCCC';
        this.selectedArticleIcon  = '&#xF625';
      },
      addHelpDocument() {
        let _cat = this.categorylbls.find(cat => parseInt(cat.id) === parseInt(this.selectedCatId));
        this.selectedArticleColor = _cat.color;
        this.selectedArticleIcon  = '&#x' + _cat.iconcode;
        this.selectedArticleId    = this.nextArticleId();
      },
      categorySelected(id) {
        this.selectedCatId = id;
        this.selCatHasArt = this.categories.findIndex(cat => parseInt(cat.id) === parseInt(this.selectedCatId)) != -1;

        if(this.selectedCatId !== null && this.selectedCatId !== "null" && this.selCatHasArt) {
          this.selectedListUnordred = this.categories.filter(cat => parseInt(cat.id) === parseInt(this.selectedCatId))[0].articles;
          this.selectedListUnordred.forEach(article => {
            let _denominator = article.score.positive + article.score.negative,
                _numerator   = article.score.positive >= article.score.negative ? article.score.positive : -article.score.negative;
            article.thescore = _denominator > 0? Math.round((_numerator / _denominator) * 100) : 0;
          });
          this.selectedList         = Array.from(this.selectedListUnordred);
        } else {
          this.selectedListUnordred = [];
          this.selectedList         = [];
        }
      },
      getData() {
        let _url = `${this.$store.getters.getHelpcentreUrl()}/listdata.json`;
        Axios.get(_url)
        .then(response => {
          this.categories     = [...response.data.categories];
          this.categories.forEach(cat => {
            this.rankingList.forEach(article => {
              let index = cat.articles.findIndex(a => +a.id === +article.ArticleId);
              if(index > -1) {
                cat.articles[index].score = {
                  negative : +article.Negative,
                  positive : +article.Positive
                };
              }
            });
          });
          this.categorylbls   = Array.from(categoryLabels.categories);
          this.articleList    = this.categories.reduce((list, cat) => {
            let _catlist = cat.articles.map(art => ({
                nl : {
                  catId : cat.id,
                  artId : art.id,
                  label : art.title.nl
                },
                en : {
                  catId : cat.id,
                  artId : art.id,
                  label : art.title.en
                }
            }));
            return list.concat(_catlist);
          }, []);
          // SET FIRST CATEGORY
          this.categorySelected(this.categorylbls[0].id);
          this.showLoader(false);
          setTimeout(() => {
            this.$refs.catSelector.setCurrentLabel();
          }, 0);
        });
      },
      filterList() {
        // this.orderedList    = this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());
        // this.totalCustomers = this.orderedList.length;
        // this.sortColumn();
      },
      filterListOnString(list, str) {
        // if(str != '') {
        //   let _rawList = [...list];
        //   return _rawList.filter(item => {
        //       if(item['FullName'].toLowerCase().indexOf(str) != -1 ||
        //         item['EmailAddress'].toLowerCase().indexOf(str) != -1 ||
        //         item['roleName'].toLowerCase().indexOf(str) != -1 ||
        //         item['departmentName'].toLowerCase().indexOf(str) != -1) {
        //         return item;
        //       };
        //   });
        // } else {
        //   return [...list];
        // }
      },
      sortColumn(key, e = null) {
        let _order,
            _t;

        if(e != null) {
          _t     = e.target;
          _order = _t.getAttribute('data-sortorder');
          document.querySelectorAll('[data-sortorder]').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
          this.sortSetting = {
            'key'   : key,
            'order' : _order
          }
        } else {
          _order = this.sortSetting.order;
          key    = this.sortSetting.key;
        }

        switch(_order) {
          case 'NONE':
            this.selectedList.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.selectedList.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.selectedList = Array.from(this.selectedListUnordred); //this.filterListOnString(this.unOrderedList, this.searchStr.toLowerCase());

            //this.totalCustomers = this.categories.length;
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },

      /////////////////////////////////////////TEMP
      nextArticleId() {
        let _highestId = 0;
        this.categories.forEach(cat => {
          cat.articles.forEach(article => {
            _highestId = article.id > _highestId ? article.id : _highestId;
          })
        })
        return _highestId + 1;
      }

    },
    updated() {
      this.browserLanguage    = this.$store.getters.getLang();
    },
    mounted() {
      this.browserLanguage    = this.$store.getters.getLang();

      IPCCCData.RequestData('helpcenterscore', { ArticleId: -1, Action: 'list' }).then(list => {
        this.rankingList = [...list];
        this.getData();
      }).catch(error => {
        console.error(error);
        this.getData();
      });
    }
  }
</script>

<style lang="scss">

  @use "@/scss/includes/globals";

  .list-topbar__select {
    width: 340px;
    padding-left: 10px;
  }

  .list-content__row {
    cursor: pointer;
    &:hover {
      background-color: globals.$color-gray5;
    }
  }

  .list-content__row-cell--icon {
    text-align: center;
    font-family: 'Material Design Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 1.4em;
  }

  .list-content__row-cell--score {
    text-align: right;
  }

  .list-content__row-cell--negative {
    color: red;
    font-family: 'Open Sans SemiBold';
    font-style: normal;
    font-weight: 600;
  }

</style>