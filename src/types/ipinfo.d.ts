declare module 'ipinfo' {
  function ipinfo(ip: string | string[], callback: (err: any, cLoc: any) => void): void;
  export = ipinfo;
} 