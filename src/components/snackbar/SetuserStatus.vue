<template>
  <div data-e2e="set-user-status">
    <div class="snackbar-wrapper">
      <a href="javascript:;" class="snackbar-close" @click="closeMe"></a>
      <div class="snackbar-icon-wrapper">
        <span class="snackbar-status-icon">
          <span class="snackbar-status-icon-dot" :style="statusColor"></span>
          <span class="snackbar-status-icon-init">{{ userInitials }}</span>
        </span>
      </div>
      <div class="snackbar-info-wrapper">
        <p>{{ liveUser.GebruikerNaam }}</p>
        <div class="form-selectfield form-selectfield--bullit">
          <span :style="{backgroundColor : getStatusColor(bullitStatus)}"></span>
          <select @change="setStatusId" v-bind:value="bullitStatus">
            <option v-for="status in statusList" :key="status.StatusId" :value="status.StatusId" v-show="status.Selectable" :selected="status.StatusId == bullitStatus">{{ status.Label }}</option>
            <option value="-10">Uitloggen</option>
          </select>
        </div>
      </div>  
      <div class="snackbar-btn-wrapper">
        <div id="setBtn" class="form-button form-button--icons">
          <button type="button" @click="cancelStatus" class="snackbar-btn--cancel"><span>{{ $store.state.settings.changeStatusAgent.cancelLabel }}</span></button>
          <button type="button" @click="setStatus" class="snackbar-btn--ok" :disabled="statusSelectable($store.state.snackBarStatus.data.liveUser.StatusId)"><span>{{ $store.state.settings.changeStatusAgent.saveLabel }}</span></button>
        </div>
      </div>  
    </div>
    </div>
</template>

<script>

  import { IPCCCStatus }      from '../../ipccc/js/status';
  import { IPCCCSupervisor }  from '../../ipccc/js/supervisor';

  export default {
    name: 'SetUserStatus',
    data: () => {
      return {
        userId           : '',
        liveUser         : {},
        userInitials     : '',
        statusList       : [],
        statusColorList  : [],
        newStatus        : -1,
        currentStatus    : '',
        bullitStatus     : '',
        statusIconName   : ['', '', '', 'wrapup', 'busy', '', '', 'email', 'pause'],

      }
    },
    inject: ["showLoader"],
    computed: {
      statusColor() {
        return `background-color:${this.liveUser.statusColor}`;
      },
    },
    methods : {
      closeMe() {
        this.$store.commit('SET_SNACKBAR', {
          isVisible: false,
          module: '',
          templatename: '',
          data: {},
        });
      },
      setStatusId(evt) {
        this.newStatus    = evt.target.value;
        this.bullitStatus = this.newStatus;
      },
      setStatus() {
          this.showLoader(true);
          if(this.newStatus != -10) {
            IPCCCSupervisor.SetUserStatus(this.userId, this.newStatus, null)
            .then(() => {
              this.closeMe();
            })
            .catch(err => {
              console.log('Error: ' + err);
              this.closeMe();
            });
          } else {
            IPCCCSupervisor.LogoutUser(this.userId)
            .then(_ => {
              this.closeMe();
            })
            .catch(err => {
              console.log('Error: ' + err);
              this.closeMe();
            });
          }
      },
      cancelStatus() {
        this.closeMe();
      },
      getStatusColor(id) {
        let _labelObj = this.statusColorList.filter( ( obj ) => {
          return (obj && obj.StatusId == id);
        });
        return '#' + String((_labelObj && _labelObj.length > 0) ? _labelObj[0].Color : 'FFFFFF');
      },
      statusSelectable(sId) {
        let isStatusSelectable = this.statusList.filter(s => s.StatusId == sId);
        return isStatusSelectable.length > 0 && !isStatusSelectable[0].Selectable;
      },
    },
    mounted() {
      this.userId        = this.$store.state.snackBarStatus.data.userId;
      this.userInitials  = this.$store.state.snackBarStatus.data.liveUser.initials;
      this.liveUser      = this.$store.state.snackBarStatus.data.liveUser;

      this.currentStatus = this.$store.state.snackBarStatus.data.liveUser.StatusId;
      this.bullitStatus  = this.$store.state.snackBarStatus.data.liveUser.StatusId;

      IPCCCStatus.GetStatusList(this.userId) //userstatuslist, prevent the supervisor to set the user to a status the user doesn't have.
      .then(result => {
        this.statusColorList = result;
      })
      .catch(err => {
        console.log('Error: ' + err);
      });

      IPCCCSupervisor.SetSupervisedAgent(this.userId)
      .then(_ => {
        IPCCCStatus.GetSelectableList().then(result => {
          this.statusList = result;
        })
        .catch(err => {
          console.log('Error: ' + err );
        });
      })
      .catch(err => {
        console.log('Error: ' + err );
      });

      this.showLoader(false);
    },
    beforeUnmount() {      
      IPCCCSupervisor.SetSupervisedAgent(-1)
      .then(_ => {
        this.showLoader(false);
      })
      .catch(err => console.log('Error: ' + err));
    },
  }
</script>

<style lang="scss" scoped>
  @use "@/scss/includes/snackbar";
</style>
