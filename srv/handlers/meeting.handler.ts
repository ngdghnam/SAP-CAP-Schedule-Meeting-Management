import cds from "@sap/cds"
import { MeetingMgmtService } from "../services/meeting.service"

export default function MeetingHandler(srv: cds.Service) {
    const service: MeetingMgmtService = new MeetingMgmtService()

    srv.on('cancel', 'Meetings', async (req) => service.cancelMeeting(req));
    srv.on('sendInvites', 'Meetings', async (req) => service.sendInvites(req));
    srv.on('complete', 'Meetings', async (req) => service.completeMeeting(req));
}