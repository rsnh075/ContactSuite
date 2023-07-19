let _browserLanguage    = window.navigator.userLanguage || window.navigator.language;
const browserLanguage   = String(_browserLanguage.split("-")[0]).toLowerCase();

export let SUBSCRIPTION_LABELS = {};

const SUBSCRIPTION_LABELS_EN = {
  'routinggroupinfo' : {
    'datapoints' : [
      { name: "NumberOfCallsInWaitingQueue", label: "Queue", unit: "88" },
      { name: "NumberOfVirtualCallsInQWaitingQueue", label: "Call me back", unit: "88" },
      { name: "LongestWaitingTime", label: "Waiting time", unit: "88m88s" },
      { name: "AgentsCalling", label: "Busy", unit: "88" },
      { name: "AgentsAvailable", label: "Available", unit: "88" },
      { name: "AgentsNotAvaliable", label: "Unavailable", unit: "88" },
      { name: "Reachability", label: "Reachability", unit: "88%" },
      { name: "AverageSpeedOfAnswer", label: "ASA", unit: "88m88s" },
      { name: "NumberOfAnsweredCalls", label: "Calls", unit: "88" },
      { name: "NumberOfAbortedCalls", label: "Abandoned", unit: "88" },
      { name: "PercentageAnsweredWithinSLAOverall", label: "Servicelevel (today)", unit: "88%" },
      { name: "PercentageAnsweredInCorrectGroup", label: "Hit rate", unit: "88%" },
    ],
    'totaldatapoints' : [
      { name: "NumberOfCallsInWaitingQueue", label: "Queue", unit: "88" },
      { name: "NumberOfVirtualCallsInQWaitingQueue", label: "Call me back", unit: "88" },
      { name: "LongestWaitingTime", label: "Waiting time", unit: "88m88s" },
      { name: "AgentsCalling", label: "Busy", unit: "88" },
      { name: "AgentsAvailable", label: "Available", unit: "88" },
      { name: "AgentsNotAvaliable", label: "Unavailable", unit: "88" },
      { name: "Reachability", label: "Reachability", unit: "88%" },
      { name: "AverageSpeedOfAnswer", label: "ASA", unit: "88m88s" },
      { name: "NumberOfAnsweredCalls", label: "Calls", unit: "88" },
      { name: "NumberOfAbortedCalls", label: "Abandoned", unit: "88" },
      { name: "PercentageAnsweredWithinSLAOverall", label: "Servicelevel (today)", unit: "88%" },
      { name: "PercentageAnsweredInCorrectGroup", label: "Hit rate", unit: "88%" }
    ]
  }
};

const SUBSCRIPTION_LABELS_NL = {
  'routinggroupinfo' : {
    'datapoints' : [
      { name: "NumberOfCallsInWaitingQueue", label: "Wachtrij", unit: "88" },
      { name: "NumberOfVirtualCallsInQWaitingQueue", label: "Bel mij terug", unit: "88" },
      { name: "LongestWaitingTime", label: "Wachttijd", unit: "88m88s" },
      { name: "AgentsCalling", label: "In gesprek", unit: "88" },
      { name: "AgentsAvailable", label: "Beschikbaar", unit: "88" },
      { name: "AgentsNotAvaliable", label: "Niet beschikbaar", unit: "88" },
      { name: "Reachability", label: "Bereikbaarheid", unit: "88%" },
      { name: "AverageSpeedOfAnswer", label: "ASA", unit: "88m88s" },
      { name: "NumberOfAnsweredCalls", label: "Gesprekken", unit: "88" },
      { name: "NumberOfAbortedCalls", label: "Afgebroken", unit: "88" },
      { name: "PercentageAnsweredWithinSLAOverall", label: "Servicelevel (vandaag)", unit: "88%" },
      { name: "PercentageAnsweredInCorrectGroup", label: "Hit rate", unit: "88%" }
    ],
    'totaldatapoints' : [
      { name: "NumberOfCallsInWaitingQueue", label: "Wachtrij", unit: "88" },
      { name: "NumberOfVirtualCallsInQWaitingQueue", label: "Bel mij terug", unit: "88" },
      { name: "LongestWaitingTime", label: "Wachttijd", unit: "88m88s" },
      { name: "AgentsCalling", label: "In gesprek", unit: "88" },
      { name: "AgentsAvailable", label: "Beschikbaar", unit: "88" },
      { name: "AgentsNotAvaliable", label: "Niet beschikbaar", unit: "88" },
      { name: "Reachability", label: "Bereikbaarheid", unit: "88%" },
      { name: "AverageSpeedOfAnswer", label: "ASA", unit: "88m88s" },
      { name: "NumberOfAnsweredCalls", label: "Gesprekken", unit: "88" },
      { name: "NumberOfAbortedCalls", label: "Afgebroken", unit: "88" },
      { name: "PercentageAnsweredWithinSLAOverall", label: "Servicelevel (vandaag)", unit: "88%" },
      { name: "PercentageAnsweredInCorrectGroup", label: "Hit rate", unit: "88%" }
    ]
  }
};


if(browserLanguage == 'en')
  SUBSCRIPTION_LABELS = Object.assign({}, SUBSCRIPTION_LABELS_EN);
else
  SUBSCRIPTION_LABELS = Object.assign({}, SUBSCRIPTION_LABELS_NL);
