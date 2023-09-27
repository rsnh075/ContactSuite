export const MENU = {
	"mainMenuItems" : [
		{
			"label"     : {
				"nl" : "Home",
				"en" : "Home"
			},
			"Icon"      : "Home",
			"Code"      : "Home",
			"url"       : "/home/",
			"appColor"  : "213A8F",
			"appMenu"   : []
		},{
			"label"     : {
				"nl" : "Interactie",
				"en" : "Interaction"
			},
			"Icon"      : "Headset",
			"Code"      : "ModuleInteractie",
			"url"       : "/interaction/",
			"appColor"  : "F39200",
			"appMenu"   : []
		},{
			"label"     : {
				"nl" : "Performance",
				"en" : "Performance"
			},
			"Icon"      : "Tune",
			"Code"      : "ModulePerformance",
			"url"       : "/performance/",
			"appColor"  : "4BAAF0",
			"appMenu"   : [
				{
				"label"     : {
					"nl" : "Agenten",
					"en" : "Agents"
				},
				"Icon"      : "Account",
				"Code"      : "AgentenDashboard",
				"url"       : "/performance/agentdashboard/",
				"subMenu"   : []
				},{
				"label"     : {
					"nl" : "Belgroepen",
					"en" : "Call groups"
				},
				"Icon"      : "AccountMultiple",
				"Code"      : "WachtrijenDashboard",
				"url"       : "/performance/queues/",
				"subMenu"   : []
				},{
				"label"     : {
					"nl" : "Outbound monitor",
					"en" : "Outbound monitor"
				},
				"Icon"      : "AccountMultiple",
				"Code"      : "OutboundMonitor",
				"url"       : "/performance/outboundmonitor/",
				"subMenu"   : []
				},{
				"label"     : {
					"nl" : "Evaluatie",
					"en" : "Evaluation"
				},
				"Icon"      : "RecordCircleOutline",
				"Code"      : "OpnamenAfspelenGebruiker",
				"url"       : "/performance/recordingmonitor/",
				"subMenu"   : []
				},{
				"label"     : {
					"nl" : "Nummers",
					"en" : "Numbers"
				},
				"Icon"      : "Dialpad",
				"Code"      : "SNummersDashboard",
				"url"       : "/performance/numbers/",
				"subMenu"   : []
				},{
				"label"     : {
					"nl" : "Adherence",
					"en" : "Adherence"
				},
				"Icon"      : "ClockOutline",
				"Code"      : "Adherence",
				"url"       : "/performance/adherence/",
				"subMenu"   : []
				},{
				"label"     : {
					"nl" : "Wall screens",
					"en" : "Wall screens"
				},
				"Icon"      : "DesktopMacDashboard",
				"Code"      : "ScreenConfig",
				"url"       : "/performance/wallscreen-config/",
				"subMenu"   : []
				}
			]
		},{
			"label"     : {
				"nl" : "Rapportage",
				"en" : "Reports"
			},
			"Icon"      : "ChartLine",
			"Code"      : "ModuleRapportage",
			"url"       : "/reports/",
			"appColor"  : "E6332A",
			"appMenu"   : [
				{
					"label"     : {
					"nl" : "Introductie",
					"en" : "Introduction"
					},
					"Icon"      : "ChartLine",
					"Code"      : "ModuleRapportage",
					"url"       : "/reports/home/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "VoIP gesprekken",
						"en" : "VoIP Calls"
					},
					"Icon"      : "PhoneVoip",
					"Code"      : "Home",
					"url"       : "/reports/voIP/",
					"subMenu"   : [
						{
						"label"     : {
							"nl" : "VoIP inkomend",
							"en" : "VoIP incoming"
						},
						"Icon"      : "PhoneVoip",
						"Code"      : "VoipRapportage",
						"url"       : "/reports/VoIP/voip-incoming-calls/",
						"subMenu"   : []
						},{
						"label"     : {
							"nl" : "VoIP inkomend bèta",
							"en" : "VoIP incoming bèta"
						},
						"Icon"      : "PhoneVoip",
						"Code"      : "VoipRapportage_beta",
						"url"       : "/reports/VoIP/voip-incoming-calls-beta/",
						"subMenu"   : []
						}
					]
				},{
					"label"     : {
						"nl" : "Nummers",
						"en" : "Inbound"
					},
					"Icon"      : "Dialpad",
					"Code"      : "Home",
					"url"       : "/reports/inbound/",
					"subMenu"   : [
						{
							"label"     : {
								"nl" : "Nummers",
								"en" : "Inbound"
							},
							"Icon"      : "Dialpad",
							"Code"      : "NummerRapportage",
							"url"       : "/reports/inbound/incoming-calls/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Nummers bèta",
								"en" : "Inbound bèta"
							},
							"Icon"      : "Dialpad",
							"Code"      : "NummerRapportage_beta",
							"url"       : "/reports/inbound/incoming-calls-beta/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Verkeersanalyse",
								"en" : "Traffic insights"
							},
							"Icon"      : "Dialpad",
							"Code"      : "NummerRapportage",
							"url"       : "/reports/inbound/calls-insights/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Historisch per dag",
								"en" : "Historical per day"
							},
							"Icon"      : "Dialpad",
							"Code"      : "NummerRapportage_Historisch_per_dag",
							"url"       : "/reports/inbound/historical-per-day/",
							"subMenu"   : []
						},{
                            "label"     : {
								"nl" : "Analyse per dag",
								"en" : "Insights per day"
							},
							"Icon"      : "Dialpad",
							"Code"      : "NummerRapportage",
							"url"       : "/reports/inbound/insights-per-day/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "ASR Analyse",
								"en" : "ASR Insights"
							},
							"Icon"      : "Dialpad",
							"Code"      : "NummerRapportage_CB_ASR",
							"url"       : "/reports/inbound/asr-insights/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Media",
								"en" : "Media"
							},
							"Icon"      : "Dialpad",
							"Code"      : "Media",
							"url"       : "/reports/inbound/media-calls/",
							"subMenu"   : []
						}
					]
				},{
					"label"     : {
						"nl" : "Belgroepen",
						"en" : "Call groups"
					},
					"Icon"      : "AccountMultiple",
					"Code"      : "Home",
					"url"       : "/reports/call-groups/",
					"subMenu"   : [
						{
							"label"     : {
								"nl" : "Belgroepen",
								"en" : "Call groups"
							},
							"Icon"      : "AccountMultiple",
							"Code"      : "WachtrijRapportage",
							"url"       : "/reports/call-groups/call-groups/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Belgroepen bèta",
								"en" : "Call groups bèta"
							},
							"Icon"      : "AccountMultiple",
							"Code"      : "WachtrijRapportage_beta",
							"url"       : "/reports/call-groups/call-groups-beta/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "AHT",
								"en" : "AHT"
							},
							"Icon"      : "ClockStart",
							"Code"      : "WachtrijAHTRapportage",
							"url"       : "/reports/call-groups/call-groups-aht/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "SLA",
								"en" : "SLA"
							},
							"Icon"      : "Speedometer",
							"Code"      : "WachtrijSLARapportage",
							"url"       : "/reports/call-groups/call-groups-sla/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Belgroepen Analyse",
								"en" : "Call Groups Insights"
							},
							"Icon"      : "AccountSwitch",
							"Code"      : "WachtrijDetailsRapportage",
							"className" : "menu-aside__item--reports-queuedetails",
							"url"       : "/reports/call-groups/call-groups-queuedetails/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Belgroepen Analyse bèta",
								"en" : "Call Groups Insights bèta"
							},
							"Icon"      : "AccountSwitch",
							"Code"      : "WachtrijRapportage_beta",
							"url"       : "/reports/call-groups/call-groups-queuedetails-beta/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Bel redenen",
								"en" : "Call Dispositions"
							},
							"Icon"      : "ViewGrid",
							"Code"      : "WachtrijRapportage",
							"url"       : "/reports/call-groups/cdc/",
							"subMenu"   : []
						},{
                            "label"     : {
								"nl" : "Eindbestemmingen",
								"en" : "Extentions"
							},
							"Icon"      : "PhoneClassic",
							"Code"      : "WachtrijRapportage",
							"url"       : "/reports/call-groups/extentions/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Agenten",
								"en" : "Agents"
							},
							"Icon"      : "Account",
							"Code"      : "AgentRapportage",
							"url"       : "/reports/call-groups/agents/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Agenten bèta",
								"en" : "Agents bèta"
							},
							"Icon"      : "Account",
							"Code"      : "WachtrijRapportage_beta",
							"url"       : "/reports/call-groups/agents-beta/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Agent Status",
								"en" : "Agent Status"
							},
							"Icon"      : "Account",
							"Code"      : "AgentStatusRapportage",
							"url"       : "/reports/call-groups/agent-status/",
							"subMenu"   : []
						}
					]
				},{
					"label"     : {
						"nl" : "Gespreksgeschiedenis",
						"en" : "Call history"
					},
					"Icon"      : "History",
					"Code"      : "Home",
					"url"       : "/reports/call-history/",
					"subMenu"   : [
						{
							"label"     : {
								"nl" : "Gespreksgeschiedenis",
								"en" : "Call history"
							},
							"Icon"      : "History",
							"Code"      : "GespreksGeschiedenis",
							"url"       : "/reports/call-history/call-history/",
							"subMenu"   : []
						},{
                            "label"     : {
								"nl" : "Gespreksanalyse",
								"en" : "Call analysis"
							},
							"Icon"      : "History",
							"Code"      : "GespreksGeschiedenis",
							"url"       : "/reports/call-history/call-history-details/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Gespreksgeschiedenis bèta",
								"en" : "Call history bèta"
							},
							"Icon"      : "History",
							"Code"      : "GespreksGeschiedenis_beta",
							"url"       : "/reports/call-history/call-history-beta/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Historisch",
								"en" : "Historical"
							},
							"Icon"      : "History",
							"Code"      : "Rapportage2.0",
							"url"       : "/reports/history/",
							"subMenu"   : []
						}
					]
				},{
					"label"     : {
					  "nl" : "Outbound",
					  "en" : "Outbound"
					},
					"Icon"      : "PhoneOutgoing",
					"Code"      : "Home",
					"url"       : "/reports/outbound/",
					"subMenu"   : [
					  {
						"label"     : {
						  "nl" : "Campagne voortgang",
						  "en" : "Campagne progress"
						},
						"Icon"      : "PhoneOutgoing",
						"Code"      : "CampagneVoortgangRapportage",
						"url"       : "/reports/outbound/campagne-progress/",
						"subMenu"   : []
					  }, {
						"label"     : {
						  "nl" : "Agenten",
						  "en" : "Agents"
						},
						"Icon"      : "PhoneOutgoing",
						"Code"      : "CampagneVoortgangRapportage",
						"url"       : "/reports/outbound/campagne-agents/",
						"subMenu"   : []
					  }
					]
				  },{
					"label"     : {
						"nl" : "Resellers",
						"en" : "Resellers"
					},
					"Icon"      : "Domain",
					"Code"      : "Home",
					"url"       : "/reports/resellers/",
					"subMenu"   : [
						{
						"label"     : {
							"nl" : "Klanten",
							"en" : "Customers"
						},
						"Icon"      : "Domain",
						"Code"      : "RapportageResellerNummers",
						"url"       : "/reports/resellers/customers/",
						"subMenu"   : []
						},{
						"label"     : {
							"nl" : "Klanten bèta",
							"en" : "Customers bèta"
						},
						"Icon"      : "Domain",
						"Code"      : "RapportageResellerNummers_beta",
						"url"       : "/reports/resellers/customers-beta/",
						"subMenu"   : []
						}
					]
				},{
					"label"     : {
						"nl" : "Verkeer",
						"en" : "Traffic"
					},
					"Icon"      : "Dialpad",
					"Code"      : "Home",
					"url"       : "/reports/traffic/",
					"subMenu"   : [
						{
							"label"     : {
								"nl" : "Verkeer",
								"en" : "Traffic"
							},
							"Icon"      : "Dialpad",
							"Code"      : "VerkeerNIDRapportage",
							"url"       : "/reports/traffic/traffic",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Verkeer bèta",
								"en" : "Traffic bèta"
							},
							"Icon"      : "Dialpad",
							"Code"      : "VerkeerNIDRapportage_beta",
							"url"       : "/reports/traffic/traffic-beta",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Gespreksanalyse",
								"en" : "Call Analytics"
							},
							"Icon"      : "Dialpad",
							"Code"      : "VerkeerNIDRapportage",
							"url"       : "/reports/traffic/call-analytics",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Gesprekslog",
								"en" : "Call Log"
							},
							"Icon"      : "Dialpad",
							"Code"      : "VerkeerNIDRapportage",
							"url"       : "/reports/traffic/call-log",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Bedrijven",
								"en" : "Companies"
							},
							"Icon"      : "Dialpad",
							"Code"      : "VerkeerNIDRapportage",
							"url"       : "/reports/traffic/companies",
							"subMenu"   : []
						}
					]
				}
			]
		},{
			"label"     : {
				"nl" : "Media",
				"en" : "Media"
			},
			"Icon"      : "Filmstrip",
			"Code"      : "Media",
			"url"       : "/media/",
			"appColor"  : "662483",
			"appMenu"   : [
                {
                    "label"     : {
                        "nl" : "Media beheer",
                        "en" : "Media configuration"
                    },
                    "Icon"      : "AccountMultiple",
                    "Code"      : "Media",
                    "url"       : "/media/mediabeheer/",
                    "subMenu"   : []
                },{
                    "label"     : {
                        "nl" : "Media rapport",
                        "en" : "Media report"
                    },
                    "Icon"      : "AccountMultiple",
                    "Code"      : "MediaNRapport",
                    "url"       : "/media/livemedia/",
                    "subMenu"   : []
                }
            ]
		},{
			"label"     : {
				"nl" : "Bereikbaarheid",
				"en" : "Availability"
			},
			"Icon"      : "DirectionsFork",
			"Code"      : "Bereikbaarheid",
			"url"       : "/availability/",
			"appColor"  : "3AAA35",
			"appMenu"   : [
				{
					"label"     : {
						"nl" : "Nummers",
						"en" : "Numbers"
					},
					"Icon"      : "Dialpad",
					"Code"      : "Belplan",
					"url"       : "/availability/numbers/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Servicenummers",
						"en" : "Servicenumbers"
					},
					"Icon"      : "Dialpad",
					"Code"      : "Servicenummers",
					"url"       : "/availability/servicenumbers/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Belgroepen",
						"en" : "Call groups"
					},
					"Icon"      : "AccountDetails",
					"Code"      : "Home",
					"url"       : "/availability/call-groups/",
					"subMenu"   : [
						{
						"label"     : {
							"nl" : "Beheren",
							"en" : "Manage"
						},
						"Icon"      : "AccountDetails",
						"Code"      : "Wachtrij",
						"url"       : "/availability/call-groups/manage/",
						"subMenu"   : []
						},{
						"label"     : {
							"nl" : "Bezetting",
							"en" : "Staffing"
						},
						"Icon"      : "AccountMultiple",
						"Code"      : "BelgroepBezettingMenu",
						"url"       : "/availability/call-groups/staffing/",
						"subMenu"   : []
						}
					]
				},{
					"label"     : {
						"nl" : "Bel mij terug",
						"en" : "Call me back"
					},
					"Icon"      : "AccountArrowRight",
					"Code"      : "BelMijTerug",
					"url"       : "/availability/virtual-queue/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Belplan",
						"en" : "Call flow"
					},
					"Icon"      : "ArrowDecision",
					"Code"      : "Home",
					"url"       : "/availability/call-flow/",
					"subMenu"   : [
						{
							"label"     : {
								"nl" : "Beheren",
								"en" : "Manage"
							},
							"Icon"      : "ArrowDecision",
							"Code"      : "ScriptManager",
							"url"       : "/availability/call-flow/manage/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Meldingen",
								"en" : "Prompts"
							},
							"Icon"      : "Music",
							"Code"      : "Meldingen",
							"url"       : "/availability/call-flow/prompts/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Openingstijden",
								"en" : "Opening hours"
							},
							"Icon"      : "ClockTimeFourOutline",
							"Code"      : "Openingstijden",
							"url"       : "/availability/call-flow/opening-hours/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Codelijst",
								"en" : "Code list"
							},
							"Icon"      : "ClipboardTextOutline",
							"Code"      : "Codelijsten",
							"url"       : "/availability/call-flow/codelist/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Gesprekken verdeler",
								"en" : "Call divider"
							},
							"Icon"      : "CallSplit",
							"Code"      : "CallDividerMenu",
							"url"       : "/availability/call-flow/call-divider/",
							"subMenu"   : []
						}
					]
				}, {
					"label"     : {
					"nl" : "Campagne",
					"en" : "Campaign"
					},
					"Icon"      : "Bullhorn",
					"Code"      : "OutboundManager",
					"url"       : "/availability/campaign/",
					"subMenu"   : []
				}, {
					"label"     : {
					"nl" : "Thresholds",
					"en" : "Thresholds"
					},
					"Icon"      : "TuneVertical",
					"Code"      : "SupervisorRTA",
					"url"       : "/availability/thresholds/",
					"subMenu"   : []
				},{
					"label"     : {
					"nl" : "Mapping",
					"en" : "Mapping"
					},
					"Icon"      : "TableLarge",
					"Code"      : "BeheerRTA",
					"url"       : "/availability/mapping/",
					"subMenu"   : []
				}
			]
		},{
			"label"     : {
				"nl" : "Beheer",
				"en" : "Settings"
			},
			"Icon"      : "Cog",
			"Code"      : "ModuleBeheer",
			"url"       : "/management/",
			"appColor"  : "B28879",
			"appMenu"   : [
				{
					"label"     : {
						"nl" : "Klanten",
						"en" : "Customers"
					},
					"Icon"      : "Domain",
					"Code"      : "Reseller",
					"url"       : "/management/customers/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Gebruikers",
						"en" : "Users"
					},
					"Icon"      : "AccountMultiple",
					"Code"      : "BasisBeheerGebruikers",
					"url"       : "/management/users/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Rollen",
						"en" : "Roles"
					},
					"Icon"      : "ShieldAccount",
					"Code"      : "BeheerRollen",
					"url"       : "/management/roles/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "VoIP accounts",
						"en" : "VoIP accounts"
					},
					"Icon"      : "PhoneVoip",
					"Code"      : "BeheerVOIP",
					"url"       : "/management/voipaccounts/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Bestemmingen",
						"en" : "Destinations"
					},
					"Icon"      : "PhoneClassic",
					"Code"      : "Extensies",
					"url"       : "/management/destinations/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Werkplekken",
						"en" : "Workstations"
					},
					"Icon"      : "DesktopTower",
					"Code"      : "Werkplekken",
					"url"       : "/management/workstations/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Afdelingen",
						"en" : "Departments"
					},
					"Icon"      : "OfficeBuilding",
					"Code"      : "Afdelingen",
					"url"       : "/management/departments/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Kostenplaatsen",
						"en" : "Cost center"
					},
					"Icon"      : "CashMultiple",
					"Code"      : "Kostenplaatsen",
					"url"       : "/management/cost-center/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Whitelist",
						"en" : "Whitelist"
					},
					"Icon"      : "FormatListChecks",
					"Code"      : "Wittelijst",
					"url"       : "/management/ip-whitelist/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "REST API's",
						"en" : "REST API's"
					},
					"Icon"      : "CloudOutline",
					"Code"      : "RestApiBeheer",
					"url"       : "/management/rest-apis/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Notities",
						"en" : "Notes"
					},
					"Icon"      : "TextSubject",
					"Code"      : "NotitieBeheer",
					"url"       : "/management/notetemplates/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Apparaten",
						"en" : "Devices"
					},
					"Icon"      : "Monitor",
					"Code"      : "Apparaten",
					"url"       : "/management/devices/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Licenties",
						"en" : "License"
					},
					"Icon"      : "Certificate",
					"Code"      : "Licentie",
					"url"       : "/management/license/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Security",
						"en" : "Security"
					},
					"Icon"      : "Shield",
					"Code"      : "Home",
					"url"       : "/management/security/",
					"subMenu"   : [
						{
							"label"     : {
								"nl" : "Audit log",
								"en" : "Audit log"
							},
							"Icon"      : "ConsoleNetwork",
							"Code"      : "AuditTrail",
							"url"       : "/management/security/audit-trail/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Security log",
								"en" : "Security log"
							},
							"Icon"      : "Lock",
							"Code"      : "SecurityLogMenu",
							"url"       : "/management/security/security-log/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Ongeconfigureerde SN",
								"en" : "Unconfigured Numbers"
							},
							"Icon"      : "LockAlert",
							"Code"      : "NummerToewijzen",
							"url"       : "/management/security/unconfigured-numbers/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Wijzig wachtwoord",
								"en" : "Change password"
							},
							"Icon"      : "Key",
							"Code"      : "ChangePassword",
							"url"       : "/management/security/change-pwd/",
							"subMenu"   : []
						},
					]
				},{
					"label"     : {
						"nl" : "Monitoring",
						"en" : "Monitoring"
					},
					"Icon"      : "Binoculars",
					"Code"      : "Home",
					"url"       : "/management/monitoring/",
					"subMenu"   : [
						{
							"label"     : {
								"nl" : "Verzonden berichten",
								"en" : "Sent messages"
							},
							"Icon"      : "Binoculars",
							"Code"      : "MessagingMonitoring",
							"url"       : "/management/monitoring/messaging-sent/",
							"subMenu"   : []
						},{
							"label"     : {
								"nl" : "Berichten log",
								"en" : "Message log"
							},
							"Icon"      : "Binoculars",
							"Code"      : "MessagingLog",
							"url"       : "/management/monitoring/messaging-log/",
							"subMenu"   : []
						},
					]
				},{
					"label"     : {
						"nl" : "Documenten",
						"en" : "Documents"
					},
					"Icon"      : "Download",
					"Code"      : "Documenten",
					"url"       : "/management/documents/",
					"subMenu"   : []
                },{
					"label"     : {
						"nl" : "External Tooling",
						"en" : "External Tooling"
					},
					"Icon"      : "Tools",
					"Code"      : "ProductManagement",
					"url"       : "/management/externaltooling/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Asset beheer",
						"en" : "Asset management"
					},
					"Icon"      : "DatabaseCheck",
					"Code"      : "ProductManagement",
					"url"       : "/management/assets/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Licentie beheer",
						"en" : "License management"
					},
					"Icon"      : "BriefcaseEdit",
					"Code"      : "ProductManagement",
					"url"       : "/management/license-settings/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "E-mail script",
						"en" : "E-mail script"
					},
					"Icon"      : "EmailPlus",
					"Code"      : "MailToScript",
					"url"       : "/management/configurator/",
					"subMenu"   : []
				},{
					"label"     : {
						"nl" : "Help onderhoud",
						"en" : "Help Management"
					},
					"Icon"      : "HelpCircle",
					"Code"      : "HelpCenterBeheerMenu",
					"url"       : "/management/helpcenter/",
					"subMenu"   : []
				}
			]
		},{
			"label"     : {
				"nl" : "Help Center",
				"en" : "Help Center"
			},
			"Icon"      : "HelpCircle",
			"Code"      : "HelpCenterMenu",
			"url"       : "/helpcenter/",
			"appColor"  : "538BE0",
			"appMenu"   : []
		}
	]
}