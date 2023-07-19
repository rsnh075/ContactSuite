import { IPCCCManager, IPCCCMessageTypes } from './manager.js';
import { EventDispatcher } from '../lib/eventdispatcher.js';
import { IPCCCStatus } from '../js/status.js';
import { IPCCCData } from '../js/data.js';

class IPCCCContacts {
    static CachedContactList = null;

    static Update = new EventDispatcher(null, false);

    static Init = debug => {
        if (debug) {
            window.IPCCCContacts = IPCCCContacts;
        }
        IPCCCManager.MessageReceived.addHandler(IPCCCContacts.ProcessReceived);
        IPCCCManager.SendMessage(IPCCCMessageTypes.EnableContactUpdates, null, false);
    }

    static ContactListV2 =
        () => {
            return new Promise((resolve, reject) => {
                if(IPCCCContacts.CachedContactList) {
                    resolve(IPCCCContacts.CachedContactList);
                } else {
                    IPCCCData.RequestData('contactlist', null)
                    .then(contacts => {
                        IPCCCContacts.CachedContactList = JSON.parse(contacts);
                        resolve(IPCCCContacts.CachedContactList);
                    }).catch(err => reject(err));
                }
            });
        }

    static GetMe =
        () => {
            return new Promise((resolve, reject) => {
                IPCCCContacts.ContactListV2()
                .then((contactlist) => {
                    resolve(contactlist.find(contact => contact.IsMe));
                }).catch(err => reject(err));
            });
        }

    static UserList = () => {
        return new Promise((resolve, reject) => {
            IPCCCManager.SendMessage(IPCCCMessageTypes.GetUserList)
                .then(users => {
                    users.map(u => u.StatusDate = new Date(u.StatusDate));

                    resolve(users);
                }).catch(err => reject(err));
        });
    }

    static ProcessReceived = message => {
        if (message.Type === IPCCCMessageTypes.ContactUpdate) {
            var contact = message.Data;
            contact.StatusDate = new Date(contact.StatusDate);
            IPCCCStatus.GetStatus(contact.StatusId)
                .then(result => {
                    contact.Status = result;

                    if(IPCCCContacts.CachedContactList) {
                        let _idx = IPCCCContacts.CachedContactList.findIndex(c => c.Id == contact.Id);
                        if(_idx > -1) {
                            if(contact.Status.StatusId == -99) {//deletedContact
                                IPCCCContacts.CachedContactList.splice(_idx, 1);
                            } else {
                                //contactUpdate doesn't come with "IsMe","IsColleague","IsContact","IsOnline","InMyDepartment" this is obtained via IPCCCContacts.ContactListV2();
                                if (IPCCCContacts.CachedContactList[_idx].IsMe) { //update doesn't get to the addressbook because update handler isn't attached in time;
                                    contact.IsOnline = contact.StatusId > -1 ? 1 : 0;
                                }
                                contact.IsMe = IPCCCContacts.CachedContactList[_idx].IsMe;
                                contact.IsColleague = IPCCCContacts.CachedContactList[_idx].IsColleague;
                                contact.IsContact = IPCCCContacts.CachedContactList[_idx].IsContact;
                                contact.InMyDepartment = IPCCCContacts.CachedContactList[_idx].InMyDepartment;
                                IPCCCContacts.CachedContactList[_idx] = contact;
                            }
                        }
                        else {
                            contact.IsMe = false;
                            contact.IsColleague = 0;
                            contact.IsContact = contact.UserId > -1 ? 0 : 1;
                            contact.InMyDepartment = 0;
                            IPCCCContacts.CachedContactList.push(contact);
                        }
                    }
                    IPCCCContacts.Update.invoke(contact);
                })
                .catch(err => console.log('failed to get status', err)
            );
        }
    }
}

IPCCCContacts.Init(typeof window.IPCCCDebug !== "undefined" && window.IPCCCDebug);

export { IPCCCContacts }