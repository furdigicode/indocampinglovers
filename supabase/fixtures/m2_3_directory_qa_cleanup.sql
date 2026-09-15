-- M2.3 DIRECTORY UX QA CLEANUP
-- Removes only the isolated M2.3 dummy campgrounds.
-- Child records are removed through ON DELETE CASCADE.

begin;
delete from public.campgrounds where slug like 'icl-qa-m23-%';
commit;

-- Expected: 0 rows.
select count(*) as remaining_qa_campgrounds from public.campgrounds where slug like 'icl-qa-m23-%';
