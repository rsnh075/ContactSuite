<script>
import { IPCCCSupervisor, SupervisorStatus }  from '../../ipccc/js/supervisor';
import { IPCCCDashboard }   from '../../ipccc/js/dashboard.js';
import { IPCCCStatus }      from '../../ipccc/js/status.js';

  const _getLineDetailsForCoaching = (agentLineDetails) => {
    const stripSip = (rawNr) => rawNr?.indexOf('@') ? rawNr.split('@')[0] : rawNr;

    let _activeLine = agentLineDetails.Line1,
        _otherLeg   = null,
        _serviceNr  = '-',
        _superVisor = null,
        _myCase     = agentLineDetails.Line1?.Participants ? agentLineDetails.Line1.Participants.filter(p => p.IsMyCase) : [];

    _myCase         = _myCase.length > 0 ? _myCase[0] : null;

    if(_myCase == null) {
      _myCase     = agentLineDetails.Line2?.Participants ? agentLineDetails.Line2.Participants.filter(p => p.IsMyCase) : [];
      _myCase     = _myCase.length > 0 ? _myCase[0] : null;
      _activeLine = agentLineDetails.Line2;
    }

    _superVisor   = _activeLine.Participants.filter(p => p.SupervisorStatus != SupervisorStatus.NoSupervisor)[0];

    if(!_superVisor) {
      _otherLeg     = _activeLine.Participants.filter(p => !p.IsAgentCase && p != _superVisor)[0];
    } else {
      _otherLeg     = _activeLine.Participants.filter(p => !p.IsMyCase && p != _superVisor)[0];
    }

    if(_otherLeg != null) {
      if(_otherLeg.IsAgentCase) {
        _serviceNr    = _otherLeg.RoutingGroup;
      } else {
        _serviceNr    = stripSip(_otherLeg.DNIS);
      }

      return {
        callerName          : _otherLeg.Name,
        callerNumber        : _otherLeg.Inbound || _otherLeg.GUICallout ? stripSip(_otherLeg.PhoneNumber) : stripSip(_otherLeg.DNIS),
        varName             : ' ',
        serviceNumber       : _serviceNr,
        supervisorStatus    : _superVisor ? _superVisor.SupervisorStatus : '',
      }
    } else {
      return {
        callerName          : '',
        callerNumber        : '',
        varName             : '',
        serviceNumber       : '',
        supervisorStatus    : '',
      }
    }
  }

  export default {
    name: 'coach-user',
    data: () => {
      return {
        userId           : -1,
        userInitials     : '',
        liveUser         : {
          statusColor : 'FFFFFF'
        },
        agentLineDetails : null,
        callerName       : '',
        callerNumber     : '',
        varName          : '',
        serviceNumber    : '',
        listenActive     : false,
        coachingActive   : false,
        joinActive       : false,
        isSupervised     : false,
      }
    },
    inject: ["showLoader", "showInteraction"],
    computed: {
      statusColor() {
        return `background-color:${this.liveUser.statusColor}`;
      },
    },
    methods: {
      closeMe() {
        this.$store.commit('SET_SNACKBAR', {
          isVisible: false,
          module: '',
          templatename: '',
          data: {},
        });
        IPCCCSupervisor.SetSupervisedAgent(-1)
        .then(() => {
          //this.$destroy(); no longer is supported
        })
        .catch(e => console.log('Error: ', e));
      },
      handleCoach(evt) {
        let _btn = evt.target,
            _who = _btn.id;

        if(typeof _btn.checked !== 'undefined')
          _btn.checked = !_btn.checked;

        switch(_who) {
          case "speaker":
            IPCCCSupervisor.Listen()
            .then((success) => this.$store.commit('SET_SUPERVISOR_ISLISTENING', true))
            .catch((e) => console.error(e));

            if(Object.keys(this.$store.getters.getCurrentSelWebRTCDevice()).length > 0) {
              setTimeout(_ => {
                this.showInteraction(false, 'stay-minimized');
              }, 1000);
            }
          break;
          case "coaching":
            IPCCCSupervisor.Coach();
          break;
          case "mix":
            IPCCCSupervisor.Join();
          break;
          case "muteagent":
            IPCCCSupervisor.MuteAgent();
          break;
          case "hangupagent":
            IPCCCSupervisor.HangupAgent();
          break;
        }

      },
      processCallerInfo(agentlineinfo) {
        // console.log('agentlineinfo', agentlineinfo);
        this.agentLineDetails = agentlineinfo;

        let _info = _getLineDetailsForCoaching(agentlineinfo);
        this.callerName     = _info.callerName != '-' ? _info.callerName : this.$store.state.settings.coachAgent.unknowncallertxt;
        this.callerNumber   = _info.callerNumber;
        this.varName        = _info.varName != ' ' ? _info.varName : '...';
        this.serviceNumber  = _info.serviceNumber;

        this.listenActive   = _info.supervisorStatus === 'Listen';
        this.coachingActive = _info.supervisorStatus === 'Coaching';
        this.joinActive     = _info.supervisorStatus === 'Joined';
      },
      agentLineInfoReceived(agentlineinfo) {
        if(agentlineinfo.Raw.UserId == this.userId) {
          this.processCallerInfo(agentlineinfo);
        }
      },
      setSupervisedUser() {
        IPCCCSupervisor.SetSupervisedAgent(this.userId) //Coachen
        .then(msg => {
          // this.$store.commit('SET_COACHING_USERID', this.userId);
          this.isSupervised = msg == 'supervised';
          if(this.isSupervised) {
            IPCCCSupervisor.SubscribeToAgentInformation(this.$store.state.snackBarStatus.data.userId)
            .then(data => {
              IPCCCSupervisor.AgentEvent.addHandler(this.agentLineInfoReceived); //Lineinfo of the user
              this.showLoader(false);
            })
            .catch(e => {
              console.error('Error: ', e);
              this.showLoader(false);
            });
          }
        })
        .catch(err => {
          console.error('Error: ' + err);
          this.showLoader(false);
        });
      }
    },
    mounted() {
      IPCCCSupervisor.SetSupervisedAgent('-1') //reset Coachen
      .then(_ => {
        this.userId         = this.$store.state.snackBarStatus.data.userId;
        this.userInitials   = this.$store.state.snackBarStatus.data.liveUser.initials;
        this.liveUser       = this.$store.state.snackBarStatus.data.liveUser;

        this.setSupervisedUser();
      })
      .catch(err => console.error('Error: ' + err));

    },
    beforeUnmount() {
      IPCCCSupervisor.AgentEvent.removeHandler(this.agentLineInfoReceived);
      IPCCCSupervisor.DeSubscribeFromAgentInformation(this.userId)
      .then(() => {
        //succes
      })
      .catch(e => console.log('Error: ', e));
      this.showLoader(false);
    },
  }
</script>

<template>
	<div data-e2e="coach-user">
		<div class="snackbar-wrapper">
			<a href="javascript:;" class="snackbar-close" @click="closeMe"></a>
			<div class="snackbar-icon-wrapper" :class="{'status--disabled' : !isSupervised}">
				<span class="snackbar-status-icon">
					<span class="snackbar-status-icon-dot" :style="statusColor"></span>
					<span class="snackbar-status-icon-init">{{ userInitials }}</span>
				</span>
			</div>
			<div class="snackbar-info-wrapper">
				<p>{{ liveUser.GebruikerNaam }}</p>
				<div class="snackbar-checkboxbar" :class="{'status--disabled' : !isSupervised}">
					<input type="checkbox" id="speaker" @click="handleCoach($event)" :disabled="!$store.state.commands.SupervisorListen && !listenActive" :checked="listenActive">
					<label for="speaker" class="snackbar-checkboxbar__speaker">
						<p>{{ $store.state.settings.coachAgent.iconLabels[0] }}</p>
					</label>
					<input type="checkbox" id="coaching" @click="handleCoach($event)" :disabled="!$store.state.commands.SupervisorCoach && !coachingActive" :checked="coachingActive">
					<label for="coaching" class="snackbar-checkboxbar__coaching">
						<p>{{ $store.state.settings.coachAgent.iconLabels[1] }}</p>
					</label>
					<input type="checkbox" id="mix" @click="handleCoach($event)" :disabled="!$store.state.commands.SupervisorJoin && !joinActive" :checked="joinActive">
					<label for="mix" class="snackbar-checkboxbar__mix">
						<p>{{ $store.state.settings.coachAgent.iconLabels[2] }}</p>
					</label>
					<input type="checkbox" id="muteagent" @click="handleCoach($event)" :disabled="!$store.state.commands.SupervisorMuteAgent && !$store.state.commands.SupervisorMuteAgentValue" :checked="$store.state.commands.SupervisorMuteAgentValue">
					<label for="muteagent" class="snackbar-checkboxbar__mute">
						<p>{{ $store.state.settings.coachAgent.iconLabels[3] }}</p>
					</label>
					<button type="button" id="hangupagent" @click="handleCoach($event)" class="snackbar-checkboxbar__hangup" :disabled="!$store.state.commands.SupervisorHangupAgent">
						<p>{{ $store.state.settings.coachAgent.iconLabels[4] }}</p>
					</button>
				</div>
			</div>
			<div class="snackbar-info-wrapper snackbar-info-wrapper--lesmargin">
				<p>{{ $store.state.settings.coachAgent.informationhead }}</p>
				<div class="snackbar-info-wrapper__column">
					<h3>{{ callerName }}</h3>
					<p>{{ callerNumber }}</p>
				</div>
				<div class="snackbar-info-wrapper__column">
					<h3>&nbsp;</h3>
					<p>{{ serviceNumber }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
  @use "@/scss/includes/snackbar";
</style>
