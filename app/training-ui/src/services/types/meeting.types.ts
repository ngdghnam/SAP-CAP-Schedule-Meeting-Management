export interface Employee {
    ID: string;
    name: string;
    email: string;
    department?: string;
    jobTitle?: string;
}

export interface Room {
    ID: string;
    name: string;
    location?: string;
    capacity?: number;
    facilities?: string;
    isActive?: boolean;
}

export interface Meeting {
    ID: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    type_code?: string;
    status_code?: string;
    organizer_ID?: string;
    room_ID?: string;
    isOnline?: boolean;
    meetingLink?: string;
    
    // Expanded entities
    organizer?: Employee;
    room?: Room;
    participants?: Participant[];
    agendaItems?: AgendaItem[];
    actionItems?: ActionItem[];

    createdAt?: string;
    modifiedAt?: string;
    __etag?: string;
}

export interface Participant {
    ID: string;
    meeting_ID?: string;
    employee_ID?: string;
    role_code?: string;
    rsvpStatus_code?: string;
    respondedAt?: string;
    isRequired?: boolean;
    note?: string;
    
    employee?: Employee;
}

export interface AgendaItem {
    ID: string;
    meeting_ID?: string;
    orderNo?: number;
    topic: string;
    durationMin?: number;
    owner_ID?: string;
    description?: string;
    
    owner?: Employee;
}

export interface ActionItem {
    ID: string;
    meeting_ID?: string;
    description: string;
    assignee_ID?: string;
    dueDate?: string;
    priority_code?: string;
    status_code?: string;
    closedAt?: string;
    note?: string;
    
    assignee?: Employee;
}

export interface View_MyUpcomingMeetings {
    ID: string;
    title: string;
    startTime: string;
    endTime: string;
    status_code: string;
    room_name?: string;
    isOnline: boolean;
}

export interface View_MyOpenActionItems {
    ID: string;
    meeting_ID: string;
    meetingTitle: string;
    description: string;
    dueDate: string;
    priority_code: string;
    status_code: string;
}

export interface View_RoomScheduleToday {
    ID: string;
    name: string;
    capacity: number;
    meetingTitle?: string;
    startTime?: string;
    endTime?: string;
    status_code?: string;
}
