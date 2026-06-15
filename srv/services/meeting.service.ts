import cds from "@sap/cds";

export class MeetingMgmtService {

    /**
     * Hủy cuộc họp
     */
    public async cancelMeeting(req: cds.Request): Promise<any> {
        const { reason } = req.data;
        const meetingId = typeof req.params[0] === 'object' ? req.params[0].ID : req.params[0];

        if (!meetingId) {
            return req.error(400, "Meeting ID is required to cancel.");
        }

        // Cập nhật trạng thái cuộc họp thành CANCELLED
        await UPDATE(req.target).with({ status_code: 'CANCELLED' }).where({ ID: meetingId });
    }

    /**
     * Gửi invite email cho tất cả participants
     */
    public async sendInvites(req: cds.Request): Promise<any> {
        const meetingId = typeof req.params[0] === 'object' ? req.params[0].ID : req.params[0];

        if (!meetingId) {
            return req.error(400, "Meeting ID is required to send invites.");
        }

        // Tương lai: Lấy danh sách participants và gửi email thông qua SMTP/SendGrid
        // const participants = await SELECT.from('MeetingService.Participants').where({ meeting_ID: meetingId });
        console.log(`[Email Service] Đang gửi invites cho meeting ID: ${meetingId}...`);

        return "Gửi email mời họp thành công!";
    }

    /**
     * Đánh dấu đã hoàn thành
     */
    public async completeMeeting(req: cds.Request): Promise<any> {
        const meetingId = typeof req.params[0] === 'object' ? req.params[0].ID : req.params[0];

        if (!meetingId) {
            return req.error(400, "Meeting ID is required to complete.");
        }

        // Cập nhật trạng thái thành COMPLETED
        await UPDATE(req.target).with({ status_code: 'COMPLETED' }).where({ ID: meetingId });
    }
}