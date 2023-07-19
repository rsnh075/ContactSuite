<template>
  <div data-e2e="service-edit-upload-prompt">
    <div :class="['dialog__modal dialog__modal--second', {'dialog__modal--open' : $store.state.promptDialogStatus}]">
      <div :class="['dialog__window dialog__window--prompt', {'dialog__window--open' : $store.state.promptDialogStatus}]">
        <div class="dialog__window-header">
          <span class="dialog__window-title">{{ dialogHeaderText }}</span>
          <a class="dialog__window-close" @click="cancelAction">
            <span></span>
            <span></span>
          </a>
        </div>
        <div class="dialog__window-body">
          <div class="grid-row">
            <div class="grid-unit--alpha">
              <div class="form-textfield form-textfield--bground">
                <input type="text" id="promptTitle" v-if="promptData.prompt" v-model="promptData.prompt.Title" @keyup="validateForUpload()">
                <label for="promptTitle" class="form-label form-label--hidden">{{ $store.state.settings.portal.promptnamelabel }}</label>
                <div v-if="promptData.prompt" :class="['form-validation__box', {'form-validation__box--visible' : !okToSave}]" >
                  <span v-if="promptData.prompt.Title == ''">{{ $store.state.settings.dropbox.noname }}</span>
                  <span v-else>{{ $store.state.settings.dropbox.namealteadyuserd }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-show="!actionEdit" class="grid-row">
            <div class="grid-unit--alpha">
              <form id="fileUploadForm" :class="['dropbox', {'dropbox--has-advanced-upload' : advancedDragAndDrop}]" method="post" action="" enctype="multipart/form-data">
                <div class="dropbox__input">
                  <input type="file" name="files[]" id="file" class="dropbox__file" @change="handleFileBrouwse($event)" @click="resetFile($event)">
                  <label for="file">
                    <strong><u>{{ $store.state.settings.dropbox.choosefilelabel }}</u></strong>
                    <span class="dropbox__dragndrop">&nbsp;{{ $store.state.settings.dropbox.draglabel }}</span>.
                  </label>
                  <button class="dropbox__button" type="submit">{{ $store.state.settings.dropbox.uploadlabel }}</button>
                </div>
                <div v-show="showLoading" class="dropbox__uploading">{{ $store.state.settings.dropbox.uploadingtext }}&hellip;</div>
                <div v-show="showSuccess" class="dropbox__success">{{ $store.state.settings.dropbox.finisheduploadtext }}&nbsp;{{ fileName }}</div>
                <div v-show="showError" class="dropbox__error">{{ $store.state.settings.dropbox.erroruploadtxt }}&nbsp;<span>{{ errorAddtext }}</span>.</div>
              </form>
            </div>
          </div>
        </div>
        <div class="grid-unit--alpha dialog__window-footer">
          <a v-if="promptData.prompt && actionEdit" class="button-primary button-primary--important" :class="{'button-primary--disabled' : (!okToSave || promptData.prompt.Title == '')}" @click="savePrompt()">{{ saveLabel }}</a>
          <a v-if="promptData.prompt && !actionEdit" class="button-primary button-primary--important" :class="{'button-primary--disabled' : (!okToSave || !hasFile)}" @click="savePrompt()">{{ saveLabel }}</a>
          <a class="button-primary dialog__window-cancel" @click="cancelAction">{{ $store.state.settings.portal.dialogCancelText }}</a> 
        </div> 
      </div>
    </div>
  </div>
</template>

<script>

  import Axios                   from 'axios';
  import { IPCCCConfigurator }   from './../../ipccc/js/configurator';
  import { IPCCC }               from './../../ipccc/js/ipccc.js';

  export default {
    name: 'EditUploadPromptDialog',
    data() {
      return {
        dialogHeaderTextEdit   : '',
        dialogHeaderTextAdd    : '',
        dialogHeaderText       : '',
        renameSaveLabel        : '',
        newSaveLabel           : '',
        saveLabel              : '',
        customerId             : -1,
        promptData             : {},
        actionEdit             : true,
        advancedDragAndDrop    : false,
        uploadForm             : null,
        droppedFiles           : null,
        dropZone               : null,
        maxPromptFilesize      : 10485760,
        errorAddtext           : '',
        showError              : false,
        showLoading            : false,
        showSuccess            : false,
        fileName               : '',
        newPromptAudioData     : null,
        urlToSavePromptFile    : '',
        okToSave               : false,
        hasFile                : false,
        promptWatch            : null
      };
    },
    inject: ['showLoader'],
    Components: {
      Axios
    },
    methods: {
      resetData() {
        this.showError          = this.showSuccess = this.showLoading = false;
        this.okToSave           = false;
        this.hasFile            = false;
        this.promptData.prompt  = {};
        this.newPromptAudioData = null;
        this.fileName           = '';
      },
      cancelAction() {
        this.promptData.action  = 'cancel';
        this.$store.commit('SET_APP_PROMPT_DATA', {});
        this.dialogClose();
      },
      dialogClose() {
        this.$store.commit('SET_PROMPTDIALOG', false);
      },
      savePrompt() {
        if(this.okToSave) {
          this.showLoader(true);
          if(this.actionEdit) {
            this.renameThePrompt(this.promptData.prompt);
          } else {
            this.savePromptFileAndSaveRecord();
          }
        }
      },
      renameThePrompt(prompt) {
        IPCCCConfigurator.Request(this.customerId, 'portalprompt', 'save', prompt, prompt.Id)
        .then(result => {
          let _mutatedPrompt = result.filter(p => p.Id == prompt.Id);
          if (_mutatedPrompt.length > 0) {
            if (_mutatedPrompt[0].Title != prompt.Title) {
              this.promptData.prompt.Title = _mutatedPrompt[0].Title;
              console.log('Alert promptname: ', _mutatedPrompt[0].Title);
            }
            this.$store.commit('SET_APP_PROMPT_DATA', {}); //DEEP COPY HACK
            this.$store.commit('SET_APP_PROMPT_DATA', this.promptData);
          } else {
            console.error('Promptname is not modified');
          }
          this.dialogClose();
        })
        .catch(error => {
          console.error(error);
          this.dialogClose();
        });
      },
      saveThePrompt(prompt) {
        IPCCCConfigurator.Request(this.customerId, 'portalprompt', 'save', prompt, -1)
        .then(result => {
          let _mutatedPrompt = result.filter(p => p.Title == prompt.Title);
          if(_mutatedPrompt.length > 0) {
            this.promptData.prompt.Id = _mutatedPrompt[0].Id;
            this.$store.commit('SET_APP_PROMPT_DATA', {}); //DEEP COPY HACK
            this.$store.commit('SET_APP_PROMPT_DATA', this.promptData);
          } else {
            console.error('Prompt is uploaded but the list is not modified');
          }
          this.dialogClose();
        })
        .catch(error => {
          console.error(error);
          this.dialogClose();
        });
      },
      dragAndDropCheck() {
        const _div = document.createElement('div');
        return (
          ('draggable' in _div || ('ondragstart' in _div && 'ondrop' in _div)) &&
          'FormData' in window &&
          'FileReader' in window
        );
      },
      showDropArea(e) {
        window.dropZone.style.visibility = 'visible';
        this.uploadForm.classList.add('dropbox--is-dragover');
        this.showError = this.showSuccess = this.showLoading = false;
      },
      hideDropArea() {
        window.dropZone.style.visibility = 'hidden';
        this.uploadForm.classList.remove('dropbox--is-dragover');
      },
      allowDrag(e) {
        if(true) {
          e.dataTransfer.dropEffect = 'copy';
          e.preventDefault();
          e.stopPropagation();
        }
      },
      handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        let _files = e.dataTransfer.files;

        this.checkAudioFile(_files[0]);
        this.hideDropArea();
      },
      handleFileBrouwse(e) {
        let _files = e.target.files;
        this.showError = this.showSuccess = this.showLoading = false;
        this.checkAudioFile(_files[0]);
      },
      resetFile(e) {
        e.target.value = '';
      },
      checkAudioFile(audioFile) {
        let _fileExtension = audioFile.name.split('.').pop(),
            _fileExtensionCheck = false;
        if(_fileExtension !== 'undefined') {
          // _fileExtensionCheck = this.$store.getters.getCustomerInfo().customerId ? _fileExtension == 'mp3' || _fileExtension == 'wav' : _fileExtension == 'mp3';
          _fileExtensionCheck = true;
        }
        if(_fileExtension !== 'undefined' && _fileExtensionCheck) {
          if(audioFile.size <= this.maxPromptFilesize) {
            //OK
            if(typeof FileReader !== 'undefined') {
              let _reader = new FileReader();
              _reader.onload = e => {
                this.newPromptAudioData = e.currentTarget.result;
                this.fileName = audioFile.name;
                this.showSuccess = true;
                this.validateForUpload();
              };
              _reader.onerror = e => {
                console.error(e.target.error);
              };
              _reader.readAsDataURL(audioFile);
            }
          } else {
            //FILE TO LARGE
            this.resetData();
            this.errorAddtext = this.$store.state.settings.dropbox.filetolarge;
            this.showError = true;
          }
        } else {
          //FILE WRONG FORMAT
          this.resetData();
          this.errorAddtext = this.$store.state.settings.dropbox.noaudiofile;
          this.showError = true;
        }
      },
      savePromptFileAndSaveRecord() {
        let _fileName = this.urlToSavePromptFile + '/upload/data/' + this.$store.state.loginSession.SessionId + '/' + this.fileName;

        Axios.post(_fileName, this.newPromptAudioData).then(result => {
            this.promptData.prompt.Url = result.data;
            //this.promptData.prompt.Url = this.promptData.prompt.Url.replace('https://nepal.', 'http://mediastreaming.').replace(':8081', ':8080');
            this.saveThePrompt(this.promptData.prompt);
          }, error => {
            this.showLoader(false);
            this.errorAddtext = this.$store.state.settings.dropbox.erroruploadtxt;
            this.showError = true;
          }
        );
      },
      validateForUpload() {
        if (this.actionEdit)
          this.okToSave = this.promptData.prompt.Title != '' && this.promptData.promptNames.indexOf(this.promptData.prompt.Title) == -1;
        else {
          this.okToSave = this.promptData.prompt.Title != '' && this.promptData.promptNames.indexOf(this.promptData.prompt.Title) == -1;
          this.hasFile  = this.newPromptAudioData != null;
        }
      }
    },
    mounted() {

      this.dialogHeaderTextEdit   = this.$store.state.settings.portal.prompteditheader;
      this.dialogHeaderTextAdd    = this.$store.state.settings.portal.promptnewheader;
      this.renameSaveLabel        = this.$store.state.settings.portal.promptrenamelabel;
      this.newSaveLabel           = this.$store.state.settings.portal.promptnewlabel;
      this.urlToSavePromptFile    = IPCCC.Settings.MediaStreamingURL;

      this.promptWatch            = this.$store.watch(this.$store.getters.promptDialogStatus, status => {
        if(status) {
          this.resetData();
          this.promptData       = this.$store.getters.promptData();
          this.actionEdit       = this.promptData.action == 'edit';
          this.dialogHeaderText = this.actionEdit ? this.dialogHeaderTextEdit : this.dialogHeaderTextAdd;
          this.saveLabel        = this.actionEdit ? this.renameSaveLabel : this.newSaveLabel;
          this.customerId       = this.$store.getters.getCustomerInfo().selectedCustomerId;
          this.validateForUpload();
          this.okToSave         = true;
          if (!this.actionEdit) initUpload();
        }
      });

      const initUpload = () => {
        this.advancedDragAndDrop = this.dragAndDropCheck();
        this.uploadForm          = document.getElementById('fileUploadForm');
        let _rand                = Math.round(Math.random() * 10000);

        if(this.advancedDragAndDrop) {
          if(document.querySelectorAll('.dropbox__drop-area').length == 0) {
            let _body     = document.querySelector('BODY'),
                _dropZone = document.createElement('div');

            _dropZone.id        = 'dropbox__drop-area--' + _rand;
            _dropZone.className = 'dropbox__drop-area';

            _body.insertBefore(_dropZone, _body.childNodes[0]);

            window.addEventListener('dragenter', this.showDropArea, false);

            ['dragenter', 'dragover'].forEach(eventType => {
              _dropZone.addEventListener(eventType, this.allowDrag, false);
            });

            _dropZone.addEventListener('mouseout', this.hideDropArea, false);
            _dropZone.addEventListener('dragleave', this.hideDropArea, false);

            _dropZone.addEventListener('drop', this.handleDrop, false);

            window.dropZone = document.querySelector(
              '#dropbox__drop-area--' + _rand
            );
          }
        } else {
          document.querySelector('.dropbox__dragndrop').style.display = 'none';
        }
      };
    },
    beforeUnmount() {
      this.promptWatch();

      window.removeEventListener('dragenter', this.showDropArea, false);

      let _dropZone = document.querySelector('.dropbox__drop-area');

      if (_dropZone) {
        ['dragenter', 'dragover'].forEach(eventType => {
          _dropZone.removeEventListener(eventType, this.allowDrag, false);
        });

        _dropZone.removeEventListener('dragleave', this.hideDropArea, false);
        _dropZone.removeEventListener('mouseout', this.hideDropArea, false);

        _dropZone.removeEventListener('drop', this.handleDrop, false);
      }

      let _dropA = document.querySelector('.dropbox__drop-area');
      if (_dropA) _dropA.parentNode.removeChild(_dropA);
    }
  }
</script>
