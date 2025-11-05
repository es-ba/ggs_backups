"use strict";

import { changing } from "best-globals";
import { backups } from "./table-backups";
import { TableDefinition } from "./types-ggs_backups";

export function grilla_match_id(): TableDefinition {
    let def = backups();
    def.title='Consistencias Blaise'
    const ggs_fields = [
        //campos base.tem_blaise
        {name:'idblaise'   ,  typeName: 'integer',  editable: false },
        {name:'operativo'  ,  typeName: 'text',     editable: false },
        {name:'enc'        ,  typeName: 'text',     editable: false },
        {name:'hogar'      ,  typeName: 'integer',  editable: false },
        //campos base.personas intercalados con campos espejo de backups (age,dem01,asex,dobm,doby)
        //podriamos agregar una variable construida con la comparacion de estos campos como en la grilla del censo
        {name:'nombre'    ,  typeName: 'text'   ,  editable: false },
        {name:'edad'      ,  typeName: 'bigint' ,  editable: false },
        {name:'ageb'      ,  typeName: 'text'   , label:'edad backup', editable: false },
        {name:'sexo'      ,  typeName: 'bigint' ,  editable: false },
        {name:'dem01b'    ,  typeName: 'text'   ,  label:'dem01 backup', editable: false },
        {name:'asexb'     ,  typeName: 'text'   ,  label:'asex backup', editable: false },
        {name:'nacms'     ,  typeName: 'text'   ,  editable: false },
        {name:'dobmb'     ,  typeName: 'text'   ,  label:'mes backup', editable: false },
        {name:'dobyb'     ,  typeName: 'text'   ,  label:'año backup', editable: false },
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
    const fieldsToShow = ['idblaise', 'operativo', 'enc', 'hogar', 'nombre', 'edad', 'ageb', 'sexo', 'dem01b', 'asexb', 'nacms', 'dobmb', 'dobyb', 'rea', 'norea', 'verif_campo', 'verificado_procesamiento', 'observaciones', 'resul_proc', 'lote', 'observaciones', 'respid', 
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
            from:`(select th.*,
                p.nombre, p.edad, b.age ageb, p.sexo, b.dem01 dem01b, b.asex asexb, p.nacms, b.dobm dobmb, b.doby dobyb,
                t.rea, t.norea, 
                tt.verif_campo,
                b.*
                from backups b 
                join base.tem_blaise th on (b.respid = th.idblaise)
                join base.tem t on t.operativo=th.operativo and t.enc=th.enc
                left join base.personas p on (p.operativo = th.operativo AND p.vivienda = th.enc AND p.hogar = th.hogar AND th.idblaise = p.id_blaise::integer)
                left join lateral (
                    select case when count(*) = count(verificado) then max(tt.verificado)else null end verif_campo 
                      from base.tareas_tem tt 
                      where tt.operativo = th.operativo AND tt.enc=th.enc 
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