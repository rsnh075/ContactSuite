
import { createWebHashHistory,
         createRouter
       }                    from 'vue-router';
import { IPCCC }            from '../ipccc/js/ipccc';

import { store }            from './../store/cmStore';

const _maxGetCommandsTry  = 100;
let _getCommandsCount     = 0;

const checkLoggedIn = () => {
	return IPCCC.LoginSession != null;
};

const checkSettingsLoaded = () => {
	if (!store.getters.getSettingsReady) {
		setTimeout(checkSettingsLoaded, 50);
		return false;
	} else {
		return true;
	}
};


const waitCommandsLoaded = onReady => {
	if(store.state.commands == null && (_getCommandsCount < _maxGetCommandsTry)) {
		setTimeout(() => {
			_getCommandsCount++;
			waitCommandsLoaded(onReady);
		}, 50);
	} else if(_getCommandsCount >= _maxGetCommandsTry) {
		console.error('Loading Commands Failed... retry');
		_getCommandsCount = 0;
		waitCommandsLoaded(onReady);
	} else {
		if (typeof onReady === 'function') onReady();
	}
};

const roleAndLoggedInCheck = (to, from, next) => {
	if(checkLoggedIn()) {
		waitCommandsLoaded(() => {
			if(store.getters.getMenuUrls().indexOf(to.path) !== -1 || to.path == '/reconnectscreen/') {
				next();
			} else {
				next( {path : '/home/'} );
			}
		});
	} else {
		next( {path : '/'} );
	}
};

const routes = [
	{
		path      : '/',
		name      : '404',
		component : () => import('./../components/404.vue')
	}, {
		path      : '/loginfailed/',
		name      : 'loginfailed',
		component : () => import('./../components/LoginFailed.vue')
	}, {
		path      : '/setdevice-and-status/',
		name      : 'SetDeviceAndStatus',
		beforeEnter: (to, from, next) => {
			checkLoggedIn() ? next() : next( {path : '/'} );
		},
		component : () => import('./../components/setdeviceandstatus/SetDeviceAndSettings.vue')
	}, {
		path      : '/home/',
		name      : 'Home',
		beforeEnter: roleAndLoggedInCheck,
		components: {
			default     : () => import('./../components/mainframe/MainScreen.vue'),
			interaction : () => import('./../components/interaction/Interaction.vue')
		},
		children: [
			{
				path: '/interaction/',
				name: 'Interaction',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					interaction: () => import('./../components/interaction/Interaction.vue'),
				}
			}, {
				path: '/reconnectscreen/',
				name: 'ReConnectScreen',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/ReConnectScreen.vue'),
				}
			}, {
				path: '/performance/agentdashboard',
				name: 'AgentDashboard',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/dashboards/AgentDashboard.vue'),
				}
			}, {
				path: '/performance/queues/',
				name: 'QueuesDashboard',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/dashboards/QueuesDashboard.vue'),
				}
			}, {
				path: '/performance/outboundmonitor/',
				name: 'OutboundMonitor',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/dashboards/OutboundMonitor.vue'),
				}
			}, {
				path: '/performance/recordingmonitor/',
				name: 'RecordingMonitor',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/dashboards/RecordingMonitor.vue'),
				}
			}, {
				path: '/performance/numbers/',
				name: 'Numbers-uc',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/ComingSoon.vue'),
				}
			}, {
				path: '/performance/adherence/',
				name: 'Adherence',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/real-time-adherence/RealTimeAdherence.vue'),
				}
			}, {
				path: '/performance/wallscreen-config/',
				name: 'WallScreenConfig',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/wallscreenconfig/WallScreenConfigList.vue'),
				}
			}, {
				path: '/reports/VoIP/:id/',
				name: 'ReportsVoIPInbound',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/reporting/Reporting.vue'),
				}
			}, {
				path: '/reports/inbound/:id/',
				name: 'ReportsInbound',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/reporting/Reporting.vue'),
				}
			}, {
				path: '/reports/call-groups/:id/',
				name: 'ReportsCallGroups',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/reporting/Reporting.vue'),
				}
			}, {
				path: '/reports/call-history/:id/',
				name: 'ReportsCallHistory',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/reporting/Reporting.vue'),
				}
			}, {
				path: '/reports/outbound/:id/',
				name: 'ReportsOutbound',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/reporting/Reporting.vue'),
				}
			}, {
				path: '/reports/resellers/:id/',
				name: 'ReportsResellers',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/reporting/Reporting.vue'),
				}
			}, {
				path: '/reports/traffic/:id/',
				name: 'ReportsTraffic',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/reporting/Reporting.vue'),
				}
			}, {
				path: '/reports/:id/',
				name: 'Reports',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/reporting/Reporting.vue'),
				}
			}, {
				path: '/management/customers/',
				name: 'Customers',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/usermanagement/CustomerManagement.vue'),
				}
			}, {
				path: '/management/users/',
				name: 'Users',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/usermanagement/UserManagement.vue'),
				}
			}, {
				path: '/management/voipaccounts/',
				name: 'Voipaccounts',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/voipaccounts/Voipaccounts.vue'),
				}
			}, {
				path: '/management/security/change-pwd/',
				name: 'Change-pwd',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/security/ChangePwd.vue'),
				}
			}, {
				path: '/management/roles/',
				name: 'Roles',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/roles/Roles.vue'),
				}
			}, {
				path: '/management/configurator/',
				name: 'Configurator',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/configurator/Configurator.vue'),
				}
            }, {
				path: '/management/externaltooling/',
				name: 'Tooling',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/externaltooling/ExternalTooling.vue'),
				}
			}, {
				path: '/management/assets/',
				name: 'Assets',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/license/Assets.vue'),
				}
			}, {
				path: '/management/documents/',
				name: 'Documents',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/servicenumbers/Manuals.vue'),
				}
			}, {
				path: '/management/license-settings/',
				name: 'LicenseSettings',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/license/LicenseSettings.vue'),
				}
			}, {
				path: '/management/workstations/',
				name: 'Workstations',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/workstations/Workstations.vue'),
				}
			}, {
				path: '/management/devices/',
				name: 'DeviceList',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/devices/DeviceList.vue'),
				}
			}, {
				path: '/management/license/',
				name: 'License',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/license/License.vue'),
				}
			}, {
				path: '/management/security/audit-trail/',
				name: 'AuditTrail',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/security/AuditTrail.vue'),
				}
			}, {
				path: '/management/security/security-log/',
				name: 'SecurityLog',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/security/SecurityLog.vue'),
				}
			}, {
				path: '/management/security/unconfigured-numbers/',
				name: 'UnconfiguredNumbers',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/security/UnconfiguredNumbers.vue'),
				}
			}, {
				path: '/management/monitoring/messaging-sent/',
				name: 'MessagingSent',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/monitoring/MessagingSent.vue'),
				}
			}, {
				path: '/management/monitoring/messaging-log/',
				name: 'MessagingLog',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/monitoring/MessagingLog.vue'),
				}
			}, {
				path: '/management/departments/',
				name: 'Departments',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/departments/Departments.vue'),
				}
			}, {
				path: '/management/cost-center/',
				name: 'Cost-Center',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/cost-center/Cost-Center.vue'),
				}
			}, {
				path: '/management/ip-whitelist/',
				name: 'IP-Whitelist',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/ip-whitelist/IP-Whitelist.vue'),
				}
			}, {
				path: '/management/rest-apis/',
				name: 'REST-apis',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('../components/restapis/Restapis.vue'),
				}
			}, {
				path: '/management/notetemplates/',
				name: 'Notettemplates',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/notetemplates/TemplateList.vue'),
				}
			}, {
				path: '/media/mediabeheer/',
				name: 'MediaManagement',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/dashboards/MediaManagement.vue'),
				}
			}, {
                path: '/media/livemedia/',
				name: 'LiveMedia',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/dashboards/LiveMedia.vue'),
				}
			}, {
				path: '/availability/numbers/',
				name: 'ServiceNumbers',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/servicenumbers/ServiceNumbers.vue'),
				}
			}, {
				path: '/availability/virtual-queue/',
				name: 'VirtualQueue',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/virtual-queue/VirtualQueue.vue'),
				}
			}, {
				path: '/availability/servicenumbers/',
				name: 'ServiceNumbersList',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/servicenumbers/ServiceNumbersList.vue'),
				}
			}, {
				path: '/availability/call-flow/manage/',
				name: 'ScriptLibrary',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/scriptmanager/ScriptLibrary.vue'),
				}
			}, {
				path: '/availability/call-groups/staffing/',
				name: 'RoutingGroup',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/routinggroup/Routinggroup.vue'),
				}
			}, {
				path: '/availability/call-groups/manage/',
				name: 'CallGroups',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/call-groups/CallGroups.vue'),
				}
			}, {
				path: '/availability/call-flow/opening-hours/',
				name: 'Openingprofiles',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/openinghours/Openingprofiles.vue'),
				}
			}, {
				path: '/availability/call-flow/codelist/',
				name: 'CodelistList',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/codelist/CodelistList.vue'),
				}
			}, {
				path: '/availability/call-flow/call-divider/',
				name: 'CallDividerList',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/calldivider/CallDividerList.vue'),
				}
			}, {
				path: '/availability/call-flow/prompts/',
				name: 'PromptsList',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/prompts/PromptsList.vue'),
				}
			}, {
				path: '/availability/campaign/',
				name: 'CampaignManager',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/campaignmanager/CampaignManager.vue'),
				}
			}, {
				path: '/management/destinations/',
				name: 'DestinationsList',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/destinations/DestinationsList.vue'),
				}
			}, {
				path: '/availability/thresholds/',
				name: 'Thresholds',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/real-time-adherence/RealTimeAdherenceThresholds.vue'),
				}
			}, {
				path: '/availability/mapping/',
				name: 'Mapping',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/real-time-adherence/RealTimeAdherenceMapping.vue'),
				}
			}, {
				path: '/helpcenter/',
				name: 'Helpcenter',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/helpcenter/Helpcenter.vue'),
				}
			}, {
				path: '/management/helpcenter/',
				name: 'HelpcenterManagement',
				beforeEnter: roleAndLoggedInCheck,
				components: {
					body: () => import('./../components/helpcenter/HelpcenterManagement.vue'),
				}
			}
		]
	}, {
		path: '/logout/',
		name: 'logout',
		component: () => import('./../components/logout/LogOut.vue'),
	}
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;