SELECT pgflow.create_flow('greet_user');
SELECT pgflow.add_step('greet_user', 'full_name');
SELECT pgflow.add_step('greet_user', 'greeting', ARRAY['full_name']);
