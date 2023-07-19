<template>
    <div data-e2e="code-list-list">
        <ContextMenu
        :visability  = "contextMenuVisability"
        :position    = "contextPosition"
        :itemList    = "contextMenuItems"
        @mouseisout  = "contextMenu"
        >
            <template v-slot="{ row }">
                <div class="context-item" @click="handleContextAction(row.eventtype)">
                    <span v-if="row.icon !== ''" class="context-item__icon" v-html="'&#x' + row.icon"></span>
                    <span :class="['context-item__label', {'context-item__label--header' : row.eventtype === 'null'}]">{{ row.label }}</span>
                </div>
            </template>
        </ContextMenu>
        <CsvUploader
        :visible="showCsvUploader"
        :detailid="csvDetailId"
        :detailname="csvDetailName"
        :customerid="selectedCustomerId"
        :examplecsvname="exampleCsvName"
        :closecsvuploader="closeCsvUploader"
        @closecsvuploader="closeCsvUploaderFn"
        @savecsv="saveCsv"
        >
            <div class="grid-row">
                <div class="grid-unit--alpha">
                    <label class="form-label form-label--list-inline">{{ $store.state.settings.codelist.formoverwritelbl }}</label>
                    <div class="form-radio-small form-radio-small--inline">
                        <input type="radio" id="overwrite_false" v-model="dummyCsvOverWrite" value="off" @click="updateAvailability">
                        <label for="overwrite_false">{{ $store.state.settings.codelist.formoverwritefalselbl }}</label>
                    </div>
                    <div class="form-radio-small form-radio-small--inline">
                        <input type="radio" id="overwrite_true" v-model="dummyCsvOverWrite" value="on" @click="updateAvailability">
                        <label for="overwrite_true">{{ $store.state.settings.codelist.formoverwritetruelbl }}</label>
                    </div>
                </div>
            </div>
        </CsvUploader>
        <!-- LIST SCREEN -->
        <div class="list-wrapper">
            <div class="list-topbar">
                <div class="list-topbar__content">
                    <div class="form-textfield form-textfield--search form-textfield--search-on-gray-small">
                        <input type="text" id="search" v-model="searchStr" :placeholder="$store.state.settings.codelist.searchtxt" @keyup="filterList()">
                    </div>
                    <div class="typo-tabletitle">
                        {{ totalDetails + " " + $store.state.settings.codelist.countlabel }}
                    </div>
                    <div class="grid--push">
                        <div class="form-button__secondary form-button__secondary--add grid--push">
                        <button type="button" @click="addDetail()">{{ $store.state.settings.codelist.adddetail }}</button>
                        </div>
                    </div>
                </div>
            </div>
            <ListViewer
                :headerprops="headerprops"
                :listdata="list"
                :hascontextmenu="hasContextMenu"
                @rowclick="showDetail"
                @contextmenuclick="contextMenu"
            />
        </div>

        <!-- Destination POPUP -->
        <CodelistDetail
            :visible="detailStatus"
            :dataDetail="dataDetail"
            :selectedId="selectedId"
            @close="closeDetail"
            @save="saveDetail"
            @delete="deleteDetail"
        />

    </div>
</template>

<script>
/**
 *
 * @author Erik Rosenhart <rsnh075@gmail.com>
 *
 * @version 1.0
 *
 * @todo
 *
 */

import ContextMenu         from './../v2_components/ContextMenu.vue';
import CsvUploader         from './../uielements/CsvUpLoader.vue';
import BoxProps, { ModalType } from '../../types/BoxProps';
import ListViewer          from './../uielements/ListViewer.vue';
import CodelistDetail      from './CodelistDetail.vue';
import { scrollTo }        from './../../use/helperFunctions';
import { dynamicSort }     from '../../use/sortFunctions';
import { IPCCCConfigurator } from "../../ipccc/js/configurator";

export default {
    name: 'CodelistList',
    data() {
        return {
            selectedCustomerId         : -1,
            searchStr                  : '',
            sortSetting                : {},
            headerprops                : [],
            rawList                    : [],
            list                       : [],
            totalDetails               : null,
            detailStatus               : false,
            dataDetail                 : null,
            selectedId                 : -1,
            selectedTitle              : '',
            storeWatch                 : null,

            hasContextMenu             : true,
            contextMenuVisability      : false,
            contextPosition            : {
                x : 0,
                y : 0,
            },
            contextMenuItems           : [],
            currentId                  : -1,
            csvDetailId                : -1,
            csvDetailName              : '',
            showCsvUploader            : false,
            closeCsvUploader           : false,
            dummyCsvOverWrite          : 'off',
            exampleCsvName             : 'contactsuite_codelist_example.csv',
        }
    },
    inject: ['showLoader', 'showModalDialog'],
    components: {
        ListViewer,
        CodelistDetail,
        ContextMenu,
        CsvUploader,
    },
    computed: {
        csvOverWrite() { return this.dummyCsvOverWrite == 'on' },
    },
    methods: {
        isClickable(id) {
            return Math.sign(id) != -1 ? 'clickable' : 'not-clickable';
        },
        getDataList() {
            IPCCCConfigurator.Request(this.selectedCustomerId, 'codelist', 'list', null, -1).then(result => {
            this.rawList       = [...result];
            this.list          = [...this.rawList];
            this.totalDetails  = this.list.length;
            this.showLoader(false);
            this.defaultSortOrder();
        }).catch(error => {
            console.error('Error: ' + error);
            this.showLoader(false);
        });
        },
        getDataDetail(dataOp) {
            return new Promise((resolve, reject) => {
                let _absoluteSelectedId = this.selectedId;
                IPCCCConfigurator.Request(this.selectedCustomerId, 'codelist', dataOp, this.dataDetail, _absoluteSelectedId).then(result => {
                    this.showLoader(false);
                    if(Array.isArray(result))
                        result = result[0];
                    resolve(result);
                }).catch(error => {
                    this.showLoader(false);
                    reject(console.error('Error: ' + error));
                });
            });
        },
        showDetail(id) {
            this.showLoader(true);
            this.selectedId      = id;
            this.dataDetail      = null;
            this.getDataDetail('readone').then(result => {
                this.dataDetail    = Object.assign({}, result);
                this.detailStatus = true;
            });
        },
        addDetail() {
            this.showLoader(true);
            this.selectedId      = -1;
            this.getDataDetail('readnew').then(result => {
                this.dataDetail = Object.assign({}, result);
                if (!this.dataDetail.Codes) {
                    this.dataDetail.Codes = [];
                }
                this.detailStatus = true;
            });
        },
        deleteDetail(data) {
            this.showLoader(true);
            this.selectedId = data.Id;
            this.dataDetail = data;
            this.getDataDetail('delete').then(result => {
                let _indexToDelete = this.rawList.findIndex(detail => detail.Id === data.Id);
                this.rawList.splice(_indexToDelete, 1);
                this.list          = [...this.rawList];
                this.closeDetail();
                this.filterList();
            });
        },
        saveDetail(data) {
            this.showLoader(true);
            this.dataDetail = data;
            this.selectedId = data.Id;
            this.getDataDetail('save').then(result => {
                this.closeDetail();
                this.updateList(result);
            });
        },
        closeDetail() {
            this.dataDetail      = null;
            this.detailStatus    = false;
            this.selectedId      = -1;
        },
        //=========================================================== START DISPLAY LIST METHODS
        updateList(data) {
            let _IndexToSave  = -1;
            this.totalDetails = 0;
            this.rawList.map((detail, index) => {
                if(detail.Id == data.Id) {
                _IndexToSave = index;
                }
            });
            if(_IndexToSave == -1)
                this.rawList.push(data);
            else
                this.rawList[_IndexToSave] = data;

            this.list         = [...this.rawList];
            this.totalDetails = this.list.length;

            this.filterList();
            if(this.list.findIndex(detail => detail.Id === data.Id) != -1) {
                setTimeout(() => {
                this.setHighlightedRow(data.Id);
                }, 500);
            }
            this.showLoader(false);
        },
        filterList() {
            this.list         = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
            this.totalDetails = this.list.length;
            this.sortColumn();
        },
        filterListOnString(list, str) {
            if(str != '') {
                let _rawList = [...list],
                    _keys;
                return _rawList.filter(item => {
                _keys = item['Name'].toLowerCase().indexOf(str) != -1 ||
                    item['Description'].toLowerCase().indexOf(str) != -1
                return _keys;
                });
            } else {
                return [...list];
            }
        },
        defaultSortOrder() {
            this.sortSetting.order    = 'NONE';
            this.sortSetting.key      = 'Name';
            this.sortColumn();
        },
        sortColumn(key, e = null) {
            let _order,
                _t;
            this.setHighlightedRow(-2);

            if(e != null) {
                _t     = e.target;
                _order = _t.getAttribute('data-sortOrder');
                document.querySelectorAll('.list-content__row--header > span').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
                this.sortSetting = {
                'key': key,
                'order' : _order
                }
            } else {
                _order = this.sortSetting.order;
                key    = this.sortSetting.key;
            }

            switch(_order) {
                case 'NONE':
                this.list.sort(dynamicSort(key));
                if(e != null)
                    _t.setAttribute('data-sortOrder', 'ASC');
                break;
                case 'ASC':
                this.list.sort(dynamicSort('-' + key));
                if(e != null)
                    _t.setAttribute('data-sortOrder', 'DES');
                break;
                case 'DES':
                this.list = this.filterListOnString(this.rawList, this.searchStr.toLowerCase());
                this.totalDetails = this.list.length;
                if(e != null)
                    _t.setAttribute('data-sortOrder', 'NONE');
                break;
            }
        },
        setHighlightedRow(id) {
            let _wrapper = null;
            document.querySelectorAll('[data-id]').forEach(el => {
                _wrapper = el.parentElement.parentElement;
                if (el.getAttribute('data-id') == id) {
                el.classList.add('list-content__row--mutated');
                scrollTo(_wrapper, (el.offsetTop - el.offsetHeight), 300);
                } else
                el.classList.remove('list-content__row--mutated');
            });
            if(id == -2 && _wrapper !== null)
                scrollTo(_wrapper, 0, 200);
        },
        //CONTECTMENU
        contextMenu(evt, codelistid = -1) {
            if(evt.type.toLowerCase() === 'mouseisout') {
                this.currentId                 = -1;
                this.contextMenuVisability     = false;
            } else {
                this.currentId                 = codelistid;
                this.contextMenuVisability     = true;
                this.contextPosition           = {
                                                    x : evt.clientX - 145,
                                                    y : evt.clientY,
                                                };
            }
        },
        handleContextAction(eventType) {
            switch(eventType) {
            case 'csvupload':
                this.csvDetailId = JSON.parse(JSON.stringify(this.currentId));
                this.csvDetailName = this.rawList.filter(el => el.Id == this.csvDetailId)[0].Name;
                this.showCsvUploader = true;
                this.contextMenuVisability = false;
                break;
            default:
                return false;
            }
        },
        closeCsvUploaderFn() {
            this.csvDetailName = '';
            this.csvDetailId = -1;
            this.dummyCsvOverWrite = 'off';
            this.showCsvUploader = false;
        },
        saveCsv(csvfilename) {
            let _dataObject = {
                FileName    : csvfilename,
                CodeListId  : this.csvDetailId,
                Overwrite   : this.csvOverWrite,
            }
            IPCCCConfigurator.Request(this.selectedCustomerId, 'codelist', 'upload', _dataObject, null)
            .then(result => {
                this.showModalDialog(new BoxProps(ModalType.Generic, this.$store.state.settings.dialog.dialogalertheader, (
                    this.$store.state.settings.csvuploader.createdrows + ' ' + result.Created + '\n' +
                    this.$store.state.settings.csvuploader.updatedrows + ' ' + result.Updated + '\n' +
                    this.$store.state.settings.csvuploader.totalrows + ' ' + result.Total
                )));
                this.closeCsvUploaderFn();
                this.showLoader(false);
            })
            .catch(error => {
                this.showLoader(false);
                console.error('Error: ' + error);
                this.showModalDialog(new BoxProps(ModalType.Alert, 'Error!', error));
                this.closeCsvUploaderFn();
            });
        },
  },
  created() {
      this.contextMenuItems = [
        {
          icon      : '',
          label     : this.$store.state.settings.codelist.contextlistheaders[0],
          eventtype : 'null',
          active    : true,
        }, {
          icon      : 'F552',
          label     : this.$store.state.settings.codelist.contextlistheaders[1],
          eventtype : 'csvupload',
          active    : true,
        }
      ];
    },
  mounted() {
    this.headerprops = [
        {
          label    : this.$store.state.settings.codelist.listheaders[0],
          width    : 30,
          dataprop : 'Name',
          sortprop : 'Name'
        },{
          label    : this.$store.state.settings.codelist.listheaders[1],
          width    : 70,
          dataprop : 'Description',
          sortprop : 'Description'
        }
      ],
    this.selectedCustomerId = this.$store.getters.getCustomerInfo().selectedCustomerId;

    if(this.selectedCustomerId !== -1)
        this.getDataList();

    this.storeWatch = this.$store.watch(this.$store.getters.getCustomerInfo, cObj => {
        this.showLoader(true);
        this.selectedCustomerId   = cObj.selectedCustomerId;
        this.closeDetail();
        this.getDataList();
    });
  },
  beforeUnmount() {
    this.storeWatch();
  }
}
</script>

<style lang="scss" scoped>

@use "@/scss/includes/functions" as fn;
@use "@/scss/includes/globals";

.vlist__cell--contextmenu {
    position: absolute;
    top: 1px;
    right: 2px;
    width: 43px;
    height: 43px;
    font-family: 'Material Design Icons';
    border-radius: 50%;
    text-align: center;
    color: globals.$color-gray35;
    cursor: pointer;
    &:hover {
        background-color: globals.$color-gray5;
        color: globals.$color-performance;
    }
}

.context-item {
    height: 40px;
    line-height: 40px;
    padding: 0 30px 0 20px;
    cursor: pointer;
    &:hover {
        background-color: globals.$color-gray5;
    }
    &__icon {
        margin-right: 5px;
        font-family: 'Material Design Icons';
        font-weight: normal;
        font-style: normal;
        color: globals.$color-gray60;
    }
    &__label {
        padding-right: 10px;
        font-size: .9em;
        color: globals.$color-gray60;
        &--header {
            font-family: 'Open Sans Bold', sans-serif;
        }
    }
}

</style>