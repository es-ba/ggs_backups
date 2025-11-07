export const staticConfigYaml = `
server:
  port: 3021
  session-store: memory-saved
db:
  motor: postgresql
  description: solo schema para app ggs_backups
  host: localhost
  database: ggs_db
  schema: backups
  user: ggs_backups_admin
data:
  transformers:
    text: normal
login:
  infoFieldList: [usuario, rol, idper]
  table: usuarios
  userFieldName: usuario
  passFieldName: md5clave
  rolFieldName: rol
  activeClausule: activo
  unloggedLandPage: false
  plus:
    allowHttpLogin: true
    fileStore: true
    loginForm:
      formTitle: entrada
      formImg: img/login-lock-icon.png
client-setup:
  menu: true
  lang: es
  user-scalable: no
install:
  dump:
    db:
      owner: ggs_owner
    enances: inline
    scripts:
      post-adapt:
logo: 
  path: client/img
`;
