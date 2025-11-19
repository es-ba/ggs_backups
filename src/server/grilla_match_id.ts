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
        {name:'resumen_estado' , typeName:'text',  editable:false},
        {name:'rea_web'         , typeName: 'integer',  editable: false },
        {name:'rea_tel'         , typeName: 'integer',  editable: false },
        {name:'rea_pres'        , typeName: 'integer',  editable: false },
        {name:'tarea_actual'    , typeName: 'text'  ,  editable: false },
        //{name:'resultado'       , typeName: 'text'    ,  editable: false },
        {name:'result_sup'      , typeName: 'integer' ,  editable: false },
        //campos base.tareas_tem
        {name:'verif_campo'     ,  typeName: 'text' ,  editable: false },
    ]
    
    //@ts-ignore
    def.fields=[...ggs_fields, ...def.fields]
    
    // Solo se ven campos que pide procesamiento
    def.fields.forEach(f=>f.visible=false); // set all not visible
    const fieldsToShow = ['idblaise', 'operativo', 'enc', 'msnombrei', 'rea', 'norea', 'rea_web', 'rea_tel', 'rea_pres', 'tarea_actual', 'result_sup', 'verif_campo', 'verificado_procesamiento', 'observaciones', 'web_proc', 'resul_proc', 'lote', 'observaciones', 'respid', 
        //int01 ya no está en el nuevo backup (del 29/10 que mandó alex, sacamos de acá en adelante)
        //'int01', 'int02', 'dem01', 'dem02', 'dem03', 'dem06', 'dem07', 'dem08', 'dem09', 'dem11', 'dem14', 'dem21', 'gen01', 'gen02', 'gen11', 'gen25', 'gen44b', 'hhd24a', 'hhd28', 'hhd35', 'wel01', 'wel02', 'wel02a', 'lhi01', 'lhi02', 'att08', 'breportrep01', 'breportrep04', 'breportrep02', 'breportrep06', 'breportrep07', 'complete', 'agreedintro', 'begindate', 'begintime', 'enddate', 'endtime', 'numbiol', 'numstep', 'numadopt', 'totalchildren', 'hhd01b'
        'interviewer_id', 'interviewer_name', 'b1dem01', 'b1dem02', 'b10hhd01b', 'b11gen01', 'b11gen02', 'numbiol', 'numstep', 'numadopt', 'nkidstotal', 'age', 'partnerage', 'hascorespartner', 'hascoreschildunder15', 'mumcores', 'dadcores', 'adopt_step_fos', 'begindate', 'begintime', 'enddate', 'endtime', 'complete', 'last_var', 'agreedintro'
    ]
    
    fieldsToShow.forEach(fNameToShow=>{
        const fieldToShow=def.fields.find(f=>f.name===fNameToShow)
        if (!fieldToShow) throw new Error('columna no existente '+ fNameToShow)
        fieldToShow.visible = true
    })

    def.sql = changing(def.sql||{}, 
        {
            isTable:false,
            from:`(
                SELECT
                    tb.*,
                    v.msnombrei, v.rea_web, v.rea_tel, v.rea_pres,
                    t.rea, t.norea, t.resumen_estado, t.resultado, t.result_sup,
                    t.tarea_actual,
                    tt.verif_campo,
                    b.*
                FROM backups b 
                    JOIN base.tem_blaise tb ON (b.respid = tb.idblaise)
                    JOIN base.tem t ON t.operativo=tb.operativo AND t.enc=tb.enc
                    LEFT JOIN base.viviendas v ON (v.operativo = tb.operativo AND v.vivienda = tb.enc AND tb.idblaise = v.id_blaise)
                    LEFT JOIN lateral (
                        select case when count(*) = count(verificado) then max(tt.verificado) else null end verif_campo 
                        FROM base.tareas_tem tt 
                        WHERE tt.operativo = tb.operativo AND tt.enc=tb.enc 
                            AND tt.tarea = 'encu' AND tt.asignado is not null AND tt.operacion is not null
                    ) as tt ON true
                    LEFT JOIN backups otrob ON b.respid=otrob.respid AND otrob.lote <>b.lote AND otrob.verificado_procesamiento
                WHERE 
                    b.verificado_procesamiento
                    OR (b.lote = (select max(lote) FROM lotes))
                    AND otrob.respid is null)`,
            insertIfNotUpdate:false
        })
  return def;
}