const {knex} = require('./db.model');
const bcrypt = require('bcryptjs');
const { default: validator } = require('validator');

class AutoSave {

	_reference;
    _coopReference;
	_userId;
    _amount;
    _source;
    _frequency;
    _month;
    _monthday;
    _weekday;
    _time;
    _status;
    _lastExecuted;
    _createdAt;
    _updatedAt;
	
	constructor(reference, coopReference, userId, amount, source, options = {frequency, month:"", monthday:1, weekday:"", time}, status, lastExecuted, createdAt = new Date(), updatedAt = new Date()) {
		this.reference = reference;
		this.coopReference = coopReference;
		this.userId = userId;
		this.amount = amount;
		this.source = source;
		this.frequency = options.frequency;
		this.month = options.month;
		this.monthday = options.monthday;
		this.weekday = options.weekday;
		this.time = options.time;
		this.status = status;
		this.lastExecuted = lastExecuted;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

    get reference() {
        return this._reference;
    }
    set reference(value) {
        this._reference = value;
    }

    get coopReference() {
        return this._coopReference;
    }
    set coopReference(value) {
        this._coopReference = value;
    }

    get userId() {
        return this._userId;
    }
    set userId(value) {
        this._userId = value;
    }
    
    get amount() {
        return this._amount;
    }
    set amount(value) {
        this._amount = value;
    }

    get source() {
        return this._source;
    }
    set source(value) {
        this._source = value;
    }

    get frequency() {
        return this._frequency;
    }
    set frequency(value) {
        this._frequency = value;
    }

    get month() {
        return this._month;
    }
    set month(value) {
        this._month = value;
    }

    get monthday() {
        return this._monthday;
    }
    set monthday(value) {
        this._monthday = value;
    }

    get weekday() {
        return this._weekday;
    }
    set weekday(value) {
        this._weekday = value;
    }

    get time() {
        return this._time;
    }
    set time(value) {
        this._time = value;
    }

    get createdAt() {
        return this._createdAt;
    }
    set createdAt(value) {
        this._createdAt = value;
    }

    get updatedAt() {
        return this._updatedAt;
    }
    set updatedAt(value) {
        this._updatedAt = value;
    }

    get lastExecuted() {
        return this._lastExecuted;
    }
    set lastExecuted(value) {
        this._lastExecuted = value;
    }
    
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }


	static async findByCoopAndUser(coopId, userId) {
		const autoCont = await knex('auto_contribute').where({ coop_reference: coopId, user_id: userId }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!autoCont) {
			return null;
		}
        
		return new AutoSave(autoCont.reference, autoCont.coop_reference, autoCont.user_id, autoCont.amount, autoCont.source, {frequency: autoCont.frequency, month: autoCont.month, monthday: autoCont.monthday, weekday: autoCont.weekday, time: autoCont.time}, autoCont.status, autoCont.last_executed, autoCont.created_at, autoCont.updated_at);
	}

	static async findByRef(reference) {
		const autoCont = await knex('auto_contribute').where({ reference:reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!autoCont) {
			throw new Error(`Auto Contribute with ref ${reference} not found`);
		}
        
		return new AutoSave(autoCont.reference, autoCont.coop_reference, autoCont.user_id, autoCont.amount, autoCont.source, {frequency: autoCont.frequency, month: autoCont.month, monthday: autoCont.monthday, weekday: autoCont.weekday, time: autoCont.time}, autoCont.status, autoCont.last_executed, autoCont.created_at, autoCont.updated_at);
	}

	async save() {
		const existingAutoCont = await knex('auto_contribute').where({ coop_reference: this.coopReference, user_id: this.userId }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		// if (existingAutoCont && existingAutoCont.reference !== this.reference) {
		// 	throw new Error(`Auto contribute already exists for this co-operative`);
		// }
		// if (existingAutoCont && existingAutoCont.reference === this.reference) {
		if (existingAutoCont) {
			await knex('auto_contribute').where({ reference: existingAutoCont.reference }).update({
                amount: this.amount,
                source: this.source,
                frequency: this.frequency,
                month: this.month,
                monthday: this.monthday,
                weekday: this.weekday,
                time: this.time,
                status: this.status,
                last_executed: this.lastExecuted,
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {
            await knex('auto_contribute').insert({
                reference: this.reference,
                coop_reference: this.coopReference,
                user_id: this.userId,
                amount: this.amount,
                source: this.source,
                frequency: this.frequency,
                month: this.month,
                monthday: this.monthday,
                weekday: this.weekday,
                time: this.time,
                status: this.status,
                last_executed: this.lastExecuted,
                created_at: new Date(),
                updated_at: new Date(),
            }).catch(
                (error)=>{throw new Error("internal error"+error);}
            );
        }
	}

	async delete() {
		await knex('auto_contribute').where({ reference: this.reference }).delete()
		.catch(
			(error)=>{throw new Error("internal error"+error);}
		);
	}


    static async getDueAutoSave(dueTime){
        if(!validator.isTime(dueTime)){
            throw new Error("Invalid time string. Time should be 24hrs. E.g 16:00")
        }
        const rows = await knex('auto_contribute')
        .select()
        .where(function() {
            this.where(function() {
                this.where('frequency', 'daily').andWhereRaw(`TIME(time) = ?`, [dueTime]);
            })
            .orWhere(function() {
                this.where('frequency', 'weekly').andWhereRaw(`WEEKDAY(NOW()) = weekday`).andWhereRaw(`TIME(time) = ?`, [dueTime]);
            })
            .orWhere(function() {
                this.where('frequency', 'monthly').andWhereRaw(`DAYOFMONTH(NOW()) = monthday`).andWhereRaw(`TIME(time) = ?`, [dueTime]);
            })
            .orWhere(function() {
                this.where('frequency', 'yearly').andWhereRaw(`MONTH(NOW()) = month`).andWhereRaw(`DAYOFMONTH(NOW()) = monthday`).andWhereRaw(`TIME(time) = ?`, [dueTime]);
            });
        })
		.catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        return rows.map((autoCont)=>{
            return new AutoSave(autoCont.reference, autoCont.coop_reference, autoCont.user_id, autoCont.amount, autoCont.source, {frequency: autoCont.frequency, month: autoCont.month, monthday: autoCont.monthday, weekday: autoCont.weekday, time: autoCont.time}, autoCont.status, autoCont.last_executed, autoCont.created_at, autoCont.updated_at);
        })
    }

	toJSON(){
		return {
			reference: this.reference,
            coopReference: this.coopReference,
            userId: this.userId,
            amount: this.amount,
            source: this.source,
            frequency: this.frequency,
            month: this.month,
            monthday: this.monthday,
            weekday: this.weekday,
            time: this.time,
            status: this.status,
            lastExecuted: this.lastExecuted,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
		}
	}
}

module.exports = {AutoSave};