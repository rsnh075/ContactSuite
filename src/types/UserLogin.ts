export interface LoginSession {
    SessionId: string,
    ChatAddress: string,
    PhoneNumber: string,
    StatusId: number,
    Details: {
        ApiIdentity: string,
        FullName: string,
        UserCanSelectPhoneNumber: boolean,
        AskForPhoneNumber: boolean,
        ShowOnlyShortDialCodes: boolean,
        WorkplaceLogin: boolean,
        SupervisedRoutingGroups: [
            {
                Id: number,
                Name: string
            }
        ],
        Devices: [
            {
                Label: string,
                AddressType: number,
                Address: string,
                RegType: number,
                Default: boolean,
                Priority: number
            }
        ],
        UserId: number,
        OutboundIdentities: [
            {
                Id: number,
                Name: string
            }
        ],
        CurrentOutboundIdentityId: number,
        LoginTime: string,
        Services: string[],
        CustomerId: 1,
        Permissions: string[]
    },
    UserMustChangePassword: false,
    WaitingMessages: number,
    ShowLogoutWarning: false,
    Versions: [
        {
            Component: string,
            Version: string
        }
    ],
    Version: string,
    Note: {
        NoteId: number,
        TemplateId: number
    },
    CompanyCode: string
}