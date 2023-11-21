const { knex } = require('./db.model');
class Notification {
    
    _reference;
    _message;
    _timestamp;
    _read;
    _type;
    _coopId;
    _userId;

    constructor(reference, message, timestamp, read, type, coopId, userId) {
        this.reference = reference;
        this.message = message;
        this.timestamp = timestamp;
        this.read = read;
        this.type = type;
        this.coopId = coopId;
        this.userId = userId;
    }

    
    get reference() {
        return this._reference;
    }
    set reference(value) {
        this._reference = value;
    }
    get message() {
        return this._message;
    }
    set message(value) {
        this._message = value;
    }
    get timestamp() {
        return this._timestamp;
    }
    set timestamp(value) {
        this._timestamp = value;
    }
    get read() {
        return this._read;
    }
    set read(value) {
        this._read = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get coopId() {
        return this._coopId;
    }
    set coopId(value) {
        this._coopId = value;
    }
    get userId() {
        return this._userId;
    }
    set userId(value) {
        this._userId = value;
    }

    static async getAllNotifications(coopId, userId) {
        try {
            const notifications = await knex('notifications')
                .where({ coop_id: coopId, user_id: userId })
                .orderBy('timestamp', 'desc');
            return notifications.map((notification) => new Notification(
                notification.reference,
                notification.message,
                new Date(notification.timestamp),
                notification.read,
                notification.type,
                notification.coop_id,
                notification.user_id,
            ));
        } catch (err) {
            console.error(err);
            throw new Error("internal error"+error);
        }
    }
  
    static async markAllAsRead(coopId, userId) {
        try {
            await knex('notifications')
            .where({ coop_id: coopId, user_id: userId, read: false })
            .update({ read: true });
            return true;
        } catch (err) {
            console.error(err);
            throw new Error("internal error"+error);
        }
    }
    
    async save() {
		const existingNotification = await knex('users').where({ email: this.email }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingNotification && existingNotification.reference === this.reference) {
            await knex('notifications').where('reference', this.reference).update({
                message: this.message,
                timestamp: this.timestamp,
                read: this.read,
                type: this.type,
                coop_id: this.coopId,
                user_id: this.userId,
            }).catch((err)=>{
                console.error(err);
                throw new Error("internal error"+error);
            });;
        } else {
            await knex('notifications').insert({
                reference: this.reference,
                message: this.message,
                timestamp: this.timestamp,
                read: this.read,
                type: this.type,
                coop_id: this.coopId,
                user_id: this.userId,
            }).catch((err)=>{
                console.error(err);
                throw new Error("internal error"+error);
            });
        }
    }

    async deleteNotification() {
        try {
            await knex('notifications').where('reference', this.reference).delete();
        } catch (err) {
            console.error(err);
            throw new Error("internal error"+error);
        }
    }
}
  

module.exports = {Notification};