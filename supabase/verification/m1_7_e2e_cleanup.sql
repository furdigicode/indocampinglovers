-- Remove the M1.7 development fixture and all child rows via ON DELETE CASCADE.
delete from public.campgrounds where slug = 'icl-development-camp';

select count(*) as remaining_fixture_rows
from public.campgrounds
where slug = 'icl-development-camp';
