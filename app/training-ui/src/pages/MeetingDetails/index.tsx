import { useParams, useNavigate } from 'react-router-dom';
import { useODataQuery } from '@/hooks/useODataQuery';
import { meetingService } from '@/services/domain/meetingService';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent, DataTable } from '@cnma/react-ui';
import { ChevronLeft } from 'lucide-react';

export function MeetingDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: meeting, isLoading } = useODataQuery(
        ['meeting', id],
        () => meetingService.getMeetingDetails(id!),
        { enabled: !!id }
    );

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (!meeting) return <div className="p-6">Meeting not found</div>;

    return (
        <div className="p-6 space-y-6">
            <Button variant="ghost" className="gap-2 -ml-4" onClick={() => navigate('/meetings')}>
                <ChevronLeft size={16} /> Back to Meetings
            </Button>
            
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">{meeting.title}</h1>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleString()}</Badge>
                        <Badge variant="outline">{meeting.room?.name || 'Online'}</Badge>
                        <Badge variant={meeting.status_code === 'COMPLETED' ? 'success' : 'secondary'}>{meeting.status_code}</Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit</Button>
                    <Button variant="default">Complete</Button>
                </div>
            </div>

            <Tabs defaultValue="general">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                    <TabsTrigger value="agenda">Agenda</TabsTrigger>
                    <TabsTrigger value="actionItems">Action Items</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground">Description</h3>
                                <p>{meeting.description || 'No description provided.'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground">Organizer</h3>
                                <p>{meeting.organizer?.name} ({meeting.organizer?.email})</p>
                            </div>
                            {meeting.isOnline && (
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground">Meeting Link</h3>
                                    <a href={meeting.meetingLink} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                                        {meeting.meetingLink}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="participants" className="mt-6">
                    <DataTable 
                        title="Participants"
                        columns={[
                            { key: 'employee.name', labelKey: 'Name' },
                            { key: 'employee.email', labelKey: 'Email' },
                            { key: 'status_code', labelKey: 'RSVP' }
                        ]} 
                        data={meeting.participants || []} 
                    />
                </TabsContent>

                <TabsContent value="agenda" className="mt-6">
                    <DataTable 
                        title="Agenda Items"
                        columns={[
                            { key: 'orderNo', labelKey: '#' },
                            { key: 'topic', labelKey: 'Topic' },
                            { key: 'durationMinutes', labelKey: 'Duration (min)' }
                        ]} 
                        data={meeting.agendaItems || []} 
                    />
                </TabsContent>

                <TabsContent value="actionItems" className="mt-6">
                    <DataTable 
                        title="Action Items"
                        columns={[
                            { key: 'description', labelKey: 'Description' },
                            { key: 'assignee.name', labelKey: 'Assignee' },
                            { key: 'status_code', labelKey: 'Status' },
                            { key: 'dueDate', labelKey: 'Due Date' }
                        ]} 
                        data={meeting.actionItems || []} 
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
