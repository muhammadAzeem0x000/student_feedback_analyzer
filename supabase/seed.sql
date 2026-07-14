-- Run after creating demo auth users in Supabase Auth. The profile trigger creates
-- public.profiles rows automatically. Replace the email values if desired.
do $$
declare
  instructor uuid;
  software_department uuid;
  demo_course uuid;
  demo_session uuid;
  demo_response uuid;
  q0 uuid; q1 uuid; q2 uuid; q3 uuid; q4 uuid;
  i integer;
begin
  select id into instructor from auth.users where email = 'instructor@example.com';
  select id into software_department from public.departments where name = 'Software Engineering';

  if instructor is null then
    raise notice 'Create instructor@example.com in Supabase Auth before running demo seed data.';
    return;
  end if;

  update public.profiles set full_name = 'Demo Instructor', role = 'instructor', department_id = software_department, is_active = true where id = instructor;

  insert into public.courses(department_id, name, code, description)
  values (software_department, 'Software Testing', 'SE-401', 'Practical software quality assurance and automated testing.')
  on conflict (code) do update set name = excluded.name
  returning id into demo_course;

  insert into public.course_assignments(course_id, instructor_id)
  values (demo_course, instructor)
  on conflict do nothing;

  insert into public.feedback_sessions(course_id, instructor_id, title, description, slug, status, expected_responses)
  values (demo_course, instructor, 'Unit Testing and Test Automation', 'Anonymous feedback on the unit testing lecture and lab.', 'se-401-unit-testing-demo', 'closed', 20)
  on conflict (slug) do update set title = excluded.title
  returning id into demo_session;

  insert into public.feedback_questions(session_id, type, prompt, is_required, position, options)
  values
    (demo_session, 'rating', 'The learning objectives were clear.', true, 0, null),
    (demo_session, 'rating', 'The pace of the session supported my learning.', true, 1, null),
    (demo_session, 'single_choice', 'Which activity helped you learn the most?', true, 2, '["Live coding", "Worked examples", "Pair exercise", "Discussion"]'),
    (demo_session, 'long_text', 'What was the clearest part of the session?', true, 3, null),
    (demo_session, 'long_text', 'What is one change that would improve the next session?', true, 4, null)
  on conflict (session_id, position) do nothing;

  select id into q0 from public.feedback_questions where session_id = demo_session and position = 0;
  select id into q1 from public.feedback_questions where session_id = demo_session and position = 1;
  select id into q2 from public.feedback_questions where session_id = demo_session and position = 2;
  select id into q3 from public.feedback_questions where session_id = demo_session and position = 3;
  select id into q4 from public.feedback_questions where session_id = demo_session and position = 4;

  if not exists (select 1 from public.feedback_responses where session_id = demo_session) then
    for i in 1..6 loop
      insert into public.feedback_responses(session_id, submitted_at)
      values (demo_session, now() - make_interval(hours => 12 - i)) returning id into demo_response;
      insert into public.response_answers(response_id, question_id, rating_value) values
        (demo_response, q0, (array[4,5,4,3,5,4])[i]),
        (demo_response, q1, (array[3,4,4,3,5,4])[i]);
      insert into public.response_answers(response_id, question_id, choice_value)
      values (demo_response, q2, (array['Live coding','Worked examples','Live coding','Pair exercise','Live coding','Discussion'])[i]);
      insert into public.response_answers(response_id, question_id, text_value) values
        (demo_response, q3, (array[
          'The live refactoring example made the test structure easy to follow.',
          'Seeing arrange, act and assert applied to a realistic method was clearest.',
          'The comparison between unit and integration tests helped.',
          'Writing the first test together clarified the workflow.',
          'The explanation of test isolation and mocks was very clear.',
          'The discussion of what not to unit test was useful.'
        ])[i]),
        (demo_response, q4, (array[
          'Leave a little more time for the independent exercise.',
          'Show the completed test name before starting the demo.',
          'Pause once during live coding to check understanding.',
          'Provide the starter repository before class.',
          'Use one more example of a failing assertion.',
          'Keep the examples but slow down the mock setup.'
        ])[i]);
      insert into public.response_codes(session_id, code_hash, used_at, response_id)
      values (demo_session, encode(digest('DEMO-CODE-' || i::text, 'sha256'), 'hex'), now(), demo_response);
    end loop;
  end if;

  insert into public.instructor_reflections(session_id, instructor_id, perceived_strengths, perceived_challenges, surprises, next_steps)
  values (
    demo_session, instructor,
    'The live coding sequence connected test structure to a realistic service method and kept the session practical.',
    'The mock setup took longer than planned, which compressed the independent practice activity at the end.',
    'Students appeared comfortable during the demo, but some written feedback suggests they needed an earlier understanding check.',
    'Share the starter repository before class, add a midpoint confidence check, and reserve fifteen minutes for independent practice.'
  ) on conflict (session_id) do update set
    perceived_strengths = excluded.perceived_strengths,
    perceived_challenges = excluded.perceived_challenges,
    surprises = excluded.surprises,
    next_steps = excluded.next_steps;

  if not exists (select 1 from public.ai_analyses where session_id = demo_session) then
    insert into public.ai_analyses(session_id, instructor_id, model, prompt_version, response_count, result)
    values (demo_session, instructor, 'deepseek-v4-pro', 'anonymous-course-feedback-v1', 6, jsonb_build_object(
      'summary', 'Students valued the practical examples and test-structure explanations, while pacing around mock setup reduced time for independent practice.',
      'response_count', 6,
      'insights', jsonb_build_array(
        jsonb_build_object('rank',1,'title','Protect independent practice time','finding','Several comments point to limited time for applying the technique independently.','evidence','The written suggestions repeatedly request more exercise time, while pace ratings are lower than clarity ratings.','recommendation','Time-box mock setup and reserve the final fifteen minutes for an individual test-writing task.','priority','high'),
        jsonb_build_object('rank',2,'title','Add an earlier understanding check','finding','The instructor perceived comfort, but feedback suggests some uncertainty during live coding.','evidence','A student requested a pause to check understanding and the reflection notes a mismatch between apparent comfort and written feedback.','recommendation','Use a one-minute confidence poll immediately after the first red-green-refactor cycle.','priority','high'),
        jsonb_build_object('rank',3,'title','Keep realistic live coding','finding','Practical examples are a consistent strength of the session.','evidence','Live coding was the most frequently selected helpful activity and multiple comments cite realistic examples.','recommendation','Retain the service-method example and publish its final version after class.','priority','medium'),
        jsonb_build_object('rank',4,'title','Reduce setup friction','finding','Repository and mock setup consumed attention that could support learning objectives.','evidence','Students requested the starter repository in advance and a slower mock setup.','recommendation','Distribute a verified starter repository before class with dependencies already installed.','priority','medium'),
        jsonb_build_object('rank',5,'title','Make success criteria visible','finding','Students would benefit from seeing the intended test behavior before implementation.','evidence','One response explicitly asked to see the completed test name before the demonstration.','recommendation','Begin each example with the behavior statement and final test name on screen.','priority','low')
      ),
      'limitations', 'This analysis represents six anonymous responses from one session and should be compared with future cohorts.'
    ));
  end if;
end $$;
