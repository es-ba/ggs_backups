"use strict";

import { changing } from "best-globals";
import { backups } from "./table-backups";
import { TableDefinition } from "./types-ggs_backups";

export function grilla_match_id(): TableDefinition {
    let def = backups();
    def.title='Consistencias Blaise'
    const ggs_fields = [
        //campos base.tem_blaise
        {name:'idblaise'   ,  typeName: 'text',  editable: false },
        {name:'operativo'  ,  typeName: 'text',     editable: false },
        {name:'enc'        ,  typeName: 'text',     editable: false },
        // {name:'hogar'      ,  typeName: 'integer',  editable: false },
        //campos base.personas intercalados con campos espejo de backups (dem01,asex,dobm,doby)
        //podriamos agregar una variable construida con la comparacion de estos campos como en la grilla del censo
        {name:'msnombrei'    ,  typeName: 'text'   ,  editable: false },
        //campos base.tem
        {name:'rea'      ,  typeName: 'integer',  editable: false },
        {name:'norea'      ,  typeName: 'integer',  editable: false },
        //campos base.tareas_tem
        {name:'verif_campo'      ,  typeName: 'text',  editable: false },
    ]
    
    //@ts-ignore
    def.fields=[...ggs_fields, ...def.fields]
    
    // Solo se ven campos que pide procesamiento
    def.fields.forEach(f=>f.visible=false); // set all not visible
    const fieldsToShow = ['idblaise', 'operativo', 'enc', 'msnombrei', 'rea', 'norea', 'verif_campo', 'verificado_procesamiento', 'observaciones', 'resul_proc', 'lote', 'observaciones', 'respid', 
        //int01 ya no está en el nuevo backup (del 29/10 que mandó alex, sacamos de acá en adelante)
        //'int01', 'int02', 'dem01', 'dem02', 'dem03', 'dem06', 'dem07', 'dem08', 'dem09', 'dem11', 'dem14', 'dem21', 'gen01', 'gen02', 'gen11', 'gen25', 'gen44b', 'hhd24a', 'hhd28', 'hhd35', 'wel01', 'wel02', 'wel02a', 'lhi01', 'lhi02', 'att08', 'breportrep01', 'breportrep04', 'breportrep02', 'breportrep06', 'breportrep07', 'complete', 'agreedintro', 'begindate', 'begintime', 'enddate', 'endtime', 'numbiol', 'numstep', 'numadopt', 'totalchildren', 'hhd01b'
        ]
    
    fieldsToShow.forEach(fNameToShow=>{
        const fieldToShow=def.fields.find(f=>f.name===fNameToShow)
        if (!fieldToShow) throw new Error('columna no existente '+ fNameToShow)
        fieldToShow.visible = true
    })

    def.sql = changing(def.sql||{}, 
        {
            isTable:false,
            from:`(select tb.*,
                v.msnombrei,
                t.rea, t.norea, 
                tt.verif_campo,
                b.*
                from backups b 
                join base.tem_blaise tb on (b.respid = tb.idblaise)
                join base.tem t on t.operativo=tb.operativo and t.enc=tb.enc
                left join base.viviendas v on (v.operativo = tb.operativo AND v.vivienda = tb.enc AND tb.idblaise = v.id_blaise)
                left join lateral (
                    select case when count(*) = count(verificado) then max(tt.verificado)else null end verif_campo 
                      from base.tareas_tem tt 
                      where tt.operativo = tb.operativo AND tt.enc=tb.enc 
                        and tt.tarea in ('encu','recu') and tt.asignado is not null and tt.operacion is not null
                ) as tt on true
                left join backups otrob on b.respid=otrob.respid and otrob.lote <>b.lote and otrob.verificado_procesamiento
                    where 
                        b.verificado_procesamiento
                        or (b.lote = (select max(lote) from lotes))
                        and otrob.respid is null)`,
            insertIfNotUpdate:false
        })
  return def;
}