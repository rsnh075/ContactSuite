import { randProperty }    from './cmHelpers';


export default {
    SET_LANG: (state, langCode) => {
        state.browserLanguage = langCode;
    },
    SET_ENV_IS_LIVE: (state, bool) => {
        state.envIsLive = bool;
    },
    SET_ENV_IS_TEST: (state, bool) => {
        state.envIsTest = bool;
    },
    SET_ENV_IS_DEV: (state, bool) => {
        state.envIsDev = bool;
    },
    SET_HELPCENTER_URL: (state, url) => {
        state.helpcentreurl = url;
    },
    SET_REPORTS_URL: (state, url) => {
        state.reportsloginidsurl = url;
    },
    SET_NAV_ITEM: (state, url) => {
        // remember nav history up to 50 urls
        if (state.navHistory.length > 50) {
            state.navHistory.pop(); // remove oldest
        }
        state.navHistory.unshift(url);
    },
    SET_SETTINGS_UPDATE: (state, { data }) => {
        state.settings             = data;
        state.settingsReady        = true;
        state.quote                = state.settings.ischristmas ? state.settings.quotes.christmas[randProperty(state.settings.quotes.christmas)] : state.settings.quotes.normal[randProperty(state.settings.quotes.normal)];
        state.backgroundStyle      = { backgroundImage : 'url(' + window.siteroot + 'assets/images/' +
                                       (state.settings.ischristmas ?
                                        state.settings.images.christmas[randProperty(state.settings.images.christmas)] :
                                        state.settings.images.normal[randProperty(state.settings.images.normal)]) + ')' };
        state.clientCode           = state.settings.companycode;
        state.clientId             = state.settings.clientid;
        state.sounds               = state.settings.sounds;
        // state.idserver             = state.settings.idserver;
    },
    SET_MENU: (state, menuObj) => {
        state.navigation.menuItems = menuObj.mainMenuItems;
    },
    SET_PINCODE_STATUS : (state, status) => {
        state.pincodeStatus        = status;
    },
    SET_INTERFACE_STATUS : (state, commands) => {
        state.commands             = commands;
    },
    SET_USER_STATUS: (state, status) => {
        state.statusId             = status.StatusId;
        state.statusLbl            = status.Label;
        state.statusSelectable     = status.Selectable;
        state.statusColor          = '#' + status.Color;
    },
    SET_AGENT_EVENT: (state, agent) => {
        state.agentEvent           = agent;
    },
    SET_MESSAGING_EVENT: (state, data) => {
        state.messagingData = data;
    },
    SET_DEVICE_LIST: (state, list) => {
        state.deviceList = list;
    },
    SET_PBXSETTINGS: (state, pbxsettings) => {
        state.pbxSettings = pbxsettings;
    },
    SET_PREVIOUS_DEVICENAME: (state, name) => {
        state.previousDeviceName = name;
    },
    SET_CURRENT_DEVICENAME: (state, name) => {
        state.currentDeviceName = name;
    },
    SET_CURRENT_SELECTED_DEVICE: (state, selObj) => {
        state.currentSelDevice  = Object.assign({}, selObj);
    },
    SET_CURRENT_SELECTED_DEVICE_DND: (state, bool) => {
        state.currentSelDeviceDND  = bool;
    },
    SET_CURRENT_SELECTED_WEBRTC_DEVICE: (state, obj) => {
        state.currentWebRTCPhone = obj;
    },
    SET_STATUS_MESSAGE: (state, msg) => {
        state.statusMessage = msg;
    },
    SET_STATUS_TEXT_LIST: (state, list) => {
        state.userStatusTextList = list;
    },
    SET_CURRENT_IDENTITY: (state, id) => {
        state.loginSession.Details.CurrentOutboundIdentityId = state.currentIdentityId = id;
        state.currentIdentity = state.loginSession.Details.OutboundIdentities.find(i => i.Id === state.loginSession.Details.CurrentOutboundIdentityId).Name;
    },
    SET_INTERNETCON_STATUS: (state, status) => {
        state.internetConStatus = status;
    },
    SET_HOME_STATE: (state, status) => {
        state.navigation.homeStatus = status;
    },
    SET_INTERACTION_STATE: (state, status) => {
        state.navigation.interactionStatus = status;
    },
    SET_INTERACTION_MINIMIZED : (state, status) => {
        state.navigation.interactionMinimized = status;
    },
    SET_INTERACTION_HISTORY : (state, path) => {
        state.navigation.interactionHistory = path;
    },
    SET_HAS_WEBPHONE: (state, status) => { //WAS SET_WEBPHONE
        state.navigation.hasWebPhone = status;
    },
    SET_WEBRTC_PHONEINFO: (state, obj) => {
        state.navigation.webRTCPhoneInfo = obj;
    },
    SET_LOBBYINFO: (state, arr) => {
        state.subscriptions.lobbyinfo = arr;
    },
    SET_RINGING: (state, status) => {
        state.navigation.phoneRinging = status;
    },
    SET_LINE_ACTIVE: (state, status) => {
        state.navigation.hasActiveLine = status;
    },
    SET_PUSH_URL: (state, url) => {
        state.pushUrl              = url;
    },
    SET_FILTERS_MINIMIZED : (state, status) => {
        state.navigation.reportFiltersMinimized = status;
    },
    SET_DASHBOARD_SRCSTR: (state, searchStr) => {
        state.dashboard.searchStr = searchStr;
    },
    SET_SNACKBAR: (state, obj) => {
        state.snackBarStatus = obj;
    },

    SET_NUMBERDIALOG: (state, status) => {
        state.numberDialogStatus = status;
    },
    SET_PROMPTDIALOG: (state, status) => {
        state.promptDialogStatus = status;
    },
    SET_PROMPTLOADER_DIALOG: (state, status) => {
        state.promptLoaderDialogStatus = status;
    },
    SET_CUSTOMER_INFO: (state, cData) => {
        state.customerData = JSON.parse(JSON.stringify(cData));
    },
    // SET_UPDATE_NUMBER_LIST: (state, status) => {
    //   state.updateNumberList = status;
    // },
    SET_APP_PROMPT_DATA: (state, obj) => {
        state.promptData = obj;
    },
    SET_PROMPTLOADER_DATA: (state, obj) => {
        state.promptLoaderData = obj;
    },
    SET_NEW_CHAT_WINDOW: (state, userId) => {
        state.chat.newChatId = userId;
    },
    SET_UNSAVEDNOTE: (state, unsavednote) => {
        state.unsavedNote = unsavednote;
    },
    SET_IFRAME_LOCK: (state, status) => {
        state.lockiFrames = status;
    },
    SET_ADDRESSLIST: (state, list) => {
        state.rawAddressList = list;
    },
    SET_SERVICENR_OBJ: (state, payload) => {
        state.serviceNumberObj.selectedNumberId = payload.selectedNumberId;
        state.serviceNumberObj.selectedNumber = payload.selectedNumber;
        state.serviceNumberObj.selectedNumberTitle = payload.selectedNumberTitle;
    },
    SET_SCRIPT_PROPS: (state, moduleProps) => {
        state.scriptmanager.props= Object.assign({}, moduleProps);
    },
    SET_MODULE_REDIRECT_FROM: (state, values) => {
        state.scriptmanager.redirectfrom = Object.assign({}, values);
    },
    SET_MODULE_REDIRECT_TO: (state, id) => {
        state.scriptmanager.redirectto = id;
    },
    SET_CURRENT_STATUS_TIME: (state, time) => {
        state.currentStatusTime.time = time.time;
        state.currentStatusTime.mSec = time.mSec;
    },
    RESET_INBOUNDLINE_INFO: (state, bool) => {
        state.resetInboundLineInfo = bool;
    },
    USER_RESET_INBOUNDLINE_INFO: (state, bool) => {
        state.userResetInboundLineInfo = bool;
    },
    // SET_QUEUE_STATUS: (state, status) => {
    //   state.queueStatus = status;
    // },
    SET_BULKLOADER_STATUS: (state, status) => {
        state.bulkloader.visibility    = status.visibility,
        state.bulkloader.header        = status.header,
        state.bulkloader.message       = status.message,
        state.bulkloader.currentcount  = status.currentcount,
        state.bulkloader.maxcount      = status.maxcount
    },
    SET_SEARCHSENTMESSAGE: (state, status) => {
        state.searchSentMessage.fromDate              = status.fromDate,
        state.searchSentMessage.tillDate              = status.tillDate,
        state.searchSentMessage.selectedSentMessageId = status.selectedSentMessageId
    },
    SET_BULKIMPORT: (state, status) => {
        state.bulkimport = status;
    },
    SET_FIRST_CONTACT: (state, id) => {
        state.firstcontactid = id;
    },
    SET_SELECTED_CONTACT: (state, payload) => {
        state.selectedcontact = payload.contact;
        state.leftlanemaxonopencontact = payload.leftlanemaxonopencontact;
    },
    SET_DELETED_CONTACT: (state, contactid) => {
        state.deletedcontactid = contactid;
    },
    SET_PUSHNOTIFICATION_MESSAGE: (state, msg) => {
        state.pushNotificationMsg = msg;
    },
    SET_INITIALIZE_PICKUPBUTTON: (state, bool) => {
        state.initializePickupButton = bool;
    },
    // SET_COACHING_USERID: (state, id) => {
    //     state.isCoachingUserId = id;
    // }
    SET_SUPERVISOR_ISLISTENING: (state, bool) => {
        state.supervisorIsListening = bool;
    },
    SET_HID_HAS_CALLCONTROLE: (state, bool) => {
        state.hasHIDCallControle = bool;
    },
    PICKUP_ACTIVE_CALL: (state, bool) => {
        state.pickupActiveCall = bool;
    },
    HANGUP_ACTIVE_CALL: (state, bool) => {
        state.hangupActiveCall = bool;
    },
    WEBRTC_IS_RINGING: (state, bool) => {
        state.webRtcIsRinging = bool;
    },
};
