import cds from "@sap/cds";
import MeetingHandler from "./handlers/meeting.handler";

export class MeetingService extends cds.ApplicationService {
    async init() {
        MeetingHandler(this)

        await super.init();
    }
}