<template>
  <div data-e2e="campaign-upload-headers">
    <div class="grid-row">
      <div class="grid--push">
        <div class="form-button__secondary form-button__secondary--lowered form-button__secondary--add grid--push">
          <button type="button" @click="openFileBrowser()">{{ $store.state.settings.campaignmanager.uploadlistbtn }}</button>
        </div>
      </div>
    </div>
    <div v-show="showdroparea" class="grid-row">
      <form @valid="saveCsv()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
        <input type="hidden" data-revalidate="" data-reset="" ref="validationcontrol">
        <div  class="grid-row">
          <div class="grid-unit--alpha grid-unit--alpha-less-v-padding">
            <div id="fileUploadForm" :class="['dropbox', 'dropbox--large', 'dropbox--no-margin', {'dropbox--has-advanced-upload' : advancedDragAndDrop}]">
              <div class="dropbox__input">
                <input type="file" name="file" id="file" class="dropbox__file" @change="handleFileBrouwse($event)" @click="resetFile($event)">
                <label for="file">
                  <strong><u>{{ $store.state.settings.csvuploader.choosefilelabel }}</u></strong>
                  <span class="dropbox__dragndrop">&nbsp;{{ $store.state.settings.dropbox.draglabel }}</span>.
                </label>
                <button class="dropbox__button" type="submit">{{ $store.state.settings.dropbox.uploadlabel }}</button>
              </div>
              <div v-show="showLoading" class="dropbox__uploading">{{ $store.state.settings.dropbox.uploadingtext }}&hellip;</div>
              <div v-show="showSuccess" class="dropbox__success">{{ $store.state.settings.dropbox.finisheduploadtext }}&nbsp;{{ csvFileName }}</div>
              <div v-show="showError" class="dropbox__error">{{ $store.state.settings.csvuploader.erroruploadtxt }}&nbsp;<span>{{ errorAddtext }}</span>.</div>
            </div>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script>

  import Axios            from 'axios';
  import { ValidateDir }  from './../../directives/validate';
  import { IPCCC }        from './../../ipccc/js/ipccc.js';
  import {IPCCCConfigurator} from "../../ipccc/js/configurator";

  export default {
    name: 'CampaignUploadHeaders',
    props: {
      showhelp : {
        type     : Boolean,
        default  : false
      },
      showdroparea : {
        type     : Boolean,
        default  : false
      }
    },
    data: () => {
      return {
        showHelp              : false,
        renameSaveLabel       : '',
        advancedDragAndDrop   : false,
        uploadForm            : null,
        maxCsvFilesize        : 10485760, //10MB
        errorAddtext          : '',
        showError             : false,
        showLoading           : false,
        showSuccess           : false,
        csvFileName           : '',
        newCsvData            : null,
        urlToSaveCsvFile      : '',
        theCampaign           : {},
      }
    },
    inject: ['showLoader'],
    components: {
      Axios
    },
    directives: {
      Validate: ValidateDir
    },
    computed: {
      hasFileToSave() {
        return this.csvFileName.length > 0 && this.showSuccess;
      }
    },
    methods: {
      getHeaders() {
        if(this.hasFileToSave) {
          this.showLoader(true);
            IPCCCConfigurator.Request(this.customerid, 'outboundmanager', 'fileheaders', this.csvFileName, -1).then(result => {
            this.$emit('newheaderlist', result);
          }).catch(error => {
            console.error('Error: ' + error);
            this.showLoader(false);
          });
        }
      },
      saveCsv() {
        //Do nothing
      },
      saveCsvData() {
        let _csvFileName = this.urlToSaveCsvFile + '/upload/data/' + this.$store.state.loginSession.SessionId + '/' + this.csvFileName;
        Axios.post(_csvFileName, this.newCsvData)
        .then(result => {
          this.revalidateForm();
          this.getHeaders();
          this.showLoader(false);
        })
        .catch(error => {
          this.showLoader(false);
          this.errorAddtext = this.$store.state.settings.csvuploader.erroruploadtxt;
          this.showError    = true;
          this.showSuccess  = false;
          console.error('Error: ' + error);
          this.showLoader(false);
        })
      },
      closeCsvUploader() {
        this.resetValidationOnForm();
        this.resetCsvToUploadData();
        this.$emit('setfieldsetheaders', this.theCampaign);
      },
      //==========================================HELPER FUNCTIONS
      resetFile(e) {
        e.target.value = '';
      },
      resetCsvToUploadData() {
        this.showError    = this.showSuccess = this.showLoading = false;
        this.newCsvData   = null;
        this.csvFileName  = '';
        this.errorAddtext = '';
      },
      revalidateForm() {
        this.$nextTick()
        .then(() => {
          let _event = new Event('revalidate');
          this.$refs.validationcontrol.dispatchEvent(_event);
        });
      },
      resetValidationOnForm() {
        let _event = new Event('reset');
        this.$refs.validationcontrol.dispatchEvent(_event);
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
        let _dataTransfer = e.dataTransfer;
        // //prevent dropzone to be visible if data is not a file.
        // if(_dataTransfer.types && _dataTransfer.types.indexOf('Files') != -1) {
          window.dropZone.style.visibility = 'visible';
          this.uploadForm.classList.add('dropbox--is-dragover');
          this.showError = this.showSuccess = this.showLoading = false;
        // }
      },
      hideDropArea() {
        window.dropZone.style.visibility = 'hidden';
        this.uploadForm.classList.remove('dropbox--is-dragover');
      },
      allowDrag(e) {
        if (true) {
          e.dataTransfer.dropEffect = 'copy';
          e.preventDefault();
          e.stopPropagation();
        }
      },
      handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        //hide dropzone if data is not a file.
        if(e.dataTransfer.types && e.dataTransfer.types.indexOf('Files') != -1) {
          let _files = e.dataTransfer.files;
          this.showLoader(true);
          this.checkCsvFile(_files[0]);
          this.hideDropArea();
        } else {
          this.hideDropArea();
        }
      },
      handleFileBrouwse(e) {
        let _files = e.target.files;
        this.showError = this.showSuccess = this.showLoading = false;
        this.showLoader(true);
        this.checkCsvFile(_files[0]);
      },
      checkCsvFile(csvFile) {
        let _fileExtension = csvFile.name.split('.').pop(),
            _fileExtensionCheck = false;
        if(_fileExtension !== 'undefined') {
          _fileExtensionCheck = _fileExtension == 'csv';
        }
        if(_fileExtension !== 'undefined' && _fileExtensionCheck) {
          if (csvFile.size <= this.maxCsvFilesize) {
            //OK
            if (typeof FileReader !== 'undefined') {
              let _reader = new FileReader();
              _reader.onload = e => {
                this.newCsvData         = e.currentTarget.result;
                this.csvFileName        = csvFile.name;
                this.showSuccess        = true;
              };
              _reader.onerror = e => {
                console.log('FileReader error: ', e.target.error);
              };
              _reader.readAsDataURL(csvFile);
              _reader.onloadend = _ => {
                this.saveCsvData();
              }
            }
          } else {
            //FILE TO LARGE
            this.resetCsvToUploadData();
            this.errorAddtext = this.$store.state.settings.csvuploader.filetolarge;
            this.showError = true;
            this.showLoader(false);
          }
        } else {
          //FILE WRONG FORMAT
          this.resetCsvToUploadData();
          this.errorAddtext = this.$store.state.settings.csvuploader.nocsvfile;
          this.showError = true;
          this.showLoader(false);
        }
      },
      initUpload() {
        this.advancedDragAndDrop = this.dragAndDropCheck();
        this.uploadForm = document.getElementById('fileUploadForm');
        let _rand = Math.round(Math.random() * 10000);

        if(this.advancedDragAndDrop) {
          if(document.querySelectorAll('.dropbox__drop-area').length == 0) {
            let _body = document.querySelector('BODY'),
              _dropZone = document.createElement('div');

            _dropZone.id = 'dropbox__drop-area--' + _rand;
            _dropZone.className = 'dropbox__drop-area';

            _body.insertBefore(_dropZone, _body.childNodes[0]);

            window.addEventListener('dragenter', this.showDropArea, false);

            ['dragenter', 'dragover'].forEach(eventType => {
              _dropZone.addEventListener(eventType, this.allowDrag, false);
            });

            _dropZone.addEventListener('dragleave', this.hideDropArea, false);

            _dropZone.addEventListener('drop', this.handleDrop, false);

            window.dropZone = document.querySelector('#dropbox__drop-area--' + _rand);
          }
        } else {
          document.querySelector('.dropbox__dragndrop').style.display = 'none';
        }
      },
      openFileBrowser() {
        document.getElementById('file').click();
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
      }
    },
    mounted() {
      this.urlToSaveCsvFile      = IPCCC.Settings.MediaStreamingURL;
      this.initUpload();
    },
    beforeUnmount() {
      window.removeEventListener('dragenter', this.showDropArea, false);

      let _dropZone = document.querySelector('.dropbox__drop-area');

      if (_dropZone) {
        ['dragenter', 'dragover'].forEach(eventType => {
          _dropZone.removeEventListener(eventType, this.allowDrag, false);
        });

        _dropZone.removeEventListener('dragleave', this.hideDropArea, false);

        _dropZone.removeEventListener('drop', this.handleDrop, false);
      }

      let _dropA = document.querySelector('.dropbox__drop-area');
      if (_dropA) _dropA.parentNode.removeChild(_dropA);

    }
  }

</script>
