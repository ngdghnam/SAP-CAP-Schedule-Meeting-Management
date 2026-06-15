import { BaseODataService } from '../core/baseService';
import { ODataQueryBuilder } from '../core/odataHelper';
import { Meeting } from '../types/meeting.types';

class MeetingService extends BaseODataService<Meeting> {
    constructor() {
        super('api/MEETING_SRV', 'Meetings');
    }

    async getDashboardMeetings() {
        return this.getList(
            new ODataQueryBuilder()
                .orderBy('startTime', 'asc')
                .expand('room,organizer')
                .top(10)
        );
    }
    
    async getAllMeetings() {
        return this.getList(
            new ODataQueryBuilder()
                .expand('room,organizer')
                .orderBy('startTime', 'desc')
                .count()
        );
    }

    async getMeetingDetails(id: string) {
        return this.getById(id, new ODataQueryBuilder().expand('room,organizer,participants($expand=employee),agendaItems($expand=owner),actionItems($expand=assignee)'));
    }
}

export const meetingService = new MeetingService();
