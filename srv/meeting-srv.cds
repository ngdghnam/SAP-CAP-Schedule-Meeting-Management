using {cnma.meeting.mgmt as db} from '../db/schema';
using {cnma.meeting.mgmt.view as view} from '../db/views/view.cds';

service MeetingService @(path: '/api/MEETING_SRV') {
    // ── Meetings (full CRUD cho organizer) ──
    @cds.redirection.target
    entity Meetings     as projection on db.Meeting
        actions {
            /** Hủy cuộc họp */
            action cancel(reason: String);
            /** Gửi invite email cho tất cả participants */
            action sendInvites();
            /** Đánh dấu đã hoàn thành */
            action complete();
        };

    // ── Participants ──
    @cds.redirection.target
    entity Participants as projection on db.Participant;

    // ── Agenda ──
    entity AgendaItems  as projection on db.AgendaItem;

    // ── Attachments ──
    entity Attachments  as projection on db.Attachment;

    // ── Minutes ──
    entity Minutes      as projection on db.MinutesNote;

    // ── Action Items ──
    @cds.redirection.target
    entity ActionItems  as projection on db.ActionItem
        actions {
            action close(note: String);
        };

    // ── Master data (read-only) ──
    @readonly
    entity Employees    as projection on db.Employee;

    @readonly
    entity Rooms        as projection on db.Room;

    // ── Views (Dashboards & Reports) ──
    @readonly
    entity View_MyUpcomingMeetings    as select from view.View_MyUpcomingMeetings;

    @readonly
    entity View_RoomAvailability      as select from view.View_RoomAvailability;

    @readonly
    entity View_MeetingCalendar       as select from view.View_MeetingCalendar;

    @readonly
    entity View_MyOpenActionItems       as select from view.MyOpenActionItems;

    @readonly
    entity View_RoomScheduleToday     as select from view.View_RoomScheduleToday;

    @readonly
    entity View_RoomUtilizationReport as select from view.View_RoomUtilizationReport;

    @readonly
    entity View_PendingRSVP           as select from view.View_PendingRSVP;

    @readonly
    entity View_MeetingSummary        as select from view.View_MeetingSummary;
}
