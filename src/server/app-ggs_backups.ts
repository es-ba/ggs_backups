"use strict";

// import * as Path from 'path';
import {
  AppBackend,
  ExpressPlus,
  Request,
  ClientModuleDefinition,
  OptsClientPage,
  MenuDefinition,
  MenuInfoBase,
} from "backend-plus";
import * as MiniTools from "mini-tools";

// import {changing} from 'best-globals';

import { Proceduresggs_backups } from "./procedures-ggs_backups";
import { usuarios } from "./table-usuarios";
import { lotes } from "./table-lotes";
import { backups } from "./table-backups";
import { staticConfigYaml } from "./def-config";
import { grilla_match_id } from "./grilla_match_id";
// import { cod_padre } from "./grilla-cod_padre";
// import { cod_madre } from "./grilla-cod_madre";
// import { cod_ocupacion_actual } from "./grilla-cod_ocupacion_actual";
// import { cod_ocupacion_anterior } from "./grilla-cod_ocupacion_anterior";
// import { cod_pareja } from "./grilla-cod_pareja";

export class Appggs_backups extends AppBackend {
  constructor() {
    super();
  }
  async postConfig() {
    await super.postConfig();
  }
  configStaticConfig() {
    super.configStaticConfig();
    this.setStaticConfig(staticConfigYaml);
  }
  addSchrödingerServices(mainApp: ExpressPlus, baseUrl: string) {
    var be = this;
    if (baseUrl == "/") {
      baseUrl = "";
    }
    mainApp.get(baseUrl + "/pub", async function (req, res, _next) {
      // @ts-ignore useragent existe
      var { useragent } = req;
      var htmlMain = be
        .mainPage({ useragent }, false, { skipMenu: true })
        .toHtmlDoc();
      MiniTools.serveText(htmlMain, "html")(req, res);
    });
    super.addSchrödingerServices(mainApp, baseUrl);
  }
  addUnloggedServices(mainApp: ExpressPlus, baseUrl: string) {
    //var be=this;
    if (baseUrl == "/") {
      baseUrl = "";
    }
    super.addUnloggedServices(mainApp, baseUrl);
  }
  async getProcedures() {
    var be = this;
    return [...(await super.getProcedures()), ...Proceduresggs_backups].map(
      be.procedureDefCompleter,
      be
    );
  }
  
  getMenu(): MenuDefinition {
    var menuContent: MenuInfoBase[] = [];
    menuContent.push({ menuType: "table", name: "lotes" });
    menuContent.push({ menuType: "table", name: "backups" });
    menuContent.push({ menuType: "table", name: "grilla_match_id", label: 'consistencias blaise'});
    menuContent.push({ menuType: "menu", name: "codificacion", label: "codificación",
        menuContent: [ 
            { menuType: "table", name: "cod_padre"},
            { menuType: "table", name: "cod_madre"}, 
            { menuType: "table", name: "cod_ocupacion_actual"}, 
            { menuType: "table", name: "cod_ocupacion_anterior"}, 
            { menuType: "table", name: "cod_pareja"}, 
        ],
    });
    menuContent.push({ menuType: "menu", name: "config", label: "configurar",
        menuContent: [ { menuType: "table", name: "usuarios" }, ],
    });
    return { menu: menuContent };
  }
  clientIncludes(
    req: Request | null,
    opts: OptsClientPage
  ): ClientModuleDefinition[] {
    var menuedResources: ClientModuleDefinition[] =
      req && opts && !opts.skipMenu
        ? [
            { type: "js", src: "validadores.js" },
            { type: "js", src: "client.js" },
          ]
        : [{ type: "js", src: "unlogged.js" }];
    return [
      ...super.clientIncludes(req, opts),
      { type: "css", file: "menu.css" },
      ...menuedResources,
    ];
  }
  prepareGetTables() {
    super.prepareGetTables();
    this.getTableDefinition = {
      ...this.getTableDefinition,
      usuarios,
      lotes,
      backups,
      grilla_match_id,
      // cod_padre,
      // cod_madre,
      // cod_ocupacion_actual,
      // cod_ocupacion_anterior,
      // cod_pareja,
    };
  }
}
