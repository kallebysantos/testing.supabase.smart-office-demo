# Add Note Feature to Alerts Screen

## Task
Add a "Add Note" button to the `/alerts` screen that opens a dialog box for creating notes about service tickets, with the notes displayed inline with each alert.

## Requirements

1. **Check Supabase Schema First**
   - Use the MCP Server to check the current Supabase database schema
   - Verify if a `notes` or `service_ticket_notes` table exists
   - If not, create the appropriate table with fields:
     - `id` (uuid, primary key)
     - `ticket_id` (uuid, foreign key to service_tickets)
     - `title` (text)
     - `description` (text)
     - `created_at` (timestamp)
     - `created_by` (uuid, foreign key to user_profiles)

2. **Add Note Button**
   - Place the button in each alert card, aligned to the right side
   - Position it next to the existing action buttons (if any)
   - Use a consistent icon (e.g., Note, MessageSquare, or Plus icon)
   - Button should be visible for facilities and admin roles only

3. **Dialog Box Implementation**
   - Create a dialog that opens when the "Add Note" button is clicked
   - Dialog should contain:
     - Title: "Add Note for Ticket #[ticket_number]"
     - Input field for note title (required)
     - Textarea for note description (required)
     - "Save" button (primary action)
     - "Cancel" button (secondary action)
   - Use shadcn/ui Dialog component for consistency

4. **Note Display**
   - Display notes inline within each alert card
   - Show notes below the alert details but above the action buttons
   - Include note title, description snippet, creator name, and timestamp
   - Consider collapsible/expandable UI if multiple notes exist
   - Add a visual separator between the alert content and notes section

5. **Save Functionality**
   - On Save, insert the note into the database
   - Include the current user as `created_by`
   - Refresh the alerts list to show the new note immediately
   - Show success toast notification
   - Handle errors gracefully with error messages

6. **Real-time Updates**
   - Set up Supabase real-time subscription for notes
   - When a note is added by any user, update all connected clients
   - Ensure the note appears without page refresh

## File Locations
- Main alerts page: `/src/app/alerts/page.tsx`
- Alert components: `/src/components/alerts/`
- API functions: `/src/lib/api/alerts.ts`
- Hook for alerts data: `/src/hooks/useAlerts.ts`

## Implementation Steps
1. First check and create database schema using MCP Server
2. Update the alerts API to include notes in the query
3. Add the Dialog component and form
4. Update the alert card component to show the button and notes
5. Implement save functionality with Supabase
6. Add real-time subscription for notes
7. Test with different user roles

## UI/UX Considerations
- The "Add Note" button should be subtle but discoverable
- Notes section should be visually distinct from alert details
- Consider using a timeline or thread view for multiple notes
- Ensure responsive design works on mobile devices
- Add loading states during note submission

## Example Placement in Alert Card
```
[Alert Card]
├── Alert Header (title, status, priority)
├── Alert Details (room, issue, timestamp)
├── Notes Section (NEW - collapsible)
│   ├── Note 1 (title, description, author, time)
│   └── Note 2 (title, description, author, time)
└── Action Buttons Row
    ├── [Existing buttons...]
    └── [Add Note] (right-aligned)
```