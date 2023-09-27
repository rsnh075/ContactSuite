# ContactSuitev3

## Project setup
```
get latest version form
https://massxess.visualstudio.com/Productlijnen/_git/ContactSuiteV3

run npm install

get a local version of IPCCC framwork from:
https://massxess.visualstudio.com/Productlijnen/_git/facades-IPCCCGUIServer
place the folders in: \public\js\

Edit the file \public\js\IPCCCGUI\IdentityServer\config.js and change the domainname to the local one.

var IPCCCIDSConfig = {
    Authority: "https://testidserver.ipccc.nl:5000",
    Redirect_uri: "https://local.contactsuite.nl:3000/js/IPCCCGUI/IdentityServer/callback.html",
    Response_type: "id_token token",
    Scope: "openid profile IPCCC_Scope",
    Post_logout_redirect_uri: "https://local.contactsuite.nl:3000/",
}

```

### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
production code is in the prod folder
```
