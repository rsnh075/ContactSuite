export interface Device {
  Name        : string,
  Address     : string,
  BrandType   : string,
  Priority    : number,
  Username    : string,
  Password    : string,
  SIPAddress  : string,
  Registrar   : string,
  MACAddress  : string,
  IsDefault   : boolean,
  IsWorkplace : boolean,
  Config      : string
}

 export interface MappedDeviceOptions {
  label   : string,
  value   : string,
  Address : string
}