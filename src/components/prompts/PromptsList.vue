<template>
  <div data-e2e="prompts-list">
    <!-- OH LIST SCREEN -->
    <div class="list-wrapper">
      <div class="list-topbar">
        <div class="list-topbar__content">
          <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
            <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.promptslist.searchtxt" @keyup="filterList()">
          </div>
          <div class="typo-tabletitle">
            {{totalPrompts + " " + $store.state.settings.promptslist.countlabel}}
          </div>
          <div class="grid--push">
            <div class="form-button__secondary form-button__secondary--add grid--push">
              <button type="button" @click="openDetail(-1)">{{ $store.state.settings.promptslist.addprompt }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="list-content-wrapper">
        <div class="list-content--back">
          <div class="list-content--header">
            <ExportListToXLSX
            :data="promptsList"
            :customBtnStyles="exportListBtnStyles"
            :customWrapperStyles="exportListWrapperStyles"
            />
            <div class="list-content__row--header">
              <span class="list-content__row-cell list-content__row-cell--5"></span>
              <span class="list-content__row-cell list-content__row-cell--30" @click="sortColumn('Title', $event)" data-sortorder="NONE" v-html="$store.state.settings.promptslist.collheads[2]"></span>
              <span class="list-content__row-cell list-content__row-cell--10" @click="sortColumn('PromptType', $event)" data-sortorder="NONE" v-html="$store.state.settings.promptslist.collheads[1]"></span>
              <span class="list-content__row-cell list-content__row-cell--25" v-html="$store.state.settings.promptslist.collheads[0]"></span>
              <span class="list-content__row-cell list-content__row-cell--30" @click="sortColumn('Description', $event)" data-sortorder="NONE" v-html="$store.state.settings.promptslist.collheads[3]"></span>
            </div>
          </div>
          <VirtualListViewer class="list-content" rowClasses="list-content__row--virtual list-content__row--clickable" :data="promptsList">
            <template v-slot="{ row, index }">
              <div :class="['list-row', {'list__row--zebra' : index % 2 == 0, 'list-content__row--attention' : hasAttention(row.PromptType, row.Id, row.Indicator)}]" :data-promptId="row.Id" @click="clickedOnRow">
                <span class="list-content__row-cell list-content__row-cell--5 typo--centered">
                  <a v-if="row.PromptFiles[0]?.LanguageCode" class="button__icon button__icon-play--small play-prompt--js" v-html="playerIcon.play" :data-langCode="row.PromptFiles[0].LanguageCode"></a>
                  <span v-else>-</span>
                </span>
                <span class="list-content__row-cell list-content__row-cell--30 edit-prompt--js">{{ row.Title }}</span>
                <span class="list-content__row-cell list-content__row-cell--10 edit-prompt--js" v-html="transformToType(row.PromptType)"></span>
                <span v-if="row.PromptFiles[0]?.LanguageCode" class="list-content__row-cell list-content__row-cell--25 edit-prompt--js">
                  <span v-for="promptfile in row.PromptFiles" :key="promptfile.PromptId + promptfile.LanguageCode" :class="flag(promptfile.LanguageCode)" :data-langCode="promptfile.LanguageCode"></span>
                </span>
                <span v-else class="list-content__row-cell list-content__row-cell--25 edit-prompt--js">-</span>
                <span class="list-content__row-cell list-content__row-cell--30 edit-prompt--js">{{ row.Description }}</span>
              </div>
            </template>
          </VirtualListViewer>
        </div>
      </div>
    </div>

    <!-- PROMPT POPUP -->
    <Prompt-up-loader
      :visible="detailStatus"
      :prompt-id="promptId"
      :prompt-names="promptNames"
      :customerId="customerId"
      @close-prompt="closeDetail"
      @save-prompt="updateList"
      @delete-prompt="deletePrompt"
      @play-prompt="playPrompt"
      @play-bytecode-prompt="playByteCodePrompt"
      @stop-play-prompt="stopAndResetAudio"
    />

  </div>
</template>

<script>
  import PromptUpLoader       from './PromptUpLoader.vue';
  import VirtualListViewer    from './../uielements/VirtualListViewer.vue';
  import {  dynamicSort,
            dynamicSortMultiple }      from '../../use/sortFunctions';
  import { scrollTo }         from './../../use/helperFunctions';
  import {IPCCCConfigurator}  from "../../ipccc/js/configurator";
  import ExportListToXLSX     from '../uielements/ExportListToXLSX.vue';

  const PROMPTTYPE = {
    'Normal'       : 0, // Normale prompt
    'Position'     : 1, // Prompt geeft een positie in de wachtrij aan
    'WaitingTime'  : 2, // Prompt geeft een gemiddelde wachttijd aan (voorlopig niet)
    'Advertention' : 3, // Prompt is een advertentie
    'Chat'         : 4, // Prompt is een chatprompt en bestaat dus uit tekst en is geen verwijzing naar een bestand (voorlopig niet)
    'NotSet'       : 5  // Prompttype is niet ingesteld
  }

  export default {
    name: 'PromptsList',
    data: () => {
      return {
        customerId                  : -1,
        searchStr                   : '',
        sortSetting                 : {},
        rawList                     : [],
        promptsList                 : [],
        totalPrompts                : null,
        playerIcon                  : {
          play                      : '&#xF40A',
          load                      : '&#xF771',
          stop                      : '&#xf4DB'
        },
        promptPlayer                : null,
        targetBtn                   : null,
        currentTargetBtn            : null,
        promptId                    : null,
        currentPlayingPromptId      : null,
        audioIsPlaying              : false,
        detailStatus                : false,
        storeWatch                  : null,
        exportListBtnStyles  : {
            top: '9px',
            right: '8px',
            zIndex: 1
        },
        exportListWrapperStyles : {
            top: '9px',
            right: '8px',
        },
      }
    },
    inject: ['showLoader'],
    components: {
      PromptUpLoader,
      VirtualListViewer,
      ExportListToXLSX
    },
    computed: {
      promptNames() {
        return this.rawList.map(p => { return p.Title });
      },
      flag() {
        return function(langId) {
          return 'play-prompt--js flag flag--inline flag_' + langId;
        }
      }
    },
    methods: {
      hasAttention(type, id, indicator) {
        if(type == 3) return id != indicator;
        else return false;
      },
      getPromptsList(custId) {
          IPCCCConfigurator.Request(custId, 'prompts', 'readall', null, -1).then(result => {
          // this.rawList              = this.removeNonPlayablePrompts(result);
          this.rawList              = result;
          this.promptsList          = [...this.rawList];
          this.totalPrompts         = this.promptsList.length;
          this.defaultSortOrder();
          this.showLoader(false);
        }).catch(error => {
          console.error('Error: ' + error);
          this.showLoader(false);
        });
      },
      // removeNonPlayablePrompts(_promptlist) {
      //   if(_promptlist.length > 0) {
      //     _promptlist.sort(dynamicSortMultiple('Title'));
      //     return _promptlist.filter(prompt => (prompt.PromptFiles.length > 0 && prompt.PromptFiles[0].LanguageCode > 0));
      //   } else {
      //     return [];
      //   }
      // },
      clickedOnRow(evt) {
        let _target    = evt.target,
            _trigger   = [..._target.classList].find(cls => cls.indexOf('--js') != -1),
            _langCode  = (_target.parentElement.getAttribute('data-langCode')) ? _target.parentElement.getAttribute('data-langCode') : (_target.parentElement.parentElement.getAttribute('data-langCode')) ? _target.parentElement.parentElement.getAttribute('data-langCode') : _target.parentElement.parentElement.parentElement.getAttribute('data-langCode'),
            _id        = (_target.parentElement.getAttribute('data-promptId')) ? _target.parentElement.getAttribute('data-promptId') : (_target.parentElement.parentElement.getAttribute('data-promptId')) ? _target.parentElement.parentElement.getAttribute('data-promptId') : _target.parentElement.parentElement.parentElement.getAttribute('data-promptId');

        evt.preventDefault();
        evt.stopPropagation();

        if(_trigger === 'edit-prompt--js') this.openDetail(_id);
        if(_trigger === 'play-prompt--js') this.playPrompt(_target, _id, _langCode);
      },
      openDetail(id) {
        this.promptId     = id;
        this.detailStatus = true;
        this.stopAndResetAudio();
      },
      transformToType(value) {
        let _promptType = '';
        switch(value) {
          case PROMPTTYPE.Normal:
            _promptType = this.$store.state.settings.promptslist.prompttypes[0];
            break;
          case PROMPTTYPE.Position:
            _promptType = this.$store.state.settings.promptslist.prompttypes[1];
            break;
          case PROMPTTYPE.WaitingTime:
            _promptType = this.$store.state.settings.promptslist.prompttypes[2];
            break;
          case PROMPTTYPE.Advertention:
            _promptType = this.$store.state.settings.promptslist.prompttypes[3];
            break;
          case PROMPTTYPE.Chat:
            _promptType = this.$store.state.settings.promptslist.prompttypes[4];
            break;
        }
        return _promptType;
      },
      playByteCodePrompt(targetBtn, blob) {

        if(!this.audioIsPlaying) {
          this.setAudioPlayerStatus(targetBtn, 'loading');
          this.promptPlayer.src   = new Audio(blob).src;
          this.currentTargetBtn       = targetBtn;
          this.targetBtn              = targetBtn;
        } else {
          this.setAudioPlayerStatus(this.currentTargetBtn, 'stopped');
          this.promptPlayer.pause();
          if(targetBtn != this.currentTargetBtn) {
            this.setAudioPlayerStatus(targetBtn, 'loading');
            this.promptPlayer.src = new Audio(blob).src;
            this.currentTargetBtn       = targetBtn;
            this.targetBtn              = targetBtn;
          }
        }
      },
      playPrompt(targetBtn, id, langCode, promptfilelocation = '') {
          if (!langCode) {
              langCode = Number(targetBtn.getAttribute('data-langCode'));
          }
        const _playPrompt = id => {
            if(this.currentTargetBtn && targetBtn != this.currentTargetBtn && targetBtn.tagName.toLowerCase === 'a')
            this.setAudioPlayerStatus(this.currentTargetBtn, 'stopped');

          if(!id || id == 'undefined' || promptfilelocation.startsWith('https')) {
            this.currentTargetBtn       = targetBtn;
            this.targetBtn              = targetBtn;
            this.promptPlayer.src       = promptfilelocation;
          } else {
              IPCCCConfigurator.Request(this.customerId, 'prompts', 'playprompt', langCode, id).then(soundUrl => {
                this.currentTargetBtn       = targetBtn;
                this.targetBtn              = targetBtn;
                  this.promptPlayer.src = soundUrl;

              }).catch(error => { //Ongeldige parameters means soundUrl can't be found
                this.setAudioPlayerStatus(targetBtn, 'stopped');
                console.error('Error: ', error);
              }
            );
          }
        };

        if(!this.audioIsPlaying) {
          if(targetBtn.tagName.toLowerCase() === 'a')
            this.setAudioPlayerStatus(targetBtn, 'loading');
          else
            this.audioIsPlaying = true;

          _playPrompt(id);
        } else {
          this.promptPlayer.pause();
          this.audioIsPlaying = false;
          if(targetBtn.tagName.toLowerCase() === 'a')
            this.setAudioPlayerStatus(targetBtn, 'stopped');

          if(targetBtn != this.currentTargetBtn && targetBtn.tagName.toLowerCase() !== 'a')
            _playPrompt(id);
        }
      },
      setAudioPlayerStatus(target, status) {
        if(target.tagName.toLowerCase() === 'a') {//A IS PLAYBUTTON, SPAN IS FLAG
          switch (status) {
            case 'stopped':
              target.innerHTML = this.playerIcon.play;
              target.classList.remove('status--loading');
              this.audioIsPlaying = false;
              break;
            case 'loading':
              target.innerHTML = this.playerIcon.load;
              target.classList.add('status--loading');
              this.audioIsPlaying = true;
              break;
            case 'playing':
              target.innerHTML = this.playerIcon.stop;
              target.classList.remove('status--loading');
              this.audioIsPlaying = true;
              break;
          }
        }
      },
      stopAndResetAudio() {
        if(this.currentTargetBtn != null) {
          this.promptPlayer.pause();
          this.setAudioPlayerStatus(this.currentTargetBtn, 'stopped');
          this.audioIsPlaying = false;
        }
      },
      //=========================================================== START DISPLAY LIST METHODS
      closeDetail() {
        this.detailStatus = false;
        this.stopAndResetAudio();
      },
      deletePrompt(prompt) {
        this.stopAndResetAudio();
        this.detailStatus  = false;
        let _indexToDelete = this.rawList.findIndex(_prompt => _prompt.Id === prompt.Id);
        this.rawList.splice(_indexToDelete, 1);
        this.promptsList   = [...this.rawList];
        this.filterList();
        this.showLoader(false);
      },
      updateList(prompt) {
        this.stopAndResetAudio();
        let _indexToSave = -1;
        this.totalPrompts = 0;
        this.rawList.map((_prompt, index) => {
          if(_prompt.Id == prompt.Id) {
            _indexToSave = index;
          }
        });
        if(_indexToSave == -1)
          this.rawList.push(prompt);
        else
          this.rawList[_indexToSave] = prompt;

        this.promptsList  = [...this.rawList];
        this.totalPrompts = this.promptsList.length;

        this.filterList();
        if(this.promptsList.findIndex(_prompt => _prompt.Id === prompt.Id) != -1) {
          setTimeout(() => {
            this.setHighlightedRow(prompt.Id);
          }, 500);
        }
        this.detailStatus = false;
        this.showLoader(false);
      },
      filterList() {
        this.promptsList  = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
        this.totalPrompts = this.promptsList.length;
        this.sortColumn();
      },
      filterListOnString(list, str) {
        if(str != '') {
          let _rawList = [...list],
              _keys;
          return _rawList.filter(item => {
            _keys = item['Title'].toLowerCase().indexOf(str) != -1
            return _keys;
          });
        } else {
          return [...list];
        }
      },
      defaultSortOrder() {
        this.sortSetting.order = 'NONE';
        this.sortSetting.key = 'Title';
        this.sortColumn(this.sortSetting.key);
      },
      sortColumn(key, e = null) {
        //Filter because the other types cannot be used propperly -> for future release
        this.promptsList  = this.promptsList.filter(prompt => prompt.PromptType == PROMPTTYPE.Normal || prompt.PromptType == PROMPTTYPE.Advertention);

        let _order,
            _t;

        if(e != null) {
          _t     = e.target;
          _order = _t.getAttribute('data-sortOrder');
          document.querySelectorAll('.list-content__row--header > span').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
          this.sortSetting = {
            'key': key,
            'order' : _order
          }
          this.setHighlightedRow(-2);
        } else {
          _order = this.sortSetting.order;
          key    = this.sortSetting.key;
        }

        switch(_order) {
          case 'NONE':
            this.promptsList.sort(dynamicSort(key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'ASC');
            break;
          case 'ASC':
            this.promptsList.sort(dynamicSort('-' + key));
            if(e != null)
              _t.setAttribute('data-sortOrder', 'DES');
            break;
          case 'DES':
            this.promptsList = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
            this.totalPrompts = this.promptsList.length;
            if(e != null)
              _t.setAttribute('data-sortOrder', 'NONE');
            break;
        }
      },
      setHighlightedRow(id) {
        let _wrapper = null;
        document.querySelectorAll('[data-promptId]').forEach(el => {
          _wrapper = el.parentElement.parentElement;
          if (el.getAttribute('data-promptId') == id) {
            el.classList.add('list-content__row--mutated');
            scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
          } else
            el.classList.remove('list-content__row--mutated');
        });
        if(id == -2 && _wrapper !== null)
          scrollTo(_wrapper, 0, 200);
      }
    },
    mounted() {
      this.showLoader(true);
      this.customerId         = this.$store.getters.getCustomerInfo().selectedCustomerId;
      this.promptPlayer       = new Audio();

      this.promptPlayer.addEventListener('loadeddata', _ => {
        this.setAudioPlayerStatus(this.targetBtn, 'playing');
        this.promptPlayer.play();
      });
      this.promptPlayer.addEventListener('error', e => {
        this.setAudioPlayerStatus(this.targetBtn, 'stopped');
        console.error('Error: ', e.target.error.message);
      });
      this.promptPlayer.addEventListener('ended', _ => {
        this.setAudioPlayerStatus(this.targetBtn, 'stopped');
      });

      if(this.customerId !== -1)
        this.getPromptsList(this.customerId);

this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        if(cObj.selectedCustomerId != -1) {
          this.showLoader(true);
          this.customerId = cObj.selectedCustomerId;
          this.getPromptsList(this.customerId);
        }
      });
    },
    beforeUnmount() {
      this.storeWatch();
      this.stopAndResetAudio();
    }
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/flags";
  .button__icon.button__icon-play--small.play-prompt--js {
    margin-top: 8px;
  }
</style>
