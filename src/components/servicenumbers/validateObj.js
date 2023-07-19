
import { store }          from './../../store/cmStore';

export const VALIDATE = [
  {
    propertyname    : 'ServiceNumberTitle',
    validationvalue : 'isNotEmpty',
    errormessage    : store.state.settings.portal.emservicenumbertitle,
    errortab        : '0'
  },
  {
    propertyname    : 'CallGroup1',
    validationvalue : 'isNotEmpty',
    errormessage    : store.state.settings.portal.emcallgroup1,
    errortab        : '2'
  },
  {
    propertyname    : 'OpeningHours.Title',
    validationvalue : 'isNotEmpty',
    errormessage    : store.state.settings.portal.emopeninghourstitle,
    errortab        : '1'
  },
  {
    propertyname    : 'WelcomePrompt',
    validationvalue : 'isNotNull',
    errormessage    : store.state.settings.portal.emwelcomeprompt,
    errortab        : '0'
  },
  {
    propertyname    : 'ClosePrompt',
    validationvalue : 'isNotEmpty',
    errormessage    : store.state.settings.portal.emclosedprompt,
    errortab        : '1'
  },
  {
    propertyname    : 'VoicemailPrompt',
    validationvalue : 'isNotNull',
    errormessage    : store.state.settings.portal.emvoicemailprompt,
    errortab        : '3'
  },
  {
    propertyname    : 'VoicemailEmailAddress',
    validationvalue : 'isEmail',
    errormessage    : store.state.settings.portal.emvoicemailemailaddress,
    errortab        : '3'
  }
];