const uuid = require('uuid');
const { knex } = require('./db.model');

class ServiceTransaction {

    _reference;
    _serviceReference;
    _serviceId;
    _type;
    _amount;
    _deviceFingerprint;
    _narration;
    _status;
    _paymentType;
    _createdAt;
    _userEmail;
    _userId;
    _currency;
    _ip;
    _amountSettled;
    

	constructor(reference, serviceReference, serviceId, type, amount, deviceFingerprint, narration, status, paymentType, createdAt, userEmail, userId, currency, ip, amountSettled) {
		this._reference = reference;
		this._serviceReference = serviceReference;
		this._serviceId = serviceId;
		this._type = type;
		this._amount = amount;
		this._deviceFingerprint = deviceFingerprint;
		this._narration = narration;
		this._status = status;
		this._paymentType = paymentType;
		this._createdAt = createdAt;
		this._userEmail = userEmail;
		this._userId = userId;
		this._currency = currency;
		this._ip = ip;
		this._amountSettled = amountSettled;
	}
    
	// Getters and setters
    get serviceReference() {
        return this._serviceReference;
    }
    set serviceReference(value) {
        this._serviceReference = value;
    }
    get serviceId() {
        return this._serviceId;
    }
    set serviceId(value) {
        this._serviceId = value;
    }
    get deviceFingerprint() {
        return this._deviceFingerprint;
    }
    set deviceFingerprint(value) {
        this._deviceFingerprint = value;
    }
    get paymentType() {
        return this._paymentType;
    }
    set paymentType(value) {
        this._paymentType = value;
    }
    get userEmail() {
        return this._userEmail;
    }
    set userEmail(value) {
        this._userEmail = value;
    }
    get userId() {
        return this._userId;
    }
    set userId(value) {
        this._userId = value;
    }
    get currency() {
        return this._currency;
    }
    set currency(value) {
        this._currency = value;
    }
    get ip() {
        return this._ip;
    }
    set ip(value) {
        this._ip = value;
    }
    get amountSettled() {
        return this._amountSettled;
    }
    set amountSettled(value) {
        this._amountSettled = value;
    }

	get reference() {
		return this._reference;
	}

	get type() {
		return this._type;
	}

	set type(type) {
		this._type = type;
	}

	get amount() {
		return this._amount;
	}

	set amount(amount) {
		this._amount = amount;
	}

	get createdAt() {
		return this._createdAt;
	}

	get narration() {
		return this._narration;
	}
	set narration(value) {
		this._narration = value;
	}

	get status() {
		return this._status;
	}
	set status(value) {
		this._status = value;
	}

	
	async save() {
		
		const existingTranx = await knex('service_transactions').where({ reference: this.reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingTranx && existingTranx.userId !== this.userId) {
			throw new Error(`Transaction with reference ${this.reference} already exists`);
		}
        
		const result = await knex('service_transactions').insert({
			reference: this.reference,
            service_reference: this.serviceReference,
            service_id: this.serviceId,
            type: this.type,
            amount: this.amount,
            device_fingerprint: this.deviceFingerprint,
            narration: this.narration,
            status: this.status,
            payment_type: this.paymentType,
            created_at: this.createdAt,
            user_email: this.userEmail,
            user_id: this.userId,
            currency: this.currency,
            ip: this.ip,
            amount_settled: this.amountSettled
		}).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
	}
	
	static async findAllByUser(userId) {
		const transactions = await knex('service_transactions').where({user_id: userId}).orderBy('created_at', 'desc').catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		return transactions.map((transaction) => {
			return new ServiceTransaction(transaction.reference, transaction.service_reference, transaction.service_id, transaction.type, transaction.amount, transaction.device_fingerprint, transaction.narration, transaction.status, transaction.payment_type, transaction.created_at, transaction.user_email, transaction.user_id, transaction.currency, transaction.ip, transaction.amount_settled);
		});
	}
	
	static async findTransactionByReference(reference) {
		const transaction = await knex('service_transactions').where('reference', reference).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if(!transaction){
            return null;
			// throw new Error("Transaction not found");
		}
		return new ServiceTransaction(transaction.reference, transaction.service_reference, transaction.service_id, transaction.type, transaction.amount, transaction.device_fingerprint, transaction.narration, transaction.status, transaction.payment_type, transaction.created_at, transaction.user_email, transaction.user_id, transaction.currency, transaction.ip, transaction.amount_settled);
	}
	
	static async findTransactionById(id) {
		const transaction = await knex('service_transactions').where('service_id', id).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if(!transaction){
            return null;
			// throw new Error("Transaction not found");
		}
		return new ServiceTransaction(transaction.reference, transaction.service_reference, transaction.service_id, transaction.type, transaction.amount, transaction.device_fingerprint, transaction.narration, transaction.status, transaction.payment_type, transaction.created_at, transaction.user_email, transaction.user_id, transaction.currency, transaction.ip, transaction.amount_settled);
	}
}

module.exports = {ServiceTransaction};
