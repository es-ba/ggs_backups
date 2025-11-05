"use strict";

import { TableDefinition } from "./types-ggs_backups";

export function grilla_rea_sin_blaise(): TableDefinition {
    var definition: TableDefinition = {
        name: "reas_sin_blaise",
        elementName: "rea_sin_blaise",
        title: "Rea sin Blaise",
        tableName: "personas",
        // editable:true,
        allow: {import:false, delete:false, insert: false, deleteAll:false, select:true, export: true, update:true},
        fields: [
            {name:'enc'      ,  typeName: 'text'   , editable: false },
            {name:'hogar'      ,  typeName: 'integer'   , editable: false },
            {name:'idblaise'      ,  typeName: 'integer'   , editable: false },
            {name:'f_realiz_o'      ,  typeName: 'date'   , editable: false },
            {name:'rea'      ,  typeName: 'integer'   , editable: false },
            {name:'norea'      ,  typeName: 'integer'   , editable: false },
            {name:'cant_h'      ,  typeName: 'integer'   , editable: false },
            {name:'nombre'      ,  typeName: 'text'   , editable: false },
            {name:'edad'      ,  typeName: 'bigint'   , editable: false },
            {name:'sexo'      ,  typeName: 'bigint'   , editable: false },
            {name:'nacms'      ,  typeName: 'text'   , editable: false },
            {name:'tarea'      ,  typeName: 'text'   , editable: false },
            {name:'operacion'      ,  typeName: 'text'   , editable: false },
            {name:'encuestador'      ,  typeName: 'text'   , editable: false },
            {name:'recuperador'      ,  typeName: 'text'   , editable: false },
            {name:'supervisor'      ,  typeName: 'text'   , editable: false },
            // {name:'recepcionista'      ,  typeName: 'text'   , editable: false },
            {name:'verif_campo'      ,  typeName: 'text'   , editable: false },
            {name:'fin_1'      ,  typeName: 'bigint'   , editable: false },
            {name:'fin_3'      ,  typeName: 'bigint'   , editable: false },
            {name:'obs_faltantes'      ,  typeName: 'text'   , editable: true },
        ],
        primaryKey: ["hogar", "enc", "idblaise"],
        sql: {
            isTable:false,
            from:`(select th.*, t.rea, t.norea, t.cant_h, --t.encuestador, t.recuperador, t.supervisor, t.recepcionista,
                h.f_realiz_o,
                p.nombre, p.edad, p.sexo, p.nacms, p.fin_1, p.fin_3, p.obs_faltantes,
                tt.verif_campo, tt.tarea, 
                tt.etareas->tt.tarea->>'operacion' as operacion,
                tt.etareas->'encu'->>'asignado' as encuestador,
                tt.etareas->'recu'->>'asignado' as recuperador,
                tt.etareas->'supe'->>'asignado' as supervisor,
                b.respid 
                from base.tem_blaise th
                join base.hogares h on (th.operativo = h.operativo and th.enc=h.vivienda and th.hogar=h.hogar)
                join base.tem t on t.operativo=h.operativo and t.enc=h.vivienda
                left join base.personas p on (p.operativo = th.operativo AND p.vivienda = th.enc AND p.hogar = th.hogar AND th.idblaise = p.id_blaise::integer)
                left join lateral (
                    select 
                        case when 
                            (COUNT(*) filter (where tt.tarea in ('encu','recu'))) = 
                            (COUNT(verificado) filter (where tt.tarea in ('encu','recu'))) 
                                then '1' else null end verif_campo,
                        max(tt.tarea) tarea,
                        jsonb_object_agg(
                            tarea,
                            jsonb_build_object('asignado',asignado, 'operacion', operacion)
                        ) etareas 
                      from base.tareas_tem tt 
                      where tt.operativo = th.operativo AND tt.enc=th.enc 
                         and tt.asignado is not null and tt.operacion is not null
                ) as tt on true
                left join backups.backups b on (th.idblaise = b.respid)
                where (t.rea=1 or t.rea=4) 
                and b.respid is null)`,
            insertIfNotUpdate:false
        }
    }
  return definition;
}
