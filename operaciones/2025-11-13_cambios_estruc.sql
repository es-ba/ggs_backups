set role ggs2025_owner;
set search_path=backups;

alter table backups
    add column if not exists "web_proc" text;
alter table "backups" add constraint "web_proc<>''" check ("web_proc"<>'');

GRANT SELECT, INSERT, UPDATE, DELETE ON his.bitacora to ggs_backups2025_admin;