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
    ...
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
