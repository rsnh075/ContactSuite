import { stringifyQuery } from "vue-router";

export default {
    getPermission                   : state => (id) => {
        return (state.loginSession && state.loginSession.Details.Permissions.indexOf(id) != -1) ? true : false
    },
    getDeviceList                   : state => () => state.deviceList,
    getPbxSettings                  : state => () => state.pbxSettings,
    getLang                         : state => () => state.browserLanguage ?? 'nl',
    getCurrentSelDevice             : state => () => state.currentSelDevice,
    getCurrentSelDeviceDND          : state => () => state.currentSelDeviceDND,
    getCurrentSelWebRTCDevice       : state => () => state.currentWebRTCPhone,
    getCurrentDeviceName            : state => () => state.currentDeviceName,
    getPreviousDeviceName           : state => () => state.previousDeviceName,
    getLangLabel                    : state => (label) => {
        const _labelArr = label.split('.');
        switch(_labelArr.length) {
        case 1:
            return state.settings[_labelArr[0]];
        case 2:
            return state.settings[_labelArr[0]][_labelArr[1]];
        case 3:
            return state.settings[_labelArr[0]][_labelArr[1]][_labelArr[2]];
        default:
            return 'Error: failed argument';
        }
    },
    getMenuUrls                     : state => () => state.navigation.menuUrls,
    getWebRTCPhoneInfo              : state => () => state.navigation.webRTCPhoneInfo,
    getHasWebPhone                  : state => () => state.navigation.hasWebPhone,
    getLobbyInfo                    : state => () => state.subscriptions.lobbyinfo,
    getStatusMessage                : state => () => state.statusMessage,
    getUserStatusTextList           : state => () => state.userStatusTextList,
    getIdentity                     : state => () => state.currentIdentity,
    getIdentityId                   : state => () => state.currentIdentityId,
    getPincodeStatus                : state => () => state.pincodeStatus,
    getUnsavedNote                  : state => () => state.unsavedNote,

    // getInteractionMinimized         : state => () => state.navigation.interactionMinimized,

    //getAgentControlsStatus          : state => () => state.agentControlsStatus,


    // getClientCode                  : state => () => state.clientCode,
    // getClientId                    : state => () => state.clientId,


    contactReasonsAvailable         : state => () => {
        let crAvailable = false;
        if (state.loginSession) {
            for(let [i, service] of Object.entries(state.loginSession.Details.Services)) {
                if(service.toLowerCase().replace(" ", "") == "contactreasons") {
                    crAvailable = true;
                }
            };
        }
        return crAvailable;
    },
    getAgentEvent                   : state => () => state.agentEvent,
    getMessagingEvent               : state => () => state.messagingData,
    getPushUrl                      : state => () => state.pushUrl,
    getCdcEnabled                   : state => () => state.cdcEnabled,
    activeApp                       : state => () => state.navigation.activeApp,
    snackBarStatus                  : state => () => state.snackBarStatus,
    statusChanged                   : state => () => {
        return {
            StatusId   : state.statusId,
            StatusLbl  : state.statusLbl,
            StatusTime : 1,
        }
    },
    // getIsCoachingUserId             : state => () => state.isCoachingUserId,
    numberDialogStatus              : state => () => state.numberDialogStatus,
    promptDialogStatus              : state => () => state.promptDialogStatus,
    promptLoaderDialogStatus        : state => () => state.promptLoaderDialogStatus,
    updateNumberList                : state => () => state.updateNumberList,
    promptData                      : state => () => state.promptData,
    promptLoaderData                : state => () => state.promptLoaderData,
    // getAppColors                    : state => () => state.navigation.appColors,
    // getSidemenuStatus               : state => () => state.navigation.sideMenuState,
    getHomeState                    : state => () => state.navigation.homeStatus,
    getInteractionState             : state => () => state.navigation.interactionStatus,
    // getInteractionHistory           : state => () => state.navigation.interactionHistory,
    getMenuItems                    : state => () => state.navigation.menuItems,
    getReportFiltersMinimized       : state => () => state.navigation.reportFiltersMinimized,
    getDashboardSrcStr              : state => () => state.dashboard.searchStr,
    getChatNewWindowUserId          : state => () => state.chat.newChatId,
    getCustomerInfo                 : state => () => state.customerData,
    // getCallData                     : state => () => state.callData,
    getPermissionList               : state => () => state.loginSession.Details.Permissions,
    // getiFrameLockState              : state => () => state.lockiFrames,
    // getTasksUnread                  : state => () => state.voicemailinbox.tasksUnread,
    getWindowSize                   : state => () => state.windowSize,
    getAddressList                  : state => () => state.rawAddressList,
    getServiceNumberObj             : state => () => state.serviceNumberObj,
    getInternetConStatus            : state => () => state.internetConStatus,
    getScriptProps: state => () => state.scriptmanager.props,
    getScriptRedirectFrom: state => () => state.scriptmanager.redirectfrom,
    getScriptRedirectTo: state => () => state.scriptmanager.redirectto,
    getArrowPath                    : state => () => state.arrowPath,
    // getColors                       : state => () => state.navigation.appColors,
    getUserId                       : state => () => state.loginSession.Details.UserId,
    getSettingsReady                : state => () => state.settingsReady,
    //getLoginSessionReady            : state => () => state.loginSessionReady,
    getCurrentStatusTime            : state => () => state.currentStatusTime,
    getCommandsHangup               : state => () => state.commands.Hangup,
    getCommandsCallOut              : state => () => state.commands.CallOut,
    // getTicker                       : state => () => state.ticker,
    // getQueueStatus                  : state => () => state.queueStatus,
    getHelpcentreUrl                : state => () => state.helpcentreurl,
    getEnvIsDev                     : state => () => state.envIsDev,
    getEnvIsTest                    : state => () => state.envIsTest,
    getEnvIsLive                    : state => () => state.envIsLive,
    getReportsLoginIDSUrl           : state => () => state.reportsloginidsurl,
    getNavHistory                   : state => () => state.navHistory,
    getBulkImport                   : state => () => state.bulkimport,
    getFirstContactId               : state => () => state.firstcontactid,
    getSelectedContact              : state => () => state.selectedcontact,
    getLeftLaneMaxOnOpenContact     : state => () => state.leftlanemaxonopencontact,
    getDeletedContactId             : state => () => state.deletedcontactid,
    getPushNotificationMsg          : state => () => state.pushNotificationMsg,
    getInitializePickupButton       : state => () => state.initializePickupButton,
    getResetInboundLineInfo         : state => () => state.resetInboundLineInfo,
    getUserResetInboundLineInfo     : state => () => state.userResetInboundLineInfo,
    getSearchSentMessage            : state => () => state.searchSentMessage,
    getSupervisorIsListening        : state => () => state.supervisorIsListening, // true: you are the coach
    getHasHIDCallControle           : state => () => state.hasHIDCallControle,
    getPickupActiveCall             : state => () => state.pickupActiveCall,
    getHangupActiveCall             : state => () => state.hangupActiveCall,
    getWebRtcIsRinging              : state => () => state.webRtcIsRinging,
}