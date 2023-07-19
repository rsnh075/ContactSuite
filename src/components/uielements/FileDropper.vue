<template>
    <div :class="['dropzone', {'dropzone--dropit' : onHover}]" @drop="handleDrop($event)" ref="dropArea" data-e2e="file-dropper">
        <form method="post" enctype="multipart/form-data">
            <input class="dropzone__input" type="file" name="file" id="file" multiple @change="handleFileBrowse($event)"/>
            <label class="dropzone__button" for="file"><span>&#xFA4D;</span>{{ $store.state.settings.usermanagement.uploadbtnlbl }}</label>
            <div class="dropzone__msg" v-html="feedbackMsg"></div>
        </form>
    </div>
</template>

<script>

import { read, utils } from 'xlsx';
import { currentLocalDateTimeISO }  from '../../use/dateFunctions';

export default {
    name: 'FileDropper',
    props: [],
    data() {
      return {
        convertedData : [],
        feedbackMsg : '',
        onHover : false
      }
    },
    inject: ['showLoader'],
    methods: {
        excelToJSON(data) {
            if(Array.isArray(data) && data.length > 0) {
                let _data = [];

                _data = data.reduce((acc, oldObj) => {
                    let newObject = {};
                    Object.keys(oldObj).forEach(oldKey => {
                        let newKey = oldKey.toString().replace(/\s+/g, ""); // remove whitespace
                        newObject[newKey] = oldObj[oldKey];
                    });
                    acc.push(newObject);
                    return acc;
                }, []);
                this.convertedData = _data;
            } else {
                this.convertedData = data;
            }

            this.reset();

            if(this.convertedData.length !== 0) {
                if (window.debugState) console.log('[' + currentLocalDateTimeISO() + '] convertedData: ' + this.convertedData);
                this.$emit('loaded', this.convertedData);
            } else {
                this.handleFeedBack('norows', this.$store.state.settings.usermanagement.empthyfileerror);
                this.showLoader(false);
            }
        },
        reset() {
            this.onHover     = false;
            this.feedbackMsg = '';
        },
        handleFeedBack(type, text = '') {
            switch(type) {
            case 'error':
                this.feedbackMsg = `${this.$store.state.settings.usermanagement.erroruploadtxt}`;
                break;
            case 'loading':
                this.feedbackMsg = `${this.$store.state.settings.usermanagement.uploadingtext} ${text}`;
                break;
                case 'norows':
                this.feedbackMsg = `${text}`;
                break;
            }
        },
        handlePrevent(evt) {
            evt.preventDefault();
            evt.stopPropagation();
        },
        handleHover(evt) {
            this.feedbackMsg = '';
            this.onHover = evt.type === 'dragover';
        },
        handleDrop(evt) {
            this.showLoader(true);
            this.onHover = false;
            const _data  = evt.dataTransfer;
            const _files = _data.files;
            this.checkExcelFile(_files[0]);
        },
        handleFileBrowse(e) {
            let _files = e.target.files;
            this.showLoader(true);
            this.checkExcelFile(_files[0]);
        },
        async checkExcelFile(excelFile) {
            this.handleFeedBack('loading');
            let _fileExtension = excelFile.name.split('.').pop();
            if ( _fileExtension && ( _fileExtension === 'xlsx' || _fileExtension === 'xls' || _fileExtension === 'csv')) {
                try {
                    const f = await excelFile.arrayBuffer();
                    const workbook = read(f);
                    const data = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {defval: ""});
                    this.excelToJSON(data);
                } catch (err) {
                    console.error(err);
                    this.handleFeedBack('error', err);
                    this.showLoader(false);
                }
            }
            else {
                this.handleFeedBack('error', 'No CSV file');
                this.showLoader(false);
            }
        },
    },
    mounted() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.$refs.dropArea.addEventListener(eventName, this.handlePrevent, false);
        });

        this.$refs.dropArea.addEventListener('dragover', this.handleHover, false);
        this.$refs.dropArea.addEventListener('dragleave', this.handleHover, false);
    },
    beforeUnmount() {
        this.$refs.dropArea.removeEventListener('dragover', this.handleHover, false);
        this.$refs.dropArea.removeEventListener('dragleave', this.handleHover, false);
    },
}
</script>

<style lang="scss" scoped>

@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.dropzone {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(100,150,100,0.3);
    &:before {
        content: '';
        position: absolute;
        top: 30px;
        right: 30px;
        bottom: 30px;
        left: 30px;
        border-radius: 20px;
        border: 3px dashed globals.$color-white;
        transition: all .25s ease-in-out;
    }
    &--dropit {
        background-color: rgba(100,150,100,0.4);
        &:before {
            border-radius: 60px;
            //border: 3px dashed globals.$color-green;
        }
        .dropzone__button {
            opacity: .5;
        }
    }
}

.dropzone__msg {
    position: absolute;
    left: 0;
    width: 100%;
    top: 25%;
    font-size: 1.3em;
    color: globals.$color-unavailable;
    text-shadow: 0 0 2px globals.$color-white,
                 0 0 4px globals.$color-white,
                 0 0 8px globals.$color-white,
                 0 0 12px globals.$color-white,
                 0 0 14px globals.$color-white;
    font-weight: bold;
    text-align: center;
    &:empty {
        display: none;
    }
}

.dropzone__input {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
}

.dropzone__button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: auto;
    height: 45px;
    line-height: 45px;
    color: globals.$color-white;
    background-color: globals.$color-green;
    box-shadow: 0 0 40px 0 rgba(0,0,0,.2);
    border-radius: 3px;
    padding: 0 20px 0 15px;
    cursor: pointer;
    span {
        float: left;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 1.4em;
        padding-right: 8px;
    }


    // height: 38px;
    // line-height: 38px;
    // width: 100%;
    // border: none;
    // border-bottom: 1px solid globals.$color-gray35;
    // box-shadow: inset 0 -40px 0px 0px rgba(0,0,0,.025);
    // padding-left: 3px;
    // resize:none;
    // color: globals.$color-gray60;
    // font-size: 1rem;
}

// .dropzone__uploadfile-button,
// .form-input-button {
//   position: relative;
//   width: 300px;
//   height: 50px;
//   line-height: 50px;
//   overflow: hidden;
//   margin-top: 10px;
//   .form-uploadfile-a,
//   label {
//     position: absolute;
//     left: 0;
//     top: 5px;
//     width: 100%;
//     height: 40px;
//     line-height: 40px;
//     background-color: globals.$color-orange;
//     color: globals.$color-white;
//     text-decoration: none;
//     text-align: center;
//     border-radius: 3px;
//     box-shadow: 0 2px 4px 0 rgba(0,0,0,.2);
//     transition: top .18s ease-in-out;
//     cursor: pointer;
//     &--disabled {
//       opacity: .5;
//       pointer-events: none;
//     }
//   }
//   input {
//     @include font-normal();
//     height: 38px;
//     line-height: 38px;
//     width: 100%;
//     border: none;
//     border-bottom: 1px solid globals.$color-gray35;
//     box-shadow: inset 0 -40px 0px 0px rgba(0,0,0,.025);
//     padding-left: 3px;
//     resize:none;
//     color: globals.$color-gray60;
//     font-size: 1rem;
//   }
//   .button__close {
//     left: auto;
//     right: 0px;
//   }
//   &--active {
//     label {
//       top: -45px;
//     }
//   }
//   &--disabled {
//     opacity: .5;
//     pointer-events: none;
//   }
// }

</style>
