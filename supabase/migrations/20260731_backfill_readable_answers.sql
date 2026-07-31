-- One-time backfill: convert quiz_leads.answers option CODES to Georgian LABELS.
-- Safe + idempotent: values already stored as labels (not in the map) are left
-- unchanged, so re-running is a no-op. Generated from lib/scoring.ts QUESTIONS
-- (63 codes). Run in the Supabase SQL editor (executes as postgres,
-- bypasses RLS). Wrapped in a transaction — check the updated row count, then it
-- commits; hit Cancel / run ROLLBACK if anything looks off.

begin;

with code_label(code, label) as (
  values
    ('a1_le44', '44 წლის ან ნაკლების'),
    ('a1_45_49', '45–49 წლის'),
    ('a1_50_55', '50–55 წლის'),
    ('a1_ge56', '56 წლის ან მეტის'),
    ('a2_regular', 'ციკლი ისევ რეგულარულია'),
    ('a2_irregular', 'ციკლი გახდა არარეგულარული'),
    ('a2_stopped_1_5', 'მენსტრუაცია ბოლო 1–5 წლის განმავლობაში შეწყდა'),
    ('a2_stopped_5plus', 'მენსტრუაცია 5 წელზე მეტი ხნის წინ შეწყდა ან ზუსტად არ ვიცი'),
    ('a3_meno', 'ალებს ან ღამის ოფლიანობას'),
    ('a3_sleep', 'ძილის გაუარესებას'),
    ('a3_stress', 'სტრესს, შფოთვას ან გაღიზიანებას'),
    ('a3_none', 'არცერთ ჩამოთვლილს'),
    ('a4_same', 'მენოპაუზის ნიშნებთან დაახლოებით ერთ პერიოდში'),
    ('a4_1_3', 'მენოპაუზის ნიშნებიდან 1–3 წლის შემდეგ'),
    ('a4_before', 'თმის პრობლემა მენოპაუზამდე მქონდა'),
    ('a4_unknown', 'ზუსტად არ ვიცი'),
    ('a5_shedding', 'უფრო მეტი თმა მრჩება სავარცხელზე ან შხაპში'),
    ('a5_volume', 'თმის საერთო ან კუდის მოცულობა შემცირდა'),
    ('a5_partcrown', 'გაყოფის ხაზი ან გვირგვინი უფრო შესამჩნევი გახდა'),
    ('a5_finedry', 'თმა გახდა უფრო თხელი, მშრალი ან მტვრევადი'),
    ('a6_even', 'მთელ თავზე თანაბრად'),
    ('a6_part', 'შუა გაყოფის ხაზთან'),
    ('a6_crown', 'გვირგვინის არეში'),
    ('a6_fibre', 'ძირითადად თმის ღერის ხარისხში'),
    ('a7_3_12', 'თანდათანობით, ბოლო 3–12 თვეში'),
    ('a7_1_3', 'თანდათანობით, ბოლო 1–3 წელში'),
    ('a7_sudden', 'ძალიან მოულოდნელად და ძლიერად'),
    ('a7_over3', 'უკვე 3 წელზე მეტია პროგრესირებს'),
    ('a8_selfonly', 'თმის საერთო მოცულობა ოდნავ შემცირდა, თუმცა გათხელება ჯერ მკაფიოდ არ ჩანს'),
    ('a8_wider', 'გაყოფის ხაზი ოდნავ გაფართოვდა'),
    ('a8_scalp', 'კანი ჩანს, თუმცა უბანზე თმა ჯერ კიდევ არის'),
    ('a8_bald', 'მაქვს თითქმის მთლიანად ცარიელი უბანი'),
    ('a9_finer', 'უფრო თხელი და მოცულობის გარეშე გახდა'),
    ('a9_drier', 'უფრო მშრალი ან უხეში გახდა'),
    ('a9_breaks', 'უფრო ადვილად ტყდება'),
    ('a9_several', 'რამდენიმე ცვლილებას ერთად ვამჩნევ'),
    ('e_check', 'ხშირად ვამოწმებ, რამდენი თმა დამრჩა სავარცხელზე ან შხაპში'),
    ('e_restyle', 'ვცვლი გაყოფის ხაზს ან ვარცხნილობას გათხელების დასაფარად'),
    ('e_confidence', 'თმის ცვლილება ჩემს თავდაჯერებასა და გარეგნობის აღქმაზე მოქმედებს'),
    ('e_mild', 'მაწუხებს, მაგრამ ყოველდღიურ არჩევანზე ჯერ არ მოქმედებს'),
    ('a10_patches', 'მაქვს მრგვალი ან სრულიად ცარიელი უბანი'),
    ('a10_scalp', 'თავის კანი მტკივა, მეწვის ან ძალიან გაღიზიანებულია'),
    ('a10_recession', 'თმის წინა ხაზი სწრაფად შეიცვალა ან წარბებიც შემცირდა'),
    ('a10_none', 'არცერთი ჩამოთვლილი'),
    ('a11_iron', 'რკინის დეფიციტი, ანემია ან ფარისებრი ჯირკვლის პრობლემა'),
    ('a11_illness', 'ბოლო თვეებში მძიმე ავადმყოფობა ან ოპერაცია'),
    ('a11_weightloss', 'სწრაფი წონის კლება, მკაცრი დიეტა ან ახალი მედიკამენტი'),
    ('a11_none', 'არცერთი ჩამოთვლილი ან ზუსტად არ ვიცი'),
    ('a12_supp', 'ვიტამინები, საკვები დანამატები ან სპეციალური შამპუნები'),
    ('a12_minox', 'მინოქსიდილი ან სხვა სპეციალური საშუალებები'),
    ('a12_proc', 'PRP, მეზოთერაპია ან სხვა პროცედურები'),
    ('d_lt1', '1 თვეზე ნაკლების'),
    ('d_1_3', 'დაახლოებით 1–3 თვე'),
    ('d_3_6', 'დაახლოებით 3–6 თვე'),
    ('d_6plus', '6 თვეზე მეტი'),
    ('r_none', 'შესამჩნევი ცვლილება არ მქონია'),
    ('r_briefshed', 'ცვენა მცირე დროით შემცირდა'),
    ('r_mild', 'თმის ხარისხი ან მოცულობა მცირედ გაუმჯობესდა'),
    ('r_temporary', 'შედეგი მქონდა, მაგრამ შემდეგ კვლავ გაუარესდა'),
    ('g_shedding', 'ყოველდღიური ჭარბი ცვენის შემცირება'),
    ('g_fuller', 'თმის უფრო სქელი და მოცულობითი იერი'),
    ('g_density', 'გათხელებულ უბნებში სიმკვრივისა და ახალი ზრდის მხარდაჭერა'),
    ('g_stronger', 'უფრო ძლიერი და ნაკლებად მტვრევადი თმა')
),
remapped as (
  select
    ql.id,
    (
      select coalesce(
        jsonb_object_agg(
          kv.key,
          case jsonb_typeof(kv.value)
            when 'string' then
              to_jsonb(coalesce(
                (select cl.label from code_label cl where cl.code = kv.value #>> '{}'),
                kv.value #>> '{}'
              ))
            when 'array' then
              coalesce((
                select jsonb_agg(
                  case jsonb_typeof(elem.value)
                    when 'string' then
                      to_jsonb(coalesce(
                        (select cl.label from code_label cl where cl.code = elem.value #>> '{}'),
                        elem.value #>> '{}'
                      ))
                    else elem.value
                  end
                )
                from jsonb_array_elements(kv.value) as elem(value)
              ), '[]'::jsonb)
            else kv.value            -- objects (_consent), booleans (q2_surgical), numbers
          end
        ),
        '{}'::jsonb
      )
      from jsonb_each(ql.answers) as kv(key, value)
    ) as new_answers
  from quiz_leads ql
  where ql.answers is not null
)
update quiz_leads ql
set answers = r.new_answers
from remapped r
where ql.id = r.id
  and ql.answers is distinct from r.new_answers;

commit;
