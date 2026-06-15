import { BaseODataService } from '../core/baseService';
import { ODataQueryBuilder } from '../core/odataHelper';
import { View_MyUpcomingMeetings, View_MyOpenActionItems, View_RoomScheduleToday } from '../types/meeting.types';

class DashboardService {
    private upcomingMeetingsService = new BaseODataService<View_MyUpcomingMeetings>('api/MEETING_SRV', 'View_MyUpcomingMeetings');
    private openActionItemsService = new BaseODataService<View_MyOpenActionItems>('api/MEETING_SRV', 'View_MyOpenActionItems');
    private roomScheduleService = new BaseODataService<View_RoomScheduleToday>('api/MEETING_SRV', 'View_RoomScheduleToday');

    async getUpcomingMeetings() {
        return this.upcomingMeetingsService.getList(new ODataQueryBuilder().top(5));
    }

    async getOpenActionItems() {
        return this.openActionItemsService.getList(new ODataQueryBuilder().top(5));
    }

    async getRoomScheduleToday() {
        return this.roomScheduleService.getList(new ODataQueryBuilder().top(10));
    }
}

export const dashboardService = new DashboardService();
