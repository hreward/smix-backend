const { knex } = require("./db.model");
const { OfflineUser } = require("./offlineuser.model");
const { User } = require("./user.model");
const uuid = require("uuid");

// Define the Activity Log class
class CoopLog {
    _userId;
    _coopReference;
    _createdAt;

    constructor(coopReference, userId) {
        this._userId = userId;
        this._coopReference = coopReference;
    }

    get userId() {
        return this._userId;
    }

    set userId(userId) {
        this._userId = userId;
    }

    get coopReference() {
        return this._coopReference;
    }
    set coopReference(value) {
        this._coopReference = value;
    }
    

    static async getCoopLogs(coopReference, pageNo = 1, perPage=50) {
        const offset = (pageNo-1) * perPage;
        const logs = await knex('activity_logs')
        .where({ coop_reference: coopReference })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .offset(offset)
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        return logs.map((log) => {
            return {
                reference: log.reference,
                coopreference: log.coop_reference,
                userid: log.user_id,
                activity: log.activity,
                severity: log.severity,
                createdat: log.created_at
            }
        });
    }

    async log(activity, severity){
        if(![1,2,3,4,5].includes(severity)){
            throw new Error("Invalid severity. Valid value range between 1 to 5");
        }
        const activityRef = uuid.v4();
        await knex('activity_logs')
        .insert({
            reference: activityRef,
            coop_reference: this.coopReference,
            user_id: this.userId,
            activity: activity,
            severity: severity,
            created_at: new Date()
        })
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
    }


}

module.exports = {CoopLog}
