<template>
    <div :class="['bulk-wrapper', {'bulk-wrapper--visable' : visibility}]" data-e2e="bulk-uploader">
        <!-- HEADER PANNEL -->
        <div class="bulk-header-wrapper">
            <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.usermanagement.searchtxt" @keyup="filterList()">
            </div>
            <div class="typo-tabletitle">
                {{totalUsers + " " + $store.state.settings.usermanagement.usercountlabel}}
            </div>
            <div class="bulk-header-uploadtitle">
                {{bulkisuser ? $store.state.settings.usermanagement.useruploadlabel : $store.state.settings.usermanagement.contactuploadlabel}}
            </div>
            <div class="form-button__secondary form-button__secondary--download grid--push">
                <button type="button" @click="downloadCSV()">{{ $store.state.settings.usermanagement.downloadlabel }}</button>
            </div>
        </div>
        <!-- LIST PANNEL -->
        <div class="bulk-list-wrapper">
            <div v-if="rawList.length === 0 && !isUploading" class="filedrop-wrapper">
                <FileDropper
                ref="dropper"
                @loaded="dataLoaded"
                />
            </div>
            <div v-else>
                <div class="bulk-list__row bulk-list__row--header">
                    <span v-for="(head, index) in headers" :key="index" :data-val="head" v-html="head.replace('(Ja/Nee)', '')" @click.stop="toggleCheckAll($event, head)" data-status="false" :class="addChkClass(head)" :ref="head.replace('(Ja/Nee)', '')"></span>
                </div>
                <div class="bulk-list__content">
                    <div v-for="(row, j) in listData" class="bulk-list__row" :data-rowid="row.rowId" :data-valid="row.errorType">
                        <span v-for="(prop, index) in headers" :key="j+index" :data-val="row[prop]" :data-hover="(row[prop].toString().toLowerCase() !== 'ja' && row[prop].toString().toLowerCase() !== 'nee')" class="bulk-field">

                        <input v-if="(row[prop].toString().toLowerCase() === 'ja' || row[prop].toString().toLowerCase() === 'nee')" type="checkbox" :name="'chk_' + index + j" :id="'chk_' + index + j" :checked="row[prop].toString().toLowerCase() === 'ja'" @change="mutateField($event, row.rowId, prop)" />
                        <label v-if="(row[prop].toString().toLowerCase() === 'ja' || row[prop].toString().toLowerCase() === 'nee')" :for="'chk_' + index + j"></label>

                        <div :data-val="row[prop]" :data-rowid="row.rowId" :data-prop="prop" :data-errors="setError(prop, row)" @click="mutateField($event, row.rowId, prop)">
                            {{ row[prop] }}
                        </div>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <!-- BUTTONS PANNEL -->
        <div class="bulk-footer-wrapper">
            <span>
                <a v-if="rawList.length !== 0" class="button-primary button-primary--clearlist" @click="clearData">{{ $store.state.settings.usermanagement.clearlabel }}</a>
            </span>
            <span class="grid--push">
                <a class="button-primary button-primary--gray" @click="cancelBulk()">{{ $store.state.settings.usermanagement.cancellabel }}</a>
                <a class="button-primary" @click="saveBulk()">{{ $store.state.settings.usermanagement.importlbl }}</a>
            </span>
        </div>
        <CellEditor
        :visibility="editorVisible"
        :data="editorData"
        :list="editorList"
        @oncancel="closeEditor"
        @onsave="editorOnSave"
        />
    </div>
</template>

<script>

  import FileDropper from '../uielements/FileDropper.vue';
  import CellEditor from './CellEditor.vue';
  import { IPCCCConfigurator } from './../../ipccc/js/configurator';
  import { deepCopy }                 from '../../use/helperFunctions';

  export default {
    name: 'BulkUploader',
    props : {
      visibility : {
        type : Boolean,
        default : false
      },
      headers : {
        type : Array,
        default : []
      },
      bulkisuser : {
        type : Boolean,
        default : true
      }
    },
    data: () => {
      return {
        isUploading : false,
        rawList : [],
        listData : [],
        editorVisible : false,
        editorData : {},
        editorList : [],
        editorListData : {},
        customerId : -1,
        totalUsers : 0,
        searchStr : '',
        // siteRoot  : siteroot,
        cacheList : [],
      }
    },
    inject: ['showLoader'],
    components: {
      FileDropper,
      CellEditor
    },
    computed: {
        searchProps() {
            return this.bulkisuser ?
                [ //User
                    'Achternaam',
                    'Afdeling',
                    'Callgroups',
                    'Bedrijfsnaam',
                    'Emailadres',
                    'EmployeeId',
                    'LoginID',
                    'MobielNummer',
                    'Rol',
                    'StartDatum',
                    'Supervisor(Ja/Nee)',
                    'Tussenvoegsel',
                    'VastNummer',
                    'VOIPbeschrijving',
                    'VOIPnummer',
                    'Voornaam',
                    'WebRTC'
                ] :
                [ //Contact
                    'Adres',
                    'Achternaam',
                    'Afdeling',
                    'Bedrijfsnaam',
                    'Emailadres',
                    'EmailadresLabel',
                    'Id',
                    'MobielNummer',
                    'Tussenvoegsel',
                    'VastNummer',
                    'Voornaam',
                    'Postcode',
                    'Woonplaats',
                    'Land'
                ];
        },
        downloadableTemplate() {
            return this.bulkisuser ? 'contactsuite_user_template.xlsx' : 'contactsuite_contact_template.xlsx';
        }
    },
    methods: {
        filterList(searchOnProps) {
            this.listData   = this.filterListOnString(this.rawList, this.searchStr.toLowerCase(), searchOnProps);
            this.totalUsers = this.listData.length;
        },
        filterListOnString(list, str, proplist = this.searchProps) {
            if(str != '' && proplist.length !== 0) {
                let _rawList = [...list];
                return _rawList.reduce((result, item) => {
                    proplist.every(p => {
                        if(String(item[p]).toLowerCase().indexOf(str) !== -1) {
                            result = result.concat(item);
                            return false;
                        } else {
                            return true;
                        }
                    });
                    return result;
                }, []);
            } else {
                return [...list];
            }
        },
        downloadCSV() {
            let _link           = document.createElement('a');
            _link.setAttribute('href', window.siteroot + 'assets/downloads/' + this.downloadableTemplate);
            _link.setAttribute('download', this.downloadableTemplate);
            _link.style.display = 'none';
            _link.target        = '_blank';

            document.body.appendChild(_link);
            _link.click();
        },
        addChkClass(head) {
            return (head.toString().toLowerCase() === 'supervisor(ja/nee)' || head.toLowerCase() === 'webrtc') ? 'chkHeader' : '';
        },
        toggleCheckAll(evt, prop) {
            let _status = evt.target.getAttribute('data-status')
            if(prop.toLowerCase() === 'supervisor(ja/nee)' || prop.toLowerCase() === 'webrtc') {
                this.listData.forEach(r => {
                    r[prop] = _status === 'true' ? 'Nee' : 'Ja';
                });
            };
            this.$forceUpdate();
            evt.target.setAttribute('data-status',  _status === 'true' ? 'false' : 'true');
        },
        updateBool(rowid, key, val) {
            let _rowToMutate = this.listData.find(row => row.rowId === rowid);

            if(_rowToMutate)
                _rowToMutate[key] = val;

        },
        updateTextField(val, rowid, prop) {
            if(this.editorListData[prop])
                this.editorList    = [...this.editorListData[prop]];

            this.editorData    = {val, rowid, prop};
            this.editorVisible = true;
        },
        editorOnSave(evt) {
            let _rowIndexToUpdate = this.listData.findIndex(r => parseInt(r.rowId) === parseInt(evt.data.rowid));

            if(_rowIndexToUpdate !== -1)
                this.rawList[_rowIndexToUpdate][evt.data.prop] = this.listData[_rowIndexToUpdate][evt.data.prop] = evt.data.val;

            if(evt.option === 'continueNumbering') {
                let count = 0;
                for(let i = _rowIndexToUpdate; i < this.listData.length ; i++) {
                    this.listData[i][evt.data.prop] = this.rawList[i][evt.data.prop] = (parseInt(evt.data.val) + count);
                    count++;
                }
            }

            if(evt.option === 'applyToAll') {
                this.listData.forEach(row => row[evt.data.prop] = evt.data.val);
                this.rawList.forEach(row => row[evt.data.prop] = evt.data.val);
            }

            this.editorVisible = false;
            this.editorData    = {};
        },
        closeEditor(evt) {
            this.editorVisible = false;
            this.editorData    = {};
        },
        checkRow(cell) {
            let _row        = cell.parentElement.parentElement;

            cell.setAttribute('data-errors', '');

            if(!Array.from(cell.querySelectorAll('div')).some(c => c.getAttribute('data-errors') !== '')) {
                _row.setAttribute('data-valid', '');
            }
        },
        mutateField(evt, rowid, prop) {
            // console.log('mutateField', prop);
            let _target = evt.target;

            if(_target.tagName.toLowerCase() === 'div') {
                let _val  = _target.getAttribute('data-val'),
                    _rowid   = _target.getAttribute('data-rowid'),
                    _prop = _target.getAttribute('data-prop');

                this.checkRow(_target);

                this.updateTextField(_val, _rowid, _prop);
            }

            if(_target.type?.toLowerCase() === 'checkbox') {
                this.updateBool(rowid, prop, _target.checked ? 'Ja' : 'Nee');
                if (this.bulkisuser) this.checkCheckAll();
            }
        },
        jsonToSave(jsondata) {
            let _data = deepCopy(jsondata);
            _data.forEach(user => {
                if(this.bulkisuser) {
                    user['Id'] = user['Id'] = -1;
                    user['Supervisor'] = user['Supervisor(Ja/Nee)'].toLowerCase() === 'ja' ? true : false;
                    delete user['Supervisor(Ja/Nee)'];
                    user['WebRTC']     = user['WebRTC'].toLowerCase() === 'ja' ? true : false;
                    let _date          = user['StartDatum'].split('-').reverse().join('/') + " UTC";
                    user['StartDatum'] = new Date(_date).toISOString();
                    user['Rol']        = user['Rol'] === "" ? -1 : parseInt(user['Rol']);
                    return user;
                } else {
                    user['Id'] = user['Id'] == -1 || user['Id'] == "" ? -1 : user['Id'];
                    delete user['Supervisor(Ja/Nee)'];
                    return user;
                }

            });
            return _data;
        },
        clearData() {
            this.isUploading = false;
            this.rawList     = this.listData = this.cacheList = [];
            this.totalUsers  = this.listData.length;
        },
        firstUserCheck(row, prop) {
            // console.log('row, prop: ', row, prop);
            if (!row.hasOwnProperty(prop))
                row[prop] = '';

            if ((prop === 'WebRTC' || prop === 'Supervisor(Ja/Nee)') && row[prop] === '')
                row[prop] = 'Nee';

            if ((prop === 'WebRTC' || prop === 'Supervisor(Ja/Nee)') && row[prop] !== '')
                row[prop] = row[prop].charAt(0).toUpperCase() + row[prop].slice(1);

            if (prop === 'LoginID' && row[prop] === '')
                row[prop] = row['Emailadres'].split('@')[0];

            if (prop === 'StartDatum' && row[prop] === '')
                row[prop] = new Date().toLocaleDateString("nl-NL");

            if (prop === 'StartDatum' && row[prop] !== '')
                row['StartDatum'] = row['StartDatum'].replace(/\//g, '-');

            return row;
        },
        firstContactCheck(row, prop) {
            // console.log('row, prop: ', row, prop);
            if(!row.hasOwnProperty(prop))
                row[prop] = '';

            return row;
        },
        updateColumns(data, headers) {
            // console.log('Uploaded data: ', data);
            return data.map((row, i) => {
                headers.forEach((prop, j) => {
                    row.rowId     = i;
                    row.errors    = [];
                    row.errorType = 0;

                    if(this.bulkisuser) {
                        row = this.firstUserCheck(row, prop);
                    } else {
                        row = this.firstContactCheck(row, prop);
                    }
                });
                return row;
            });
        },
        checkCheckAll() {
            this.$nextTick(() => {
                this.$refs['Supervisor'][0].setAttribute('data-status', !this.rawList.some(v => (v['Supervisor(Ja/Nee)'].toLowerCase() === 'nee')));
                this.$refs['WebRTC'][0].setAttribute('data-status', !this.rawList.some(v => (v['WebRTC'].toLowerCase() === 'nee')));
            });
        },
        dataLoaded(data) {
            this.$refs.dropper?.reset();
            this.rawList    = this.updateColumns(data, this.headers);
            this.filterList(this.searchProps);
            if (this.bulkisuser) this.checkCheckAll();
            this.showLoader(false);
        },
        cancelBulk() {
            this.$refs.dropper?.reset();
            this.rawList = [];
            this.$emit('oncancel');
        },
        saveBulk() {
            this.$refs.dropper?.reset();
            this.searchStr = '';
            this.filterList(this.searchProps);
            this.cacheList = deepCopy(this.listData);
            this.rawList = [] = this.listData;
            this.isUploading = true;
            this.$emit('onsave', this.jsonToSave(this.listData));
        },
            updateList(userId) {
            let _index   = this.cacheList.findIndex(u => parseInt(u.Id) === parseInt(userId));
            this.cacheList.splice(_index, 1);
            this.isUploading = this.cacheList.length > 0;
            this.rawList = deepCopy(this.cacheList);
            this.filterList(this.searchProps);
        },
        isFinished() {
            if (this.cacheList.length === 0) {
                this.$emit('oncancel');
            }
        },
        markErrors(listWithErrors) {
            // console.log('wanna show errors', listWithErrors);
            let _swap = deepCopy(listWithErrors);
            if (this.bulkisuser) {
                _swap.forEach(u => {
                    u['Supervisor(Ja/Nee)'] = u['Supervisor'];
                    delete u['Supervisor'];

                    u['Supervisor(Ja/Nee)'] = u['Supervisor(Ja/Nee)'] ? 'Ja' : 'Nee';
                    u['WebRTC']             = u['WebRTC']             ? 'Ja' : 'Nee';

                    if(u['Rol'] === -1)
                        u['Rol'] = '';

                    u['StartDatum']         = `${u['StartDatum'].substring(8, 10)}-${u['StartDatum'].substring(5, 7)}-${u['StartDatum'].substring(0, 4)}`;
                });
            }

            this.listData = _swap;
        },
        getErrorMessage(rowerrors, prop) {
            // ${(row.errors.find(f => f.Field.toLowerCase() === prop.toLowerCase())).Message}
            let _message = '';

            let _founderror = rowerrors.find(e => {
                if (e.Field.includes(';')) {
                    let _fields = e.Field.split(';');
                    if (_fields.some(f => f.toLowerCase() === prop.toLowerCase())) {
                        return e;
                    }
                } else {
                    if (e.Field.toLowerCase() === prop.toLowerCase()) {
                        return e;
                    }
                }
            });

            if (_founderror) {
                _message = _founderror.Message;
            }

            return _message;
        },
        testSetError(rowerrors, prop) {
            //find if prop is in Field (Field may be stringified array => Field : "VastNummer;MobielNummer;Emailadres")
            return rowerrors.some(e => {
                if (e.Field.includes(';')) {
                    let _fields = e.Field.split(';');

                    return _fields.some(e => e.toLowerCase() === prop.toLowerCase());
                } else {
                    return e.Field.toLowerCase() === prop.toLowerCase();
                }
            });
        },
        setError(prop, row) {
            if (row && row.errors && row.errors.length === 0) {
                return '';
            }

            if (row && row.errors && this.testSetError(row.errors, prop)) {
                // console.log('has error: ', this.getErrorMessage(row.errors, prop));
                return row.errors.length > 0 ? 'Error: ' + this.getErrorMessage(row.errors, prop) : '';
            }

            // if(row && row.errors && row.errors.some(e => e.Field.toLowerCase() === prop.toLowerCase())) {
            //     return row.errors.length > 0 ? `Error: ${(row.errors.find(f => f.Field.toLowerCase() === prop.toLowerCase())).Message}` : '';
            // }
        },
        getData() {
            IPCCCConfigurator.Request(this.selectedCustomerId, 'routinggroup', 'list', null, -1)
            .then(response => {
                this.editorListData.Callgroups = [...response];
                IPCCCConfigurator.Request(this.selectedCustomerId, 'role', 'list', null, -1).then(response => {
                    this.editorListData.Rol = [...response];
                    IPCCCConfigurator.Request(this.selectedCustomerId, 'department', 'list', null, -1).then(response => {
                        this.editorListData.Afdeling = [...response];
                        this.showLoader(false);
                    }).catch(error => {
                        console.error("Error: getting departments");
                        this.showLoader(false);
                    });
                }).catch(error => {
                    console.error("Error: getting roles");
                    this.showLoader(false);
                });
            })
            .catch(error => {
                console.error("Error: getting routinggroups");
                this.showLoader(false);
            });
        },
    },
    mounted() {
        this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;
        this.getData();
        this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
            if(cObj.selectedCustomerId != -1) {
                this.selectedCustomerId   = cObj.selectedCustomerId;
                this.getData();
            }
        });
    }
}
</script>

<style lang="scss" scoped>

@use "@/scss/includes/globals";
@use "@/scss/includes/functions";

.button-primary.button-primary--gray {
    margin-right: 10px;
}

.bulk-wrapper {
    position: absolute;
    top: 100%;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: linear-gradient(#FAFAFA, #FAFAFA 160px, #F2F2F2 160px, #F2F2F2);
    overflow: hidden;
    &--visable {
      top: 0;
    }
    z-index: 100;
}

.bulk-header-wrapper,
.bulk-list-wrapper,
.bulk-footer-wrapper {
    position: absolute;
    right: 25px;
    left: 25px;
    border-radius: 3px;
    border: 1px solid globals.$color-gray20;
    background-color: globals.$color-white;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, .05);
}

.bulk-header-wrapper {
    top: 20px;
    height: 80px;
    box-shadow: none;
    border: none;
    background-color: transparent;

    .bulk-header-uploadtitle {
        position: absolute;
        transform: translateX(-50%);
        left: 50%;
        width: auto;
        margin-top: 1.2rem;
        line-height: 40px;
        font-weight: bold;
        color: globals.$color-gray80;
    }
}

.bulk-list-wrapper {
    top: 115px;
    bottom: 75px;
    & > div {
        padding-right: 14px;
        background-color: globals.$color-gray5;
    }
}

.bulk-footer-wrapper {
    bottom: 10px;
    height: 50px;
    padding: 15px 10px;
}

.filedrop-wrapper {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}


.bulk-list__row,
.bulk-list__row--header {
    width: 100%;
    height: 40px;
    line-height: 40px;
    display: flex;
    align-content: flex-start;
    justify-content: space-between;
    span {
        //   flex-basis: 7.14%;
        flex-basis: 6%;
        position: relative;
        display: block;
        //   float: left;
        height: 40px;
        line-height: 40px;
        color: globals.$color-gray60;
        font-size: .85em;
        padding: 0 3px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        user-select: none !important;
    }
    span:first-of-type {
        flex-basis: 80px;
    }
}

.bulk-list__row {
    span:after {
        content: attr(data-val);
        position: absolute;
        top: 0;
        left: 0;
        width: auto;
        height: 40px;
        line-height: 40px;
        padding: 0 10px 0 5px;
        display: none;
        z-index: 10;
        background-color: globals.$color-white;
        color: globals.$color-black;
        //box-shadow: 0 2px 3px 0 rgba(0,0,0,.1);
        pointer-events: none;
    }
    span[data-hover="true"]:hover {
        overflow: visible;
        &:after {
            display: block;
            background-color: functions.tint(globals.$color-gray20, 80%);
        }
    }
    span[data-hover="false"]:hover {
        overflow: hidden;
    }
    &:nth-child(even) span:after {
      background-color: globals.$color-gray5;
    }
}

.bulk-list__row--header {
    background-color: globals.$color-gray5;
    border-bottom: 1px solid globals.$color-gray20;
    span:after {
      background-color: globals.$color-gray5;
      border-bottom: 1px solid globals.$color-gray20;
      height: 39px;
    }
}

.chkHeader {
    cursor: pointer;
    &:before {
        content: "\F12E";
        //   float: left;
        width: 25px;
        height: 30px;
        display: inline-block;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 22px;
        height: 40px;
        line-height: 40px;
        color: globals.$color-gray10;
    }
}

.chkHeader[data-status='true']:before {
    content: "\F132";
    color: globals.$color-secondary;
}

.bulk-list__content {
    position: absolute;
    top: 40px;
    right: 0;
    bottom: 0;
    left: 0;
    overflow-y: overlay;
    padding-right: 14px;
    div:nth-child(even) {
        position: relative;
        background-color: globals.$color-gray5;
        &:after {
            content: '';
            position: absolute;
            left: 100%;
            top: 0;
            height: 40px;
            width: 14px;
            background-color: globals.$color-gray5;
        }
    }
}

.bulk-field {
    div {
        height: 40px;
        background-color: transparent;
        border: none;
        cursor: pointer;
        margin-left: -3px;
        margin-right: -3px;
        padding: 0 5px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        &:hover {
            background-color: functions.tint(globals.$color-gray20, 80%);
        }
    }
    input[type=checkbox] {
        position: absolute;
        left: 0;
        visibility: hidden;
        z-index: 10;
        width: 30px;
    }
    label {
        display: inline-block;
        cursor: pointer;
        position: relative;
        user-select: none;
        width: 100%;
        height: 40px;
        &:before {
            content: "\F12E";
            width: 30px;
            display: inline-block;
            font-family: 'Material Design Icons';
            font-weight: normal;
            font-style: normal;
            font-size: 22px;
            height: 40px;
            line-height: 40px;
            color: globals.$color-gray10;
        }
    }
    input[type=checkbox]:checked + label:before {
        content: "\F132";
        color: globals.$color-secondary;
        text-shadow: none;
    }
}

[data-valid="1"] {
    & > span {
        pointer-events: none;
        user-select: none;
        color: globals.$color-gray20;
        input[type=checkbox] + label:before {
            opacity: .3;
        }
    }
    border-left: 5px solid globals.$color-unavailable
}

[data-valid="2"] {
    border-left: 5px solid globals.$color-orange;
}

[data-errors^="Error"] {
    font-weight: bold;
    color: globals.$color-orange;
    box-shadow: inset 0 -2px 0 0 globals.$color-orange;
}

[data-errors]:after {
    content: attr(data-errors);
    position: absolute;
    top: calc(100% - 5px);
    left: 10px;
    width: auto;
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    display: none;
    z-index: 50;
    background-color: globals.$color-unavailable;
    color: globals.$color-white;
    box-shadow: 0 2px 3px 0 rgba(0,0,0,.2);
    border-radius: 0 5px 5px 5px;
    pointer-events: none;
}

[data-hover]:not([data-hover=""]):hover {
    overflow: visible;
    [data-errors^="Error"]:after {
        font-weight: bold;
        display: block;
    }
}

</style>
