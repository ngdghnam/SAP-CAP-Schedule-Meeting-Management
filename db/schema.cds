namespace cnma.meeting.mgmt;

using {
    cuid,
    managed,
    sap.common.CodeList
} from '@sap/cds/common';

entity Employee : cuid, managed {
  name        : String(100) @mandatory;
  email       : String(150) @mandatory;
  department  : String(100);
  jobTitle    : String(100);
  meetings    : Association to many Meeting on meetings.organizer = $self;
}

entity Room : cuid, managed {
  name        : String(80)  @mandatory;
  location    : String(150);
  capacity    : Integer     @assert.range: [1, 500];
  facilities  : String(500); // projector, whiteboard, VC...
  isActive    : Boolean default true;
  meetings    : Association to many Meeting on meetings.room = $self;
}

entity Meeting : cuid, managed {
  title        : String(200) @mandatory;
  description  : String(2000);
  startTime    : DateTime    @mandatory;
  endTime      : DateTime    @mandatory;
  type         : Association to MeetingType;
  status       : Association to MeetingStatus default 'SCHEDULED';
  organizer    : Association to Employee @mandatory;
  room         : Association to Room;
  isOnline     : Boolean default false;
  meetingLink  : String(500); // Teams / Zoom URL

  // Compositions
  participants : Composition of many Participant on participants.meeting = $self;
  agendaItems  : Composition of many AgendaItem  on agendaItems.meeting  = $self;
  attachments  : Composition of many Attachment  on attachments.meeting  = $self;
  minutes      : Composition of many MinutesNote on minutes.meeting      = $self;
  actionItems  : Composition of many ActionItem  on actionItems.meeting  = $self;
}

entity Participant : cuid {
  meeting      : Association to Meeting  @mandatory;
  employee     : Association to Employee @mandatory;
  role         : Association to ParticipantRole default 'ATTENDEE';
  rsvpStatus   : Association to RSVPStatus  default 'PENDING';
  respondedAt  : DateTime;
  isRequired   : Boolean default true;
  note         : String(500); // lý do từ chối, ghi chú
}

entity AgendaItem : cuid {
  meeting      : Association to Meeting @mandatory;
  orderNo      : Integer  @assert.range: [1, 99];
  topic        : String(300) @mandatory;
  durationMin  : Integer;   // phút
  owner        : Association to Employee; // người trình bày
  description  : String(1000);
}

entity Attachment : cuid, managed {
  meeting      : Association to Meeting @mandatory;
  fileName     : String(255) @mandatory;
  mimeType     : String(100);
  fileSize     : Integer;    // bytes
  url          : String(500) @mandatory;
  uploadedBy   : Association to Employee;
}

entity MinutesNote : cuid, managed {
  meeting      : Association to Meeting @mandatory;
  agendaItem   : Association to AgendaItem; // gắn với agenda item nào
  content      : LargeString @mandatory;    // nội dung biên bản
  employee    : Association to Employee;
}

entity ActionItem : cuid, managed {
  meeting      : Association to Meeting  @mandatory;
  description  : String(500) @mandatory;
  assignee     : Association to Employee @mandatory;
  dueDate      : Date;
  priority     : Association to Priority default 'MEDIUM';
  status       : Association to ActionStatus default 'OPEN';
  closedAt     : DateTime;
  note         : String(500);
}

entity MeetingType : CodeList {
  key code : String(20) enum {
    STANDUP    = 'STANDUP';
    REVIEW     = 'REVIEW';
    PLANNING   = 'PLANNING';
    WORKSHOP   = 'WORKSHOP';
    ONE_ON_ONE = 'ONE_ON_ONE';
    OTHER      = 'OTHER';
  };
}

entity MeetingStatus : CodeList {
  key code : String(20) enum {
    SCHEDULED  = 'SCHEDULED';
    IN_PROGRESS= 'IN_PROGRESS';
    COMPLETED  = 'COMPLETED';
    CANCELLED  = 'CANCELLED';
    POSTPONED  = 'POSTPONED';
  };
}

entity ParticipantRole : CodeList {
  key code : String(20) enum {
    ORGANIZER  = 'ORGANIZER';
    PRESENTER  = 'PRESENTER';
    ATTENDEE   = 'ATTENDEE';
    OPTIONAL   = 'OPTIONAL';
  };
}

entity RSVPStatus : CodeList {
  key code : String(20) enum {
    PENDING    = 'PENDING';
    ACCEPTED   = 'ACCEPTED';
    DECLINED   = 'DECLINED';
    TENTATIVE  = 'TENTATIVE';
  };
}

entity Priority : CodeList {
  key code : String(10) enum {
    HIGH   = 'HIGH';
    MEDIUM = 'MEDIUM';
    LOW    = 'LOW';
  };
}

entity ActionStatus : CodeList {
  key code : String(20) enum {
    OPEN        = 'OPEN';
    IN_PROGRESS = 'IN_PROGRESS';
    DONE        = 'DONE';
    CANCELLED   = 'CANCELLED';
  };
}