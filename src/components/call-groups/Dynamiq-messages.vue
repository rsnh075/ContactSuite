<template>
  <div data-e2e="dynamiq-messages">
    <div class="grid-row">
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground">
          <input :readonly="isreadonly" type="text" name="queueMaxWaiting" id="queueMaxWaiting" v-model="queuedetail.QueueLength" :data-validate="setValidation('isNotEmpty')" :data-message="$store.state.settings.dynamiq.validatemaxwaiting" @keydown="checkIsNumber($event, 'QueueLength')">
          <label for="queueMaxWaiting" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formmaxwaiting }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextmaxwaiting }}</div>
        </div>
      </div>
      <div class="grid-unit--beta"></div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.dynamiq.formturnindicatorlbl }}</label>
        <div class="form-checkbox form-checkbox--large">
          <input :disabled="isreadonly" type="checkbox" name="turnindicator" id="turnindicator" v-model="queuedetail.TurnIndicator">
          <label for="turnindicator">{{ $store.state.settings.dynamiq.formturnindicatorlbl01 }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextturnindicator }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.dynamiq.formsecunit}">
          <input :readonly="isreadonly || turnIndicatorIsNotActive" type="text" name="turnIndicatorInterval" :placeholder="$store.state.settings.dynamiq.formturnindicatorinterval" v-model="queuedetail.TurnIndicatorInterval" :data-validate="setValidation(turnIndicatorValidation)" :data-message="$store.state.settings.dynamiq.validateturnindicatorinterval" @keydown="checkIsNumber($event, 'TurnIndicatorInterval')">
          <label for="turnIndicatorInterval" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formturnindicatorinterval }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextturnindicatorinterval }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.dynamiq.advertisementtxt }}</h2>
    </div>
    <div class="grid-row">
      <div class="grid-unit--beta">
        <label class="form-label form-label--list-inline">{{ $store.state.settings.dynamiq.formadsactivelbltop }}</label>
        <div class="form-checkbox form-checkbox--large">
          <input :disabled="isreadonly" type="checkbox" name="adsActive" id="adsActive" v-model="queuedetail.Advertisements">
          <label for="adsActive">{{ $store.state.settings.dynamiq.formadsactivelbl }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextadsactive }}</div>
        </div>
      </div>
      <div class="grid-unit--beta">
        <div class="form-textfield form-textfield--bground" v-unitslabel="{'label' : $store.state.settings.dynamiq.formsecunit}">
          <input :readonly="isreadonly || adsIsNotActive" type="text" name="Interval" :placeholder="$store.state.settings.dynamiq.formadsinterval" v-model="queuedetail.AdvertisementInterval" :data-validate="setValidation('isNotEmpty')" :data-message="$store.state.settings.dynamiq.validateadsinterval" @keydown="checkIsNumber($event, 'AdvertisementInterval')">
          <label for="adsInterval" class="form-label form-label--hidden">{{ $store.state.settings.dynamiq.formadsinterval }}</label>
          <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextadsinterval }}</div>
        </div>
      </div>
    </div>
    <div class="grid-row">
      <div class="grid-unit--alpha">
        <div class="list-number-header list-number-header--comp-scrollbar">
          <span class="list-number-header__field list-number-header__field--60width list-number-header__field--drag">{{ $store.state.settings.dynamiq.addlistheader[0] }}</span>
          <!--<span class="list-number-header__field list-number-header__field--25width">{{ $store.state.settings.dynamiq.addlistheader[1] }}</span>-->
          <button type="button" @click="addAd()" :class="['list-number-header__button--add', {'list-number-header__button--add--disabled' : adsIsNotActive}]">{{ $store.state.settings.dynamiq.addad }}</button>
        </div>
        <ul class="list-number-wrapper" v-sorter="sortoptions" @sortend="reorderLines($event)">
          <li v-for="(prompt, index) in queuedetail.AdvertisementPrompts" :key="prompt.Id" class="list-items__row list-items__row-ads list-mixed-line" :data-promptid="prompt.Id">
            <span sorterhandle class="sort-list__drag scriptmodule__icon">&#xF1DD;</span>
            <div class="list-mixed-line__cell--60width">
              <select class="list-mixed-line__select list-mixed-line__select--ads" v-model="prompt.Name" @change="changePrompt($event, index, prompt.Name)" disabled="disabled">
                <option value="" selecte>{{ $store.state.settings.dynamiq.formselectadsdefault }}</option>
                <option v-for="prompt in removeNonPlayablePrompts" :key="prompt.Id" :value="prompt.Title" :disabled="disbaledOption(prompt.Id, prompt.Indicator)">{{ prompt.Title }}</option>
              </select>
              <a class="button__icon button__icon-play--small" :class="{'button__icon--disabled' : isreadonly || hasNoPrompt(prompt.Name)}" @click="playPrompt($event, prompt.Name, index)" v-html="playerIcon.play"></a>
              <a class="button__icon button__icon-edit--small" :class="{'button__icon--disabled' : isreadonly || hasNoPrompt(prompt.Name)}" @click="editPrompt(index, prompt.Name)">&#xF3EB;</a>
              <a class="button__icon button__icon-upload--small" @click="addPrompt(index)">&#xF419;</a>
            </div>
            <!-- <span class="list-mixed-line__cell list-mixed-line__cell--25width"></span> -->
            <span class="list-number--icon">
              <a :class="['button__icon', 'button__icon--edit', {'button__icon--disabled' : adsIsNotActive}]" @click="editAd($event)">&#xF3EB;</a>
              <a :class="['button__icon', 'button__icon--delete', {'button__icon--disabled' : adsIsNotActive}]" @click="deleteAd(index)">&#xF1C0;</a>
            </span>
          </li>
        </ul>
        <div :class="['typo-helptext', {'typo-helptext--active' : showhelp}]">{{ $store.state.settings.dynamiq.helptextprompts }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as Mask        from './../../utils/cm_mask';
  import { UnitsLabel }   from './../../directives/unitslabel';
  import { dynamicSortMultiple }   from '../../use/sortFunctions';
  import { sortable }     from './../../directives/sortable';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';
  import { LanguageCode } from '../../helpers/languageLib';

  export default {
    name: 'DynamiqMessages',
    props: ['custId', 'showhelp', 'queuedetail', 'isreadonly', 'isactive', 'adslist'],
    data() {
      return {
        playerIcon      : {
          play : '&#xF40A',
          load : '&#xF771',
          stop : '&#xf4DB'
        },
        sortoptions            : {isSortable: true},
        currentEditableLine    : null,
        currentAdvIndex        : null,
        currentPlayingAdvIndex : null,
        promptPlayer           : null,
        audioIsPlaying         : false,
        currentPromptTitle     : '',
        promptWatch            : null
      }
    },
    directives : {
      unitslabel : UnitsLabel,
      Sorter : sortable,
    },
    watch: {
      isactive: function(newVal) {
        if(!newVal)
          this.stopAndResetAudio();
      },
    },
    computed: {
      turnIndicatorIsNotActive() {
        return !this.queuedetail.TurnIndicator;
      },
      turnIndicatorValidation() {
        return this.turnIndicatorIsNotActive ? 'isNumber' : 'isAtLeastOne'; //isNumber because that's always true
      },
      adsIsNotActive() {
        return !this.queuedetail.Advertisements;
      },
      setValidation() {
        return type => {
           return this.isactive ? type : type + '_skip';
        }
      },
      removeNonPlayablePrompts() {
        if(this.queuedetail.AdvertisementPrompts.length > 0) {
          this.adslist.sort(dynamicSortMultiple('Title'));
          return this.adslist.filter(prompt => (prompt.PromptFiles.length > 0 && prompt.PromptFiles[0].LanguageCode > 0));
        } else {
          return [];
        }
      },
    },
    methods: {
      disbaledOption(id, indicator) {
        return id != indicator;
      },
      playPrompt(evt, name, index) {
        this.currentPlayingAdvIndex = index;
        let _targetBtn = evt.target,
        _prompt = this.getPromptByTitle(name);

        const _playPrompt = id => {
          //LANGUAGECODE IS VOOR NU ALLEEN NEDERLANDS
            IPCCCConfigurator.Request(this.custId, 'prompts', 'playprompt', LanguageCode.Nederlands, _prompt.Id).then(soundUrl => {
            this.promptPlayer.addEventListener('loadeddata', _ => {
              this.setAudioPlayerStatus(_targetBtn, 'playing', index);
              this.promptPlayer.play();
              this.currentPromptTitle = name;
            });
            this.promptPlayer.addEventListener('error', _ => {
              this.setAudioPlayerStatus(_targetBtn, 'stopped', index);
              console.log('Error: ', error);
            });
            this.promptPlayer.addEventListener('ended', _ => {
              this.setAudioPlayerStatus(_targetBtn, 'stopped', index);
            });
            this.promptPlayer.src = soundUrl;
          }).catch(
          error => {
            this.setAudioPlayerStatus(_targetBtn, 'stopped', index);
            console.log('Error: ', error);
          });
        };
        if(_prompt && _prompt.PromptFiles.length > 0 && _prompt.PromptFiles[0].LanguageCode > 0) {
          if (!this.audioIsPlaying) {
            this.setAudioPlayerStatus(_targetBtn, 'loading', index);
            _playPrompt(_prompt.Id);
          } else {
            this.promptPlayer.pause();
            this.setAudioPlayerStatus(_targetBtn, 'stopped', index);
            if (name != this.currentPromptTitle) _playPrompt(_prompt.Id);
          }
        }
      },
      editPrompt(index, name) {
        this.currentAdvIndex = index;
        let _promptToEdit    = this.removeNonPlayablePrompts.filter(el => el.Title == name)[0];
        this.promptNames     = [];

        this.removeNonPlayablePrompts.forEach(p => this.promptNames.push(p.Title));
        this.$store.commit('SET_PROMPTLOADER_DATA', {}); //DEEP COPY HACK
        this.$store.commit('SET_PROMPTLOADER_DATA', {
          action: 'edit',
          prompt: _promptToEdit,
          promptNames: this.promptNames
        });
        this.$store.commit('SET_PROMPTLOADER_DIALOG', true);
      },
      addPrompt(index) {
        this.currentAdvIndex = index;
        this.promptNames     = [];

        this.removeNonPlayablePrompts.forEach(p => this.promptNames.push(p.Title));
        this.$store.commit('SET_PROMPTLOADER_DATA', {}); //DEEP COPY HACK
        this.$store.commit('SET_PROMPTLOADER_DATA', {
          action: 'new',
          prompt: {
            Id: -1,
            Title: '',
            PromptType: 3,
            PromptFiles: [{
              LanguageCode: 1,
              Location: ''
            }]
          },
          promptNames: this.promptNames
        });
        this.$store.commit('SET_PROMPTLOADER_DIALOG', true);
      },
      changePrompt(evt, index, advName) {
        if(advName.length > 0) {
          let _promptId  = this.adslist.filter(el => el.Title == advName)[0].Id;
          this.queuedetail.AdvertisementPrompts[index].Id = _promptId;
        }
        this.setAudioPlayerStatus(evt, 'stopped', index);
      },
      editAd(evt) {
        let _target       = evt.target,
            _parent       = _target.parentElement.parentElement,
            _parentActive = _parent.classList.contains('list-items__row-ads--status-edit'),
            _list         = _parent.parentElement;

        // this.sortoptions.isSortable = false;

        if( this.currentEditableLine != null) {
          this.currentEditableLine.classList.remove('list-items__row-ads--status-edit');
          this.currentEditableLine.querySelector('SELECT').disabled = true;
        }

        if(this.currentEditableLine == _parent && _parentActive) {
          // this.sortoptions.isSortable = true;
        } else {
          _parent.classList.add('list-items__row-ads--status-edit');
          _parent.querySelector('SELECT').disabled = false;
        }

        this.currentEditableLine = _parent;
      },
      addAd() {
        let _newAdvertisementPrompt = {
          Id: -1,
          Name: ''
        };
        this.queuedetail.AdvertisementPrompts.push(_newAdvertisementPrompt);
      },
      deleteAd(index) {
        this.queuedetail.AdvertisementPrompts.splice(index, 1);
      },
      /* ------------- PROMPT HELPERS ---------------*/
      hasNoPrompt(name) {
        return (name.length > 0) ? false : true;
      },
      getPromptByTitle(title) {
        let _filtered = this.adslist.filter(p => p.Title == title);
        return _filtered.length > 0 ? _filtered[0] : false;
      },
      setAudioPlayerStatus(target, status, index) {
        let _target, _editBtn, _prompt;

        //Stop playing when select is used. Target is then used as an event. -> target.target = evt.target)
        if (target.type === 'change') {
          _target = target.target.parentElement.querySelector('.button__icon-play--small');
          _editBtn = target.target.parentElement.querySelector('.button__icon-edit--small');
          _prompt = this.getPromptByTitle(target.value);

          if (_prompt) {
            if (_prompt.IsDefault || this.queuedetail.Advertisements[index] == '') {
              _editBtn.classList.add('button__icon--disabled');
            } else {
              _editBtn.classList.remove('button__icon--disabled');
            }
          } else {
            _editBtn.classList.add('button__icon--disabled');
          }

          this.promptPlayer.pause();
        } else {
          _target = target;
        }

        if(this.currentPlayingAdvIndex == index) {
          switch (status) {
            case 'stopped':
              _target.innerHTML = this.playerIcon.play;
              _target.classList.remove('status--loading');
              this.audioIsPlaying = false;
              break;
            case 'loading':
              _target.innerHTML = this.playerIcon.load;
              _target.classList.add('status--loading');
              this.audioIsPlaying = true;
              break;
            case 'playing':
              _target.innerHTML = this.playerIcon.stop;
              _target.classList.remove('status--loading');
              this.audioIsPlaying = true;
              break;
          }
        } else {
          _target.innerHTML = this.playerIcon.play;
          _target.classList.remove('status--loading');
        }
      },
      stopAndResetAudio() {
        this.promptPlayer.pause();
        this.audioIsPlaying = false;
        document.querySelectorAll('.button__icon-play--small').forEach(btn => (btn.innerHTML = this.playerIcon.play));
      },
      reorderLines(evt) {
        const _movedItem = this.queuedetail.AdvertisementPrompts.splice(evt.detail.oldIndex, 1)[0];
        this.queuedetail.AdvertisementPrompts.splice(evt.detail.newIndex, 0, _movedItem);
      },
      checkIsNumber(evt, prop) {
        if(evt.target.readOnly == false)
          this.queuedetail[prop] = Mask.isNumberMask(evt);
      },
    },
    mounted() {
      this.promptPlayer          = new Audio();

      this.promptWatch = this.$store.watch(this.$store.getters.promptLoaderDialogStatus, status => {
        let _promptData = this.$store.getters.promptLoaderData();
        if(!status && typeof _promptData.action !== 'undefined') {
          if(_promptData.action == 'edit') {
            this.queuedetail.AdvertisementPrompts.forEach(prompt => {
              if(prompt.Id == _promptData.prompt.Id)
                prompt.Name = _promptData.prompt.Title;
            });
          }
          if (_promptData.action == 'new') {
            this.adslist.push(_promptData.prompt);
            this.queuedetail.AdvertisementPrompts[this.currentAdvIndex].Name = _promptData.prompt.Title;
            this.queuedetail.AdvertisementPrompts[this.currentAdvIndex].Id   = _promptData.prompt.Id;
          }
        }
      });
    },
    beforeUnmount() {
      this.promptWatch();
      this.stopAndResetAudio();
    }
  }

</script>

<style scoped>
.scriptmodule__icon {
    pointer-events: all;
    cursor: move;
    width: 10px;
    height: 100%;
}
</style>