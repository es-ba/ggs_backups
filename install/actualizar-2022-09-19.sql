GRANT SELECT ON TABLE base.tareas_tem TO ggs_backups_admin;
GRANT SELECT ON TABLE base.tem TO ggs_backups_admin;

-- sql correspondiente a la grilla de match 
-- campos a a gregar en la defincion : rea, norea,verif_encurecu ( o verif_campo)
select th.*,
    p.nombre, p.edad, b.age ageb, p.sexo, b.dem01 dem01b, b.asex asexb, p.nacms, b.dobm dobmb, b.doby dobyb,
    t.rea, t.norea, 
    tt.verif_campo,
    b.*
    from backups b 
    join base.tem_blaise th on (b.respid = th.idblaise)
    join base.tem t on t.operativo=th.operativo and t.enc=th.enc
    left join base.personas p on (p.operativo = th.operativo AND p.vivienda = th.enc AND p.hogar = th.hogar AND th.idblaise = p.id_blaise::integer)
    left join lateral (
        select max(tt.verificado) verif_campo from base.tareas_tem tt where tt.operativo = th.operativo AND tt.enc=th.enc and tarea in ('encu','recu') and verificado ='1'
    ) as tt on true
    left join backups otrob on b.respid=otrob.respid and otrob.lote <>b.lote and otrob.verificado_procesamiento
    where b.verificado_procesamiento 
    or (b.lote = (select max(lote) from lotes) and
        otrob.respid is null);
