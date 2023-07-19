<script lang="ts">

/**
   *
   * Csv uploader accepts .csv .xls .xlsx files
   *
   * @param slot - slot for extra save options
   * @param examplecsvname - if has filename then button for example csv is shown. location is set to assets/downloads/ in public folder.
   *
   * @author Erik Rosenhart
   * @version 1.0
   *
   *
   */

export default {
    name: 'CsvUploader',
    components: {
        Axios
    },
    directives: {
      Validate: ValidateDir
    },
}
</script>

<script setup lang="ts">

import Axios            from 'axios';
import { ValidateDir }  from './../../directives/validate';
import { IPCCC }        from './../../ipccc/js/ipccc.js';
import { computed, inject, onBeforeUnmount, onMounted, ref, nextTick, watchEffect } from '@vue/runtime-core';
import { useStore } from 'vuex';


const   props = defineProps({
    visible : {
        type    : Boolean,
        default : false
    },
    customerid : {
        type : Number,
        default : -1
    },
    detailid : {
        type : Number,
        default : -1
    },
    detailname : {
        type : String,
        default : ''
    },
    examplecsvname : {
        type : String,
        default : ''
    },
    closecsvuploader : {
        type : Boolean,
        default : false
    }
});

const emits = defineEmits(['closecsvuploader', 'savecsv']);

const   store                   = useStore(),
        showLoader              = <Function>inject('showLoader'),
        // showModalDialog         = <Function>inject('showModalDialog'),
        showHelp                = ref(false),
        advancedDragAndDrop     = ref(false),
        uploadForm              = ref(null),
        maxCsvFilesize          = 10485760, //10M,
        errorAddtext            = ref(''),
        showError               = ref(false),
        showLoading             = ref(false),
        showSuccess             = ref(false),
        csvFileName             = ref(''),
        newCsvData              = ref(null),
        urlToSaveCsvFile        = IPCCC.Settings.MediaStreamingURL,
        validationcontrol       = ref(null),
        closeCsvUploader        = computed(() => props.closecsvuploader),
        hasFileToSave           = computed(() => csvFileName.value.length > 0 && showSuccess.value);

watchEffect(() => {
    if (closeCsvUploader.value) closeCsvUploaderFn();
});

const saveCsv = () => {
    if(hasFileToSave.value) {
        showLoader(true);
        emits('savecsv', csvFileName.value);
    }
};

const saveCsvData = () => {
    let _csvFileName = urlToSaveCsvFile + '/upload/data/' + store.state.loginSession.SessionId + '/' + csvFileName.value;
    Axios.post(_csvFileName, newCsvData.value)
    .then(result => {
        revalidateForm();
        showLoader(false);
    })
    .catch(error => {
        showLoader(false);
        errorAddtext.value = store.state.settings.csvuploader.erroruploadtxt;
        showError.value    = true;
        showSuccess.value  = false;
        console.error(error);
        showLoader(false);
    });
};

const closeCsvUploaderFn = () => {
    resetValidationOnForm();
    resetCsvToUploadData();
    emits('closecsvuploader');
};

//==========================================HELPER FUNCTIONS
const resetFile = (e) => {
    e.target.value = '';
};

const resetCsvToUploadData = () => {
    showError.value    = showSuccess.value = showLoading.value = false;
    newCsvData.value   = null;
    csvFileName.value  = '';
    errorAddtext.value = '';
};

const revalidateForm = () => {
    nextTick(() => {
        let _event = new Event('revalidate');
        validationcontrol.value.dispatchEvent(_event);
    });
};

const resetValidationOnForm = () => {
    let _event = new Event('reset');
    validationcontrol.value.dispatchEvent(_event);
};

const dragAndDropCheck = () => {
    const _div = document.createElement('div');
    return (
    ('draggable' in _div || ('ondragstart' in _div && 'ondrop' in _div)) &&
    'FormData' in window &&
    'FileReader' in window
    );
};

const showDropArea = (e) => {
    let _dataTransfer = e.dataTransfer;
    // //prevent dropzone to be visible if data is not a file.
    // if(_dataTransfer.types && _dataTransfer.types.indexOf('Files') != -1) {
    window.dropZone.style.visibility = 'visible';
    uploadForm.value.classList.add('dropbox--is-dragover');
    showError.value = showSuccess.value = showLoading.value = false;
    // }
};

const hideDropArea = () => {
    window.dropZone.style.visibility = 'hidden';
    uploadForm.value.classList.remove('dropbox--is-dragover');
};

const allowDrag = (e) => {
    if (true) {
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
        e.stopPropagation();
    }
};

const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    //hide dropzone if data is not a file.
    if(e.dataTransfer.types && e.dataTransfer.types.indexOf('Files') != -1) {
        let _files = e.dataTransfer.files;
        showLoader(true);
        checkCsvFile(_files[0]);
        hideDropArea();
    } else {
        hideDropArea();
    }
};

const handleFileBrouwse = (e) => {
    let _files = e.target.files;
    showError.value = showSuccess.value = showLoading.value = false;
    showLoader(true);
    checkCsvFile(_files[0]);
};

const checkCsvFile = (csvFile) => {
    let _fileExtension = csvFile.name.split('.').pop(),
        _fileExtensionCheck = false;
    if(_fileExtension !== 'undefined') {
        _fileExtensionCheck = _fileExtension == 'csv' || _fileExtension == 'xlsx' || _fileExtension == 'xls';
    }
    if(_fileExtension !== 'undefined' && _fileExtensionCheck) {
        if (csvFile.size <= maxCsvFilesize) {
            //OK
            if (typeof FileReader !== 'undefined') {
            let _reader = new FileReader();
            _reader.onload = e => {
                newCsvData.value         = e.currentTarget.result;
                csvFileName.value        = csvFile.name;
                showSuccess.value        = true;
            };
            _reader.onerror = e => {
                console.log('FileReader error: ', e.target.error);
            };
            _reader.readAsDataURL(csvFile);
            _reader.onloadend = _ => {
                saveCsvData();
            }
            }
        } else {
            //FILE TO LARGE
            resetCsvToUploadData();
            errorAddtext.value = store.state.settings.csvuploader.filetolarge;
            showError.value = true;
            showLoader(false);
        }
    } else {
        //FILE WRONG FORMAT
        resetCsvToUploadData();
        errorAddtext.value = store.state.settings.csvuploader.nocsvfile;
        showError.value = true;
        showLoader(false);
    }
};

const initUpload = () => {
    advancedDragAndDrop.value = dragAndDropCheck();
    // uploadForm = document.getElementById('fileUploadForm');
    let _rand = Math.round(Math.random() * 10000);

    if(advancedDragAndDrop.value) {
        if(document.querySelectorAll('.dropbox__drop-area').length == 0) {
            let _body = document.querySelector('BODY'),
            _dropZone = document.createElement('div');

            _dropZone.id = 'dropbox__drop-area--' + _rand;
            _dropZone.className = 'dropbox__drop-area';

            _body.insertBefore(_dropZone, _body.childNodes[0]);

            window.addEventListener('dragenter', showDropArea, false);

            ['dragenter', 'dragover'].forEach(eventType => {
            _dropZone.addEventListener(eventType, allowDrag, false);
            });

            _dropZone.addEventListener('dragleave', hideDropArea, false);

            _dropZone.addEventListener('drop', handleDrop, false);

            window.dropZone = document.querySelector('#dropbox__drop-area--' + _rand);
        }
    } else {
        document.querySelector('.dropbox__dragndrop').style.display = 'none';
    }
};

const displayHelp = () => {
    showHelp.value = !showHelp.value;
};

const shakeIt = () => {
    let _elm = document.querySelector("#detailscreen");
    _elm.classList.add('detailscreen--shake');
    setTimeout(() => {
        _elm.classList.remove('detailscreen--shake');
    }, 1000);
};

const downloadExampleCSV = () => {
    let _link           = document.createElement('a');
    _link.setAttribute('href', window.siteroot + 'assets/downloads/' + props.examplecsvname);
    _link.setAttribute('download', props.examplecsvname);
    _link.style.display = 'none';
    _link.target        = '_blank';

    document.body.appendChild(_link);
    _link.click();
};

onMounted(() => {
    initUpload();
});

onBeforeUnmount(() => {
    window.removeEventListener('dragenter', showDropArea, false);

    let _dropZone = document.querySelector('.dropbox__drop-area');

    if (_dropZone) {
    ['dragenter', 'dragover'].forEach(eventType => {
        _dropZone.removeEventListener(eventType, allowDrag, false);
    });

    _dropZone.removeEventListener('dragleave', hideDropArea, false);

    _dropZone.removeEventListener('drop', handleDrop, false);
    }

    let _dropA = document.querySelector('.dropbox__drop-area');
    if (_dropA) _dropA.parentNode.removeChild(_dropA);

});

</script>

<style lang="scss" scoped>

.detailscreen-wrapper {
    z-index: 300;
}

</style>

<template>
    <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="csv-uploader">
        <div id="detailscreen" class="detailscreen">
        <!-- <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a> -->
            <div class="grid-row">
                <div class="grid-unit--gamma--double detailscreen-wrapper__title">
                    <span class="detailscreen__title">{{ detailname }}</span>
                </div>
                <div class="form-button__secondary form-button__secondary--add grid--push">
                    <button v-if="examplecsvname.length > 0" type="button" class="" @click="downloadExampleCSV">{{ store.state.settings.dropbox.downloadexamplecsvlbl }}</button>
                </div>
            </div>
            <form @valid="saveCsv()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
                <input type="hidden" data-revalidate="" data-reset="" ref="validationcontrol">
                <div class="grid-row">
                    <div class="grid-unit--alpha grid-unit--alpha-less-v-padding">
                        <div ref="uploadForm" :class="['dropbox', 'dropbox--large', 'dropbox--no-margin', {'dropbox--has-advanced-upload' : advancedDragAndDrop}]">
                            <div class="dropbox__input">
                                <input type="file" name="file" id="file" class="dropbox__file" @change="handleFileBrouwse($event)" @click="resetFile($event)">
                                <label for="file">
                                    <strong><u>{{ store.state.settings.csvuploader.choosefilelabel }}</u></strong>
                                    <span class="dropbox__dragndrop">&nbsp;{{ store.state.settings.dropbox.draglabel }}</span>.
                                </label>
                                <button class="dropbox__button" type="submit">{{ store.state.settings.dropbox.uploadlabel }}</button>
                            </div>
                            <div v-show="showLoading" class="dropbox__uploading">{{ store.state.settings.dropbox.uploadingtext }}&hellip;</div>
                            <div v-show="showSuccess" class="dropbox__success">{{ store.state.settings.dropbox.finisheduploadtext }}&nbsp;{{ csvFileName }}</div>
                            <div v-show="showError" class="dropbox__error">{{ store.state.settings.csvuploader.erroruploadtxt }}&nbsp;<span>{{ errorAddtext }}</span>.</div>
                        </div>
                    </div>
                </div>
                <slot />
            </form>
            <!-- BUTTONS -->
            <div class="detailscreen-footer detailscreen-footer--inside">
                <span class="grid--push">
                    <a class="button-primary button-primary--gray" @click="closeCsvUploaderFn()">{{ store.state.settings.csvuploader.closebtnlbl }}</a>
                    <a :class="['button-primary js-submitbtn', {'button-primary--disabled' : !hasFileToSave}]">{{ store.state.settings.csvuploader.savebtnlbl }}</a>
                </span>
            </div>
        </div>
    </div>
</template>
