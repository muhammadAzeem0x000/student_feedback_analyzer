# Authentication and account provisioning

## Account types

- Students do not have accounts. They use a public session link and one single-use response code.
- Instructors authenticate with Supabase Email/Password and use only administrator-assigned courses.
- Administrators use the same authentication system with the `admin` profile role.

## Current provisioning workflow

SignalRoom intentionally has no public instructor signup page. For the current release:

1. A trusted operator creates or invites an instructor in Supabase Auth.
2. The database trigger creates an inactive `instructor` profile. Signup metadata cannot create an administrator or activate an account.
3. The administrator opens **Admin → Instructors** and activates the account.
4. The administrator opens **Admin → Courses** and assigns the instructor's approved courses.
5. The instructor can sign in and create feedback sessions only for those assigned courses.

For production, disable unrestricted Email signups in Supabase Auth. Configure SMTP and use Supabase email invitations so instructors set their own passwords; administrators should never know or manually distribute instructor passwords.

## Administrator model

The database supports multiple administrators, but the current UI does not create, promote, or remove administrators. Bootstrap administrators only through a trusted service-role setup operation such as the demo-user script or a controlled database operation. Never accept an administrator role from browser-submitted signup metadata.

All active administrators in one Supabase project can view and manage all instructor profiles, departments, catalog courses, and course assignments in that project. This is a single-institution model. Supporting multiple independent institutions would require an organization/tenant table and organization-scoped RLS policies before onboarding them into one project.

## Recommended next authentication feature

Add an **Invite instructor** action to the admin area. Its server-only route should call Supabase Auth Admin invitation APIs with the service-role key, create the inactive instructor profile, and send a password-setup link using configured SMTP. Public self-service role selection should not be added.
