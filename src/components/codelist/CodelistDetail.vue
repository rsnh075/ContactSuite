<template>
    <div v-if="visible" :class="['detailscreen-wrapper', {'detailscreen-wrapper--visable' : visible}]" data-e2e="code-list-detail">
        <div id="detailscreen" class="detailscreen">
            <a :class="['button-help', {'button-help--active' : showHelp}]" @click="displayHelp">?</a>
            <div class="grid-row">
                <div class="grid-unit--alpha detailscreen-wrapper__title">
                    <span class="detailscreen__title">{{ showTitle }}</span>
                </div>
            </div>
            <form @valid="saveDetail()" @notvalid="shakeIt()" v-validate="{'submitBtns' : 'js-submitbtn'}">

                <div class="grid-row">
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input :disabled="readonly" type="text" name="detailName" id="detailName" v-model="datadetail.Name" :placeholder="$store.state.settings.codelist.nameplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.codelist.validatename">
                            <label for="detailName" class="form-label form-label--hidden">{{ $store.state.settings.codelist.formname }}</label>
                            <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.codelist.helptextname }}</div>
                        </div>
                    </div>
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--bground">
                            <input :disabled="readonly" type="text" name="formdescription" id="formdescription" v-model="datadetail.Description" :placeholder="$store.state.settings.codelist.descriptionplaceholder" data-validate="isNotEmpty" :data-message="$store.state.settings.codelist.validatedescription">
                            <label for="formdescription" class="form-label form-label--hidden">{{ $store.state.settings.codelist.formdescription }}</label>
                            <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.codelist.helptextdescription }}</div>
                        </div>
                    </div>
                </div>
                <div class="grid-row">
                    <h2 class="detailscreen__fieldsetheader">{{ $store.state.settings.codelist.headerresults }}
                        <button type="button" class="list-number-header__button--add" @click="addCode($event, 'btn')">{{ $store.state.settings.codelist.addlblresult }}</button>
                    </h2>
                </div>
                <div class="grid-row grid-row--less-padding">
                    <div class="grid-unit--beta">
                        <div class="form-textfield form-textfield--search form-textfield--search-on-white">
                            <input type="text" v-model="searchStrDetail" :placeholder="$store.state.settings.codelist.searchtxtdetail" @keyup="filterList()">
                        </div>
                    </div>
                    <div class="grid-unit--beta"></div>
                </div>
                <div class="grid-row">
                    <div class="grid-unit--alpha">
                        <div class="list-number-header list-number-header--comp-scrollbar">
                            <span class="list-number-header__field list-number-header__field--25width" @click="sortColumn('From', $event)" data-sortorder="NONE">{{ $store.state.settings.codelist.codelistcollheads[0] }}</span>
                            <span class="list-number-header__field list-number-header__field--25width" @click="sortColumn('Till', $event)" data-sortorder="NONE">{{ $store.state.settings.codelist.codelistcollheads[1] }}</span>
                            <span class="list-number-header__field list-number-header__field--50width" @click="sortColumn('Code', $event)" data-sortorder="NONE">{{ $store.state.settings.codelist.codelistcollheads[2] }}</span>
                        </div>
                        <VirtualListViewer class="list-number-wrapper" ref="codelistwrapper"
                        :data      = "datadetail.Codes"
                        rowClasses = ""
                        >
                            <template v-slot="{ row }" >
                                <div class="list-number-line list-number-line--nohandle" :ref="'row' + row.rawCodeIndex">
                                    <input type="text" v-model="row.From" @keyup="updateRawCodes('From', row.From, row.rawCodeIndex)" class="list-number-line__field list-number-line__field--25width" :placeholder="$store.state.settings.codelist.codelistcollheads[0]" :disabled="!row.iseditable">
                                    <input type="text" v-model="row.Till" @keyup="updateRawCodes('Till', row.Till, row.rawCodeIndex)" class="list-number-line__field list-number-line__field--25width" :placeholder="$store.state.settings.codelist.codelistcollheads[1]" :disabled="!row.iseditable">
                                    <input type="text" v-model="row.Code" @keyup="updateRawCodes('Code', row.Code, row.rawCodeIndex)" @keydown="addCode($event, 'blur')" class="list-number-line__field list-number-line__field--33width" :placeholder="$store.state.settings.codelist.codelistcollheads[2]" :disabled="!row.iseditable">
                                    <span class="list-number--icon">
                                        <a :class="['button__icon button__icon--edit', {'button__icon--active' : row.iseditable}]" @click="editCode(row.rawCodeIndex)">&#xF3EB;</a>
                                        <a class="button__icon button__icon--delete" @click="deleteCode(row.Id, row.rawCodeIndex)">&#xF1C0;</a>
                                    </span>
                                </div>
                            </template>
                        </VirtualListViewer>
                    </div>
                    <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.codelist.helptextcodesfrom }}</div>
                    <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.codelist.helptextcodestill }}</div>
                    <div :class="['typo-helptext typo-helptext--top', {'typo-helptext--active' : showHelp}]">{{ $store.state.settings.codelist.helptextcodesresult }}</div>
                </div>

            </form>
            <!-- BUTTONS -->
            <div class="detailscreen-footer detailscreen-footer--inside">
                <span>
                    <a v-if="datadetail.CanDelete" class="button-primary button-primary--delete" @click="deleteDetail()">{{ $store.state.settings.codelist.deletebtnlbl }}</a>
                </span>
                <span class="grid--push">
                    <a class="button-primary button-primary--gray" @click="closeDetail()">{{ $store.state.settings.codelist.closebtnlbl }}</a>
                    <a class="button-primary js-submitbtn" :disabled="readonly">{{ $store.state.settings.codelist.savebtnlbl }}</a>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
  /**
   *
   * Press Tab on 3d input for new codeline
   * setTimeout 200 for realy realy long lists
   *
   * @author Erik Rosenhart <rsnh075@gmail.com>
   *
   * @version 1.0
   *
   * @todo
   *
   *
   */

  import { ValidateDir }      from './../../directives/validate';
  import VirtualListViewer     from './../uielements/VirtualListViewer.vue';
  import { dynamicSort }      from './../../use/sortFunctions';

  export default {
    name: 'CodelistDetail',
    props: ['visible', 'dataDetail', 'selectedId'],
    data: () => {
      return {
        showHelp             : false,
        searchStrDetail      : '',
        data                 : {},
        rawCodes             : null,
        sortSetting          : {},
        rowHeight            : 37,
      }
    },
    components: {
        VirtualListViewer
    },
    directives: {
        Validate : ValidateDir
    },
    computed: {
        showTitle() {
            return this.dataDetail && this.dataDetail.Name ?
                this.dataDetail.Name.length > 0 ? this.datadetail.Name : this.$store.state.settings.codelist.newnameplaceholder :
                this.$store.state.settings.codelist.newnameplaceholder;
        },
        readonly() {
            return Math.sign(this.selectedId) == -1 && this.selectedId != -1 ? true : false;
        }
    },
    watch: {
        dataDetail: function (newVal, oldVal) {
            this.datadetail = newVal;
            this.rawCodes = null;
            if (this.datadetail && this.datadetail.Codes) {
                this.datadetail.Codes.forEach((code, index) => { code.rawCodeIndex = index; code.iseditable = false});
                this.rawCodes = JSON.parse(JSON.stringify(this.datadetail.Codes));
                this.defaultSortOrder();
                this.searchStrDetail = '';
            }
        }
    },
    methods: {
        saveDetail() {
            console.trace('saveDetail');
            this.datadetail.Codes = this.rawCodes.filter(codeline => codeline.Code !== '' && codeline.From !== '' && codeline.Till !== '');
            this.$emit('save', this.datadetail);
        },
        deleteDetail() {
            this.$emit('delete', this.datadetail);
        },
        closeDetail() {
            this.rawCodes = null;
            this.$emit('close');
        },
        addCode(evt, type) {
            let _evt = evt || window.evt,
                _key = _evt.keyCode || _evt.which;
            if(type == 'btn' || (_key == 9 && type == 'blur')) {
                let _newCode = {
                    Code           : '',
                    CodeListId     : this.selectedId,
                    Delete         : false,
                    From           : '',
                    Id             : -1,
                    IsNew          : true,
                    Till           : '',
                    iseditable     : true,
                };
                if(!this.rawCodes) {
                    this.rawCodes         = [];
                    this.datadetail.Codes       = [];
                    _newCode.rawCodeIndex = 0;
                } else {
                    _newCode.rawCodeIndex = this.rawCodes.length;
                }
                this.rawCodes.push(Object.assign({}, _newCode));
                this.filterList();
                this.$nextTick(() => {
                    this.scrollToAddedCode(_newCode.rawCodeIndex);
                    this.setFocusToAddedCode(_newCode.rawCodeIndex);
                });
                evt.preventDefault();
            }
        },
        editCode(rawcodeindex) {
            this.rawCodes.forEach(code => {
            if(code.rawCodeIndex == rawcodeindex)
                code.iseditable = !code.iseditable;
            else
                code.iseditable = false;
            });
            this.filterList();
        },
        deleteCode(codeid, rawcodeindex) {
            this.rawCodes[rawcodeindex].Delete = true;
            this.filterList();
        },
        updateRawCodes(prop, val, rawcodeindex) {
            this.rawCodes[rawcodeindex][prop] = val;
        },
        //==========================================HELPER FUNCTIONS
        scrollToAddedCode(rawcodeindex) {
            let _dataCodesIndex = this.datadetail.Codes.findIndex(code => code.rawCodeIndex == rawcodeindex);
            this.$refs.codelistwrapper.$el.scrollTop = _dataCodesIndex * this.rowHeight;
        },
        setFocusToAddedCode(rawcodeindex) {
            let _reffy = 'row' + rawcodeindex.toString();
            if(this.$refs[_reffy]) {
            this.$refs[_reffy].children[0].focus();
            } else {
            setTimeout(() => {
                this.$refs[_reffy].children[0].focus();
            }, 200);
            }
        },
        displayHelp() {
            this.showHelp = !this.showHelp;
        },
        filterList() {
            this.datadetail.Codes = this.filterListOnString(this.rawCodes, this.searchStrDetail.toLowerCase());
            this.sortColumn();
        },
        filterListOnString(list, str) {
            if(str != '') {
            let _rawList = [...list];
            return _rawList.filter(item => {
                return (item.From.toLowerCase().indexOf(str) != -1 ||
                item.Till.toLowerCase().indexOf(str) != -1 ||
                item.Code.toLowerCase().indexOf(str) != -1) &&
                !item.Delete;
            });
            } else {
            return [...list].filter(item => !item.Delete);
            }
        },
        defaultSortOrder() {
            this.sortSetting.order = 'NONE';
            this.sortSetting.key = 'Code';
            this.sortColumn();
        },
        sortColumn(key, e = null) {
            let _order,
                _t;

            if(e != null) {
            _t     = e.currentTarget;
            _order = _t.getAttribute('data-sortorder');
            document.querySelectorAll('[data-sortorder]').forEach( a => a.setAttribute('data-sortorder', 'NONE'));
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
                this.datadetail.Codes.sort(dynamicSort(key));
                if(e != null)
                _t.setAttribute('data-sortOrder', 'ASC');
                break;
            case 'ASC':
                this.datadetail.Codes.sort(dynamicSort('-' + key));
                if(e != null)
                _t.setAttribute('data-sortOrder', 'DES');
                break;
            case 'DES':
                this.datadetail.Codes = this.filterListOnString(this.rawCodes, this.searchStrDetail.toLowerCase());
                if(e != null)
                _t.setAttribute('data-sortOrder', 'NONE');
                break;
            }
        },
        shakeIt() {
            let _elm = document.querySelector("#detailscreen");
            _elm.classList.add('detailscreen--shake');
            setTimeout(() => {
            _elm.classList.remove('detailscreen--shake');
            }, 1000);
        },
    }
  }

</script>

<style scoped>
.list-number-header__button--add {
    right : 10px;
  }
</style>
