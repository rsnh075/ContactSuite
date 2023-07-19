<script>
    //TODO Changed language. Set CHANGELANGUAGE and NewLanguageCode and leave LanguageCode set to the oldVal.
    
    import Axios					from 'axios';
    import { ValidateDir }			from './../../directives/validate';
    import { IPCCC }				from './../../ipccc/js/ipccc.js';
    import { IPCCCConfigurator }	from "../../ipccc/js/configurator";
    
    const PROMPTTYPE = {
        'Normal'       : 0, // Normale prompt
        'Position'     : 1, // Prompt geeft een positie in de wachtrij aan (voorlopig niet)
        'WaitingTime'  : 2, // Prompt geeft een gemiddelde wachttijd aan (voorlopig niet)
        'Advertention' : 3, // Prompt is een Advertentie
        'Chat'         : 4, // Prompt is een chatprompt en bestaat dus uit tekst en is geen verwijzing naar een bestand (voorlopig niet)
        'NotSet'       : 5  // Prompttype is niet ingesteld
    }
    
    const PROMPTDATAACTION = {
        UPDATE          : 0, // Update/Insert
        REMOVE          : 1, // Remove
        CHANGELANGUAGE  : 2  // ChangeLanguage
    }
    
    const PROMTLANGUAGELIST = [
        {label : 'Nederlands', code : 1},
        {label : 'English',    code : 2},
        {label : 'Français',   code : 3},
        {label : 'Deutsch',    code : 4},
        {label : 'Svenska',    code : 5},
        {label : 'Suomi',      code : 6},
        {label : 'Norsk',      code : 7},
        {label : 'Dansk',      code : 8},
        {label : 'Magyar',     code : 9},
        {label : 'Espagnol',   code : 10},
        {label : 'Italiano',   code : 11},
        {label : 'Polska',     code : 12},
        {label : 'Vlaams',     code : 13},
        {label : 'Български',  code : 14},
        {label : 'Hrvatski',   code : 15},
        {label : 'Čeština',    code : 16},
        {label : 'Eesti',      code : 17},
        {label : 'Ελληνικά',   code : 18},
        {label : 'Latvijas',   code : 19},
        {label : 'Lietuvos',   code : 20},
        {label : 'Português',  code : 21},
        {label : 'Român',      code : 22},
        {label : 'Slovenčina', code : 23},
        {label : 'Slovenski',  code : 24},
        {label : 'Schweizer',  code : 25},
    ];
    
    export default {
        name: 'PromptUploader',
        props: ['visible', 'promptId', 'promptNames', 'customerId'],
        data: () => {
            return {
                showHelp              : false,
                renameSaveLabel       : '',
                advancedDragAndDrop   : false,
                uploadForm            : null,
                maxPromptFilesize     : 10485760,
                errorAddtext          : '',
                showError             : false,
                showLoading           : false,
                showSuccess           : false,
                urlToSavePromptFile   : '',
                promptTypes           : [],
                regIsNotFive          : '^[^5]$',
                isNotMinusOne         : '^((?!-1).)*$',
                playerIcon            : {
                    play                : '&#xF40A',
                    load                : '&#xF771',
                    stop                : '&#xf4DB'
                },
                initialPromptTitle    : '',
                thePrompt: {
                    Id            : -1,
                    Title         : '',
                    Description   : '',
                    PromptType    : PROMPTTYPE.NotSet,
                    PromptFiles   : []
                },
                selectedDownloadLoc     : '',
                availableLangList 		: [],
            }
        },
        inject: ['showLoader'],
        directives: {
            Validate: ValidateDir
        },
        computed: {
            showFilenames() {
                return this.thePrompt.PromptFiles.reduce((listString, prompt) => {
                        if(prompt.FileName) {
                            listString += prompt.FileName + ', ';
                        }
                        return listString;
    
                    }, '').slice(0, -2);
                },
            showTitle() {
                return this.thePrompt.Title != '' ? this.thePrompt.Title : this.$store.state.settings.promptuploader.newtitleplaceholder;
            },
            validTitle() {
                //here isEmail is used to get an error
                let _validateTitleOn = 'isNotEmpty';
                if(this.thePrompt.Title == this.initialPromptTitle && this.initialPromptTitle != '') //ok to save
                    _validateTitleOn = 'isAll';
                else if(this.promptNames.indexOf(this.thePrompt.Title) != -1) //not ok - promptname already exists
                    _validateTitleOn = 'isEmail';
                return _validateTitleOn;
            },
            typeNotSet() {
                return this.thePrompt.PromptType == PROMPTTYPE.NotSet;
            },
            typeNormal() {
                return this.thePrompt.PromptType == PROMPTTYPE.Normal;
            },
            typeAd() {
                return this.thePrompt.PromptType == PROMPTTYPE.Advertention;
            }
        },
        watch: {
            visible() {
                if(this.visible && this.promptId == -1) {
                    this.getNewPrompt();
                } else if(this.visible && this.queueId != -1) {
                    this.getPrompt(this.promptId);
                }
            },
            'thePrompt.PromptFiles': {
                deep: true,
                handler(val) {
                    this.availableLangList = PROMTLANGUAGELIST.map(lang => {
                        let _available = this.thePrompt.PromptFiles.findIndex(prompt => prompt.LanguageCode == lang.code && prompt.Action !== 1);
                        lang.isAvailable =  _available == -1;
                        return lang;
                    });
                }
            }
        },
        methods: {
            getFileNameFromUrl(prompt) {
                return prompt.Location !== '' ? prompt.Location.substring(prompt.Location.lastIndexOf('/')+1, prompt.Location.length) : prompt.FileName;
            },
            getNewPrompt() {
                this.thePrompt = {
                    Id: -1,
                    Title: '',
                    Description: '',
                    PromptType: PROMPTTYPE.Normal,
                    PromptFiles: []
                };
                this.initialPromptTitle = '';
            },
            getPrompt(id) {
                IPCCCConfigurator.Request(this.customerId, 'prompts', 'readone', null, id).then(result => {
                    this.thePrompt          = result;
                    //On the server the NewLanguageCode is not updated after change. So NewLanguageCode is set to be equal with LanguageCode on the front-end.
                    this.thePrompt.PromptFiles.forEach(prompt => {
                        prompt.NewLanguageCode = prompt.LanguageCode;
                    })
                    this.initialPromptTitle = this.thePrompt.Title;
                    this.showLoader(false);
                }).catch(error => {
                    console.error('Error: ' + error);
                    this.showLoader(false);
                });
            },
            savePrompt() { //FIRST SAVE AUDIO FILE, THEN SAVE TO BACKEND
                this.showLoader(true);
                this.savePromptAudioData().then(succes => {
                    this.thePrompt.PromptFiles.forEach(prompt => {
                        if(prompt.NewLanguageCode && prompt.NewLanguageCode !== prompt.LanguageCode) {
                            //NewLanguageCode property is not available on added prompts, so for existing prompts new is used to store old. Therefore swap on save.
                            [prompt.LanguageCode, prompt.NewLanguageCode] = [prompt.NewLanguageCode, prompt.LanguageCode];
                            prompt.Action = PROMPTDATAACTION.CHANGELANGUAGE;
                        }
                    })
                    IPCCCConfigurator.Request(this.customerId, 'prompts', 'save', this.thePrompt, this.thePrompt.Id).then(result => {
                        this.thePrompt = result[0];
                        this.resetValidationOnForm();
                        this.$emit('save-prompt', this.thePrompt);
                        this.resetPromptToUploadData();
                    }).catch(error => {
                        console.error('Error: ' + error);
                    });
                }).catch(error => {
                    console.error('Error saving audiofiles');
                }).finally(_ => {
                    this.showLoader(false);
                });
            },
            savePromptAudioData() {
                return new Promise((resolve, reject) => {
                    let isSavedCount = 0;
                    this.thePrompt.PromptFiles.forEach(promptFile => {
                        if(promptFile.hasOwnProperty('Blob')) {
                            let _fileName = this.urlToSavePromptFile + '/upload/data/' + this.$store.state.loginSession.SessionId + '/' + promptFile.FileName;
                            Axios.post(_fileName, promptFile.Blob).then(result => {
                            promptFile.Location     = result.data;
                            delete promptFile.Blob;
                            delete promptFile.FileName;
                            isSavedCount++;
                            if(isSavedCount === this.thePrompt.PromptFiles.length)
                                resolve();
                            }).catch(error => {
                                reject();
                            }) 
                        } else {
                            isSavedCount++;
                            if(isSavedCount === this.thePrompt.PromptFiles.length)
                                resolve();
                        }
                    });
                });
            },
            closePrompt() {
                this.resetValidationOnForm();
                this.resetPromptToUploadData();
                this.$emit('close-prompt');
            },
            deletePrompt() {
                this.showLoader(true);
                    IPCCCConfigurator.Request(this.customerId, 'prompts', 'delete', this.thePrompt, this.thePrompt.Id).then(result => {
                    let _prompt = result;
                    this.resetValidationOnForm();
                    this.resetPromptToUploadData();
                    this.$emit('delete-prompt', _prompt);
                }).catch(error => {
                    this.showLoader(false);
                    this.errorAddtext = this.$store.state.settings.dropbox.erroruploadtxt;
                    this.showError    = true;
                    console.error('Error: ' + error);
                });
            },
            downloadPromptAudioData(id, lCode) {
                // this.showLoader(true);
                IPCCCConfigurator.Request(this.customerId, 'prompts', 'playprompt', lCode, id)
                .then(soundUrl => {
                    let _anchor = document.createElement('a');
                    _anchor.setAttribute('href', soundUrl + '?action=download');
                    document.body.appendChild(_anchor);
                    _anchor.click();
                }).catch(error => {
                    console.error('Error: ', error);
                });
            },
            deletePromptAudioData(index, location) {
                if(location === '') {
                    this.thePrompt.PromptFiles.splice(index, 1);
                    this.resetPromptToUploadData();
                } else {
                    this.deletePromptFile(index);
                }
            },
            deletePromptFile(index) {
                this.thePrompt.PromptFiles[index].Action = PROMPTDATAACTION.REMOVE;
            },
            playThePrompt(evt, promptfile) {
                let _targetBtn = evt.target;
                if(promptfile.Location !== '') {
                    this.$emit('play-prompt', _targetBtn, promptfile.PromptId, promptfile.LanguageCode, promptfile.Location);
                } else {
                    this.$emit('play-bytecode-prompt', _targetBtn, promptfile.Blob);
                }
            },
            //==========================================HELPER FUNCTIONS
            resetPromptToUploadData() {
                this.showError          = this.showSuccess = this.showLoading = false;
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
            typeNotSupported(val) {
                if(val == PROMPTTYPE.Position || val == PROMPTTYPE.WaitingTime || val == PROMPTTYPE.Chat) {
                    return true;
                } else {
                    return false;
                }
            },
            dragAndDropCheck() {
                const _div = document.createElement('div');
                return (
                    ('draggable' in _div || ('ondragstart' in _div && 'ondrop' in _div)) &&
                    'FormData' in window &&
                    'FileReader' in window
                );
            },
            showDropArea(evt) {
                let _dataTransfer = evt.dataTransfer;
                this.uploadForm.classList.add('dropbox--is-dragover');
                window.dropZone.style.visibility  = 'visible';
                this.showError = this.showSuccess = this.showLoading = false;
            },
            hideDropArea() {
                window.dropZone.style.visibility = 'hidden';
                this.uploadForm.classList.remove('dropbox--is-dragover');
            },
            allowDrag(evt) {
                evt.dataTransfer.dropEffect = 'copy';
                evt.preventDefault();
                evt.stopPropagation();
            },
            handleDrop(evt) {
                this.showLoader(true);
                evt.preventDefault();
                evt.stopPropagation();
    
                //hide dropzone if data is not a file.
                if(evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') != -1) {
                    this.checkAudioFile(evt.dataTransfer.files);
                    this.hideDropArea();
                } else {
                    this.hideDropArea();
                }
            },
            handleFileBrowse(evt) {
                this.showLoader(true);
                this.checkAudioFile(evt.target.files);
                //fix for same file
                this.$refs.fileInputElement.value = '';
            },
            loadAudioFile(file) {
                return new Promise((resolve, reject) => {
                    if(typeof FileReader !== 'undefined') {
                    let _reader = new FileReader();
                    _reader.onload = evt => {
                        resolve(evt.currentTarget.result);
                    };
                    _reader.onerror = evt => {
                        reject(evt.target.error);
                    };
                    _reader.onloadend = evt => {
                        
                        }
                    _reader.readAsDataURL(file);
                    }
                })
            },
            checkAudioFile(audioFiles) {
                let _errorMsg           = [];
    
                this.showError          = this.showSuccess = this.showLoading = false;
    
                Array.from(audioFiles).forEach(file => {
                    let _fileExtension      = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length),
                        _fileExtensionCheck = false,
                        _fileSizeCheck      = false;
    
                    // if(_fileExtension !== 'undefined' && (_fileExtension == 'mp3' || (this.$store.getters.getCustomerInfo().customerId == 1 && _fileExtension === 'mp3' || _fileExtension === 'wav'))) {
                    if(_fileExtension !== 'undefined') {
                        _fileExtensionCheck = true;
                    } else {
                        _errorMsg.push(`${file.name}: ${this.$store.state.settings.dropbox.noaudiofile}`);
                    }
                    
                    if(file.size <= this.maxPromptFilesize) {
                        _fileSizeCheck      = true;
                    } else {
                        _errorMsg.push(`${file.name}: ${this.$store.state.settings.dropbox.filetolarge}`);
                    }
    
                    if(_fileExtensionCheck && _fileSizeCheck) {
                        this.loadAudioFile(file)
                        .then(result => {
                            this.thePrompt.PromptFiles.push({
                                LanguageCode		: this.getFirstAvailableLangCode(),
                                Location			: '',
                                PromptId			: this.thePrompt.Id,
                                Blob				: result,
                                FileName			: file.name.replace(/[/\\?%*:|"<>+\s]/g, '_')
                            })
                        }).catch(error => {
                            console.error(error);
                        });
                        if(this.thePrompt.Title == '') this.thePrompt.Title = file.name.replace(/[/\\?%*:|"<>\t\n\r]/g, '_').split('.')[0];
                    }
                });
    
                if(_errorMsg.length === 0) {
                    this.showSuccess        = true;
                } else {
                    this.errorAddtext       = _errorMsg.join(', ');
                    this.showSuccess        = false;
                    this.showError          = true;
                }
                
                this.showLoader(false);
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
            getFirstAvailableLangCode() {
                let _langcodeIndx = this.availableLangList.findIndex(lang => lang.isAvailable);
                return _langcodeIndx == -1 ? -1 : this.availableLangList[_langcodeIndx].code;
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
            },
        },
        mounted() {
            this.urlToSavePromptFile   = IPCCC.Settings.MediaStreamingURL;
            this.promptTypes           = this.$store.state.settings.promptuploader.prompttypes;
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
    
    <template>
        <div :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="prompts-uploader">
            <div id="detailscreen" class="detailscreen">
                <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
                <div class="grid-row">
                    <div class="grid-unit--alpha detailscreen-wrapper__title">
                    <span class="detailscreen__title">{{ showTitle }}</span>
                    </div>
                </div>
                <form @valid="savePrompt()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">
                    <input type="hidden" data-revalidate="" data-reset="" ref="validationcontrol">
                    <div class="grid-row">
                        <div class="grid-unit--beta grid-unit--beta-less-v-padding">
                            <div class="form-textfield form-textfield--bground">
                            <input type="text" id="formpromptname" v-model="thePrompt.Title" :placeholder="$store.state.settings.promptuploader.namelabel" :data-validate="validTitle" :data-message="$store.state.settings.promptuploader.validatepromptname">
                            <label for="formpromptname" name="formpromptname" class="form-label form-label--hidden">{{ $store.state.settings.promptuploader.namelabel }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.promptuploader.helptextname }}</div>
                            </div>
                        </div>
                        <div class="grid-unit--beta grid-unit--beta-less-v-padding">
                            <div class="form-selectfield form-selectfield--inline-bground form-selectfield--no-margin">
                            <label for="formtype" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.promptuploader.typelabel }}</label>
                            <select id="formtype" name="formtype" v-model="thePrompt.PromptType" :data-validate="regIsNotFive" :data-message="$store.state.settings.promptuploader.validateprompttype">
                                <option value="5" selected>{{ $store.state.settings.promptuploader.defaultselecttype }}</option>
                                <option v-for="(type, index) in promptTypes" :key="type" :value="index" :disabled="typeNotSupported(index)">{{ type }}</option>
                            </select>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.promptuploader.helptextprompttype }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--alpha grid-unit--alpha-less-v-padding">
                            <div class="form-textfield form-textfield--bground">
                            <input type="text" name="formdescription" id="formdescription" v-model="thePrompt.Description" :placeholder="$store.state.settings.promptuploader.descriptionlabel">
                            <label for="formdescription" class="form-label form-label--hidden">{{ $store.state.settings.promptuploader.descriptionlabel }}</label>
                            <div :class="['typo-helptext', {'typo-helptext--active' : (showHelp && visible)}]">{{ $store.state.settings.promptuploader.helptextdescription }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="grid-row">
                        <div class="grid-unit--alpha grid-unit--alpha-less-v-padding">
                            <div id="fileUploadForm" :class="['dropbox', 'dropbox--large', 'dropbox--no-margin', {'dropbox--has-advanced-upload' : advancedDragAndDrop}]">
                            <div class="dropbox__input">
                                <input type="file" name="file" id="file" class="dropbox__file" @change="handleFileBrowse($event)" ref="fileInputElement" multiple>
                                <label for="file">
                                <strong><u>{{ $store.state.settings.dropbox.choosefilelabel }}</u></strong>
                                <span class="dropbox__dragndrop">&nbsp;{{ $store.state.settings.dropbox.draglabel }}</span>.
                                </label>
                                <button class="dropbox__button" type="submit">{{ $store.state.settings.dropbox.uploadlabel }}</button>
                            </div>
                            <div v-show="showLoading" class="dropbox__uploading">{{ $store.state.settings.dropbox.uploadingtext }}&hellip;</div>
                            <div v-show="showSuccess" class="dropbox__success">{{ $store.state.settings.dropbox.finisheduploadtext }}&nbsp;{{ showFilenames }}</div>
                            <div v-show="showError" class="dropbox__error">{{ $store.state.settings.dropbox.erroruploadtxt }}&nbsp;<span>{{ errorAddtext }}</span>.</div>
                            </div>
                        </div>
                    </div>
    
                    <div v-if="thePrompt.PromptFiles.length > 0" class="grid-row" v-show="thePrompt.PromptFiles.length > 0">
                        <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.promptuploader.promptfilestitle }}</h2>
                    </div>
    
                    <div :class="['grid-row', {'grid-row--ishidden': promptFile.Action == 1}]" v-for="(promptFile, index) in thePrompt.PromptFiles" :key="index">
                        <div class="grid-unit--beta grid-unit--beta-less-v-padding">
                            <a class="button__icon button__icon--textfieldright button__icon-play--small" v-html="playerIcon.play" @click="playThePrompt($event, promptFile)"></a>
                            <div class="form-textfield form-textfield--btnleft form-textfield--bground">
                                <input readonly type="text" :name="'promptlocation' + index" :id="'promptlocation' + index" class="smaller-font" :value="getFileNameFromUrl(promptFile)" :placeholder="$store.state.settings.promptuploader.locationlabel" data-validate="isNotEmpty" :data-message="$store.state.settings.promptuploader.validatepromptfile">
                                <label :for="'promptlocation' + index" class="form-label form-label--hidden">{{ $store.state.settings.promptuploader.locationlabel }}</label>
                            </div>
                        </div>
                        <div class="grid-unit--beta grid-unit--beta-less-v-padding">
                            <div class="form-selectfield form-selectfield--btnright form-selectfield--margin-bottom">
                                <label :for="'languagecode' + index" class="form-label form-label--hidden form-label--lowered">{{ $store.state.settings.promptuploader.languagecodelabel }}</label>
                                <select v-if="availableLangList && availableLangList.length > 0" :id="'languagecode' + index" :name="'languagecode' + index" class="smaller-font" v-model="promptFile.LanguageCode" :data-validate="isNotMinusOne" :data-message="$store.state.settings.promptuploader.validatepromptlang">
                                    <option value="-1" selected>{{ $store.state.settings.promptuploader.defaultselectlanguage }}</option>
                                    <option v-for="prompt in availableLangList" :key="prompt.code" :value="prompt.code" :disabled="!prompt.isAvailable">{{ prompt.label }}</option>
                                </select>
                            </div>
                            <a class="button__icon button__icon--selectfieldleft button__icon-delete--small" @click="deletePromptAudioData(index, promptFile.Location)">&#xF1C0;</a>
                            <a v-if="promptFile.Location !== ''" class="button__icon button__icon--selectfieldleft button__icon-download--small" @click="downloadPromptAudioData(promptFile.PromptId, promptFile.LanguageCode)">&#xF1DA;</a>
                        </div>
                    </div>
                    
                </form> 
                <!-- BUTTONS -->
                <div class="detailscreen-footer detailscreen-footer--inside">
                    <span v-if="thePrompt.Id != -1">
                        <a class="button-primary button-primary--delete" @click="deletePrompt()">{{ $store.state.settings.promptuploader.deletebtnlbl }}</a>
                    </span>
                    <span class="grid--push">
                        <a class="button-primary button-primary--gray" @click="closePrompt()">{{ $store.state.settings.promptuploader.closebtnlbl }}</a>
                        <a class="button-primary js-submitbtn">{{ $store.state.settings.extensions.savebtnlbl }}</a>
                    </span>
                </div>
            </div>
        </div>
    </template>
    
    <style lang="scss" scoped>
    
    @use "@/scss/includes/globals";
    .form-selectfield select {
        option:disabled {
            color: globals.$color-gray60;
            background-color: transparent;
        }
    }
    
    </style>