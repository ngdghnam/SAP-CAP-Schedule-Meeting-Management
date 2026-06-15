namespace cnma.meeting.mgmt.view;

using {cnma.meeting.mgmt as db} from '../schema';

/** Dashboard: meetings của tôi (sắp diễn ra) */
view View_MyUpcomingMeetings as
    select from db.Meeting {
        ID,
        title,
        startTime,
        endTime,
        room.name      as roomName,
        organizer.name as organizerName,
        status.code    as statusCode,
        type.code      as typeCode
    }
    where
        status.code in (
            'SCHEDULED', 'IN_PROGRESS'
        );

/** Kiểm tra phòng còn trống */
view View_RoomAvailability as
    select from db.Meeting {
        room.ID     as roomID,
        room.name   as roomName,
        startTime,
        endTime,
        status.code as statusCode
    }
    where
        status.code not in (
            'CANCELLED', 'COMPLETED'
        );

/**
 * 1. LỊCH HỌP THEO NGÀY / TUẦN
 * Dùng cho Calendar view trên UI — hiển thị tất cả meeting
 * trong khoảng thời gian, kèm thông tin phòng và số người tham dự.
 * Fiori Calendar control cần đủ: startTime, endTime, title, room.
 */
view View_MeetingCalendar as
    select from db.Meeting {
        ID,
        title,
        startTime,
        endTime,
        isOnline,
        meetingLink,
        room.ID                as roomID,
        room.name              as roomName,
        room.location          as roomLocation,
        organizer.ID           as organizerID,
        organizer.name         as organizerName,
        status.code            as statusCode,
        status.name            as statusName,
        type.code              as typeCode,
        type.name              as typeName,
        // Đếm số người được mời (subquery-style qua virtual field hoặc annotation)
        count(participants.ID) as totalParticipants : Integer
    }
    group by
        ID,
        title,
        startTime,
        endTime,
        isOnline,
        meetingLink,
        room.ID,
        room.name,
        room.location,
        organizer.ID,
        organizer.name,
        status.code,
        status.name,
        type.code,
        type.name;

/**
 * 2. ACTION ITEMS CÒN TỒN ĐỌNG (của tôi)
 * Hiển thị trên My Tasks / Dashboard cá nhân.
 * Người dùng thấy ngay việc cần làm, deadline, mức độ ưu tiên.
 * Hỗ trợ filter theo status và sort theo dueDate tăng dần.
 */
view MyOpenActionItems as
    select from db.ActionItem {
        ID,
        description,
        dueDate,
        priority.code     as priorityCode,
        priority.name     as priorityName,
        status.code       as statusCode,
        status.name       as statusName,
        meeting.ID        as meetingID,
        meeting.title     as meetingTitle,
        meeting.startTime as meetingDate,
        assignee.ID       as assigneeID,
        assignee.name     as assigneeName,
        assignee.email    as assigneeEmail,
        // Flag quá hạn để UI highlight màu đỏ
        case
            when dueDate < CURRENT_DATE
                 and status.code not in (
                     'DONE', 'CANCELLED'
                 )
                 then true
            else false
        end               as isOverdue : Boolean
    }
    where
        status.code in (
            'OPEN', 'IN_PROGRESS'
        );

/**
 * 3. TÌNH TRẠNG PHÒNG HỌP THEO GIỜ (Room Utilization)
 * Dùng cho màn Room Booking — admin/người đặt phòng thấy
 * phòng nào đang bận, phòng nào trống trong ngày hôm nay.
 * Tránh double-booking: FE kiểm tra overlap trước khi submit.
 */
view View_RoomScheduleToday as
    select from db.Meeting {
        room.ID         as roomID,
        room.name       as roomName,
        room.capacity   as capacity,
        room.location   as location,
        room.facilities as facilities,
        ID              as meetingID,
        title           as meetingTitle,
        startTime,
        endTime,
        organizer.name  as organizerName,
        status.code     as statusCode
    }
    where
            status.code not in ('CANCELLED')
        and startTime   >=     $now // Lọc đến cuối ngày nên được xử lý ở Service Logic (Node.js/Java) hoặc OData $filter
    order by
        roomID,
        startTime;

/**
 * 4. THỐNG KÊ CUỘC HỌP THEO PHÒNG (Room Utilization Report)
 * Báo cáo tần suất sử dụng phòng — admin thấy phòng nào
 * được đặt nhiều nhất, tổng giờ họp, để tối ưu tài nguyên.
 */
view View_RoomUtilizationReport as
    select from db.Meeting {
        room.ID                     as roomID,
        room.name                   as roomName,
        room.capacity               as capacity,
        room.location               as location,
        count(ID)                   as totalMeetings   : Integer,
        sum(seconds_between(
            startTime, endTime
        ) / 3600)                   as totalHours      : Decimal(10, 2),
        avg(count(participants.ID)) as avgParticipants : Decimal(5, 1)
    }
    where
        status.code = 'COMPLETED'
    group by
        room.ID,
        room.name,
        room.capacity,
        room.location;

/**
 * 5. PARTICIPANTS CHƯA PHẢN HỒI (RSVP Pending)
 * Người tổ chức dùng để nhắc nhở — danh sách người được mời
 * nhưng chưa xác nhận tham dự, kèm email để gửi reminder.
 * Có thể trigger "Send Reminder" action từ view này.
 */
view View_PendingRSVP as
    select from db.Participant {
        ID,
        meeting.ID           as meetingID,
        meeting.title        as meetingTitle,
        meeting.startTime    as meetingStart,
        meeting.organizer.ID as organizerID,
        employee.ID          as employeeID,
        employee.name        as employeeName,
        employee.email       as employeeEmail,
        employee.department  as department,
        role.code            as roleCode,
        isRequired,
        // Tính số ngày còn lại trước khi họp
        days_between(
            $now, meeting.startTime
        )                    as daysUntilMeeting : Integer
    }
    where
            rsvpStatus.code     = 'PENDING'
        and meeting.status.code = 'SCHEDULED'
        and meeting.startTime   > $now
    order by
        meetingStart,
        isRequired desc;

/**
 * 6. MEETING SUMMARY (sau khi hoàn thành)
 * Tổng hợp đầy đủ 1 cuộc họp: agenda, số người thực tham dự,
 * số action items phát sinh — dùng cho màn detail sau họp
 * hoặc export biên bản.
 */
view View_MeetingSummary as
    select from db.Meeting {
        ID,
        title,
        startTime,
        endTime,
        description,
        isOnline,
        meetingLink,
        type.name              as typeName,
        status.code            as statusCode,
        organizer.name         as organizerName,
        organizer.email        as organizerEmail,
        room.name              as roomName,
        room.location          as roomLocation,

        // Tổng hợp participants
        count(participants.ID) as totalInvited     : Integer,
        count(case
                  when participants.rsvpStatus.code = 'ACCEPTED'
                       then 1
              end)             as totalAccepted    : Integer,
        count(case
                  when participants.rsvpStatus.code = 'DECLINED'
                       then 1
              end)             as totalDeclined    : Integer,

        // Tổng hợp action items
        count(actionItems.ID)  as totalActions     : Integer,
        count(case
                  when actionItems.status.code = 'OPEN'
                       then 1
              end)             as openActions      : Integer,

        // Agenda items count
        count(agendaItems.ID)  as totalAgendaItems : Integer
    }
    group by
        ID,
        title,
        startTime,
        endTime,
        description,
        isOnline,
        meetingLink,
        type.name,
        status.code,
        organizer.name,
        organizer.email,
        room.name,
        room.location;
