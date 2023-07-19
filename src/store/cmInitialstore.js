import { object } from 'vue-types';
import { browserLanguage }    from './cmHelpers';

// interface storeT {
//   data              : Array<any>,
//   customerData      : {
//                         customerId               : Number,
//                         customerName             : string,
//                         selectedCustomerId       : Number,
//                         selectedCustomerName     : string,
//                         selectedCustomerUsesCasa : boolean
//                       },
//   agentControlsStatus : boolean,
//   helpcentreurl       : string
// }


//export const cmstore: storeT = {
export const cmstore = {
    envIsLive			: false,
    envIsTest			: false,
    envIsDev			: false,
	data: [],
	customerData: {
		customerId               : -1,
		customerName             : '',
		selectedCustomerId       : -1,
		selectedCustomerName     : '',
		selectedCustomerUsesCasa : false,
	},
	navigation: {
		activeApp                : 0,
		menuItems                : [],
		appColors                : ['213A8F', 'F39200',      '4BAAF0',     'E6332A',  '662483', '3AAA35', 'B28879'],
		homeStatus               : true,
		interactionStatus        : false,
		interactionMinimized     : false,
		interactionHistory       : '',
		reportFiltersMinimized   : true,
		roleUrls                 : [],
		webRTCPhoneInfo          : {},
		hasWebPhone              : false,
		phoneRinging             : false,
		hasActiveLine            : false,
		requestNavigation        : '',
	},
	subscriptions: {
		lobbyinfo                : [],
	},
	helpcentreurl       : '',
	reportsloginidsurl  : '',
	navHistory          : [],
	backgroundStyle     : {},
	browserLanguage     : browserLanguage(),
	windowSize          : {
		_maxX : window.innerWidth,
		_maxY : window.innerHeight
	},
	deviceList          : [],
	pbxSettings         : [],
	currentDeviceName   : null,
	previousDeviceName  : null,
	currentSelDevice    : null,
	currentSelDeviceDND : false,
	currentWebRTCPhone  : {},
	statusMessage       : '',
	userStatusTextList  : [],
	currentIdentity     : '',
	currentIdentityId   : -1,

	// callData            : [],
	// voicemailinbox      : {
	//   tasksUnread : 0,
	// },
	dashboard           : {
		searchStr : ''
	},
	chat                : {
		newChatId         : -1,
	},

	lockiFrames         : false,

	// IPCCCControl        : null,
	settingsReady       : false,
	// loginSessionReady   : false,
	// settings            : [],

	// quote               : '',
	clientCode          : '',
	// clientId            : '',
	pincodeStatus       : -1,
	commands            : {},
	statusId            : -1,
	statusLbl           : '',
	statusSelectable    : true,
	statusColor         : '#FFF',
	loginSession        : null,
	agentEvent          : null,
	// controlLogout       : true,
	pushUrl             : 'about:blank',
	cdcEnabled          : false,
	resetInboundLineInfo : false,
	userResetInboundLineInfo : false,
    messagingData       : null,
	snackBarStatus      : {
		isVisible    : false,
		module       : '',
		templatename : '',
		data         : {}
	},
	// sounds              : {},
	// numberDialogStatus  : false,
	// updateNumberList    : false,
	// idserver            : true,
	// promptDialogStatus  : false,
	promptData                : {},
	promptLoaderDialogStatus  : false,
	promptLoaderData          : {},
	rawAddressList      : [],
	serviceNumberObj    : {},
	internetConStatus   : 'Connected',
	scriptmanager       : {
		props : {
		indexToChange : -1,
		props         : {}
		}
	},
	arrowPath           : {
		start     : [0,0],
		controls  : [0,0,0,0],
		end       : [0,0]
	},
	unsavedNote         : {
		NoteId            : -1,
		TemplateId        : -1
	},
	currentStatusTime   : {
		time : '00:00:00',
		mSec : 0
	},
	// ticker              : 0,
	// queueStatus         : false,
	bulkloader          : {
		visibility    : false,
		header        : '',
		message       : '',
		currentcount  : 0,
		maxcount      : 0
	},
	bulkimport : true,
	firstcontactid: null,
	selectedcontact: null,
	leftlanemaxonopencontact: false,
	deletedcontactid: -1,
	pushNotificationMsg : '',
	initializePickupButton : false,
	searchSentMessage : {
		fromDate : '',
		tillDate : '',
		selectedSentMessageId : null
	},
	// isCoachingUserId : -1,
	supervisorIsListening : false,
    pickupActiveCall: false,
    hangupActiveCall: false,
    webRtcIsRinging: false,
};