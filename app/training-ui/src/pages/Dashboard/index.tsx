import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge } from '@cnma/react-ui';
import { useODataQuery } from '@/hooks/useODataQuery';
import { dashboardService } from '@/services/domain/dashboardService';
import { Calendar, CheckSquare, Users } from 'lucide-react';

export function DashboardPage() {
    // Queries
    const { data: upcomingResp, isLoading: isLoadingUpcoming } = useODataQuery(
        ['dashboard', 'upcoming'],
        () => dashboardService.getUpcomingMeetings()
    );
    
    const { data: roomScheduleResp, isLoading: isLoadingRooms } = useODataQuery(
        ['dashboard', 'rooms'],
        () => dashboardService.getRoomScheduleToday()
    );

    const upcomingMeetings = upcomingResp?.value || [];
    const roomSchedules = roomScheduleResp?.value || [];

    // Columns
    const meetingCols: any[] = [
        { key: 'title', labelKey: 'Meeting Title' },
        { 
            key: 'startTime', 
            labelKey: 'Start Time',
            cell: ({ row }: any) => new Date(row.original.startTime).toLocaleString()
        },
        { key: 'room_name', labelKey: 'Room' },
        {
            key: 'isOnline',
            labelKey: 'Online',
            cell: ({ row }: any) => <Badge variant={row.original.isOnline ? "success" : "secondary"}>{row.original.isOnline ? "Yes" : "No"}</Badge>
        }
    ];

    const roomCols: any[] = [
        { key: 'name', labelKey: 'Room Name' },
        { key: 'capacity', labelKey: 'Capacity' },
        { key: 'meetingTitle', labelKey: 'Current/Next Meeting' },
        { 
            key: 'status_code', 
            labelKey: 'Status',
            cell: ({ row }: any) => {
                const status = row.original.status_code;
                if (status === 'IN_PROGRESS') return <Badge variant="destructive">Occupied</Badge>;
                if (status === 'SCHEDULED') return <Badge variant="warning">Reserved</Badge>;
                return <Badge variant="success">Available</Badge>;
            }
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
                        <p className="text-xs text-muted-foreground">Scheduled for today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Open Action Items</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Requires your attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending RSVPs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">Awaiting response</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <DataTable 
                    title="My Upcoming Meetings"
                    columns={meetingCols} 
                    data={upcomingMeetings} 
                    isLoading={isLoadingUpcoming}
                />
                
                <DataTable 
                    title="Room Schedule (Today)"
                    columns={roomCols} 
                    data={roomSchedules} 
                    isLoading={isLoadingRooms}
                />
            </div>
        </div>
    );
}
