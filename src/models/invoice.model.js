const {knex} = require('./db.model');

class Invoice {
	_reference;
    _businessid;
    _clientid;
    _currency;
    _dueDate;
    _amount;
    _amountPaid;
    _status;
    _createdAt;
    _updatedAt;
    
	

	constructor(reference, businessid, clientid, currency, dueDate, amount, amountPaid, status, createdAt = new Date(), updatedAt = new Date()) {
        this._reference = reference,
		this._businessid = businessid;
		this._clientid = clientid;
		this._currency = currency;
		this._dueDate = dueDate;
		this._amount = amount;
		this._amountPaid = amountPaid;
        this._status = status;
		this._createdAt = createdAt;
    	this._updatedAt = updatedAt;
	}

	// Getters and setters
    get reference() {
        return this._reference;
    }
    set reference(value) {
        this._reference = value;
    }

	get businessid() {
		return this._businessid;
	}
	set businessid(value) {
		this._businessid = value;
	}
    
    get clientid() {
        return this._clientid;
    }
    set clientid(value) {
        this._clientid = value;
    }

    get currency() {
        return this._currency;
    }
    set currency(value) {
        this._currency = value;
    }

    get dueDate() {
        return this._dueDate;
    }
    set dueDate(value) {
        this._dueDate = value;
    }

    get amount() {
        return this._amount;
    }
    set amount(value) {
        this._amount = value;
    }

    get amountPaid() {
        return this._amountPaid;
    }
    set amountPaid(value) {
        this._amountPaid = value;
    }

	get status() {
		return this._status;
	}
	set status(value) {
		this._status = value;
	}

	get createdAt() {
		return this._createdAt;
	}

	get updatedAt() {
		return this._updatedAt;
	}

	
	static async findById(reference) {
		const invoice = await knex('invoices').where({ reference:reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!invoice) {
			throw new Error(`Invoice with id ${reference} not found`);
		}
		return new Invoice(invoice.reference, invoice.business_reference, invoice.client_reference, invoice.currency, invoice.due_date, invoice.amount, invoice.amount_paid, invoice.status, invoice.created_at, invoice.updated_at);
	}

	async save() {
		const existingInvoice = await knex('invoices').where({ business_reference: this.businessid, reference: this.reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingInvoice && existingInvoice.reference !== this.reference) {
			throw new Error(`Invoice with id ${this.email} already exists`);
		}
		if (existingInvoice && existingInvoice.reference === this.reference) {
			await knex('invoices').where({ reference: this.reference }).update({
				currency: this.currency,
				due_date: this.dueDate,
				amount: this.amount,
				amount_paid: this.amountPaid,
				status: this.status,
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {
			await knex('invoices').insert({
                reference: this.reference,
				business_reference: this.businessid,
                client_reference: this.clientid,
				currency: this.currency,
				due_date: this.dueDate,
				amount: this.amount,
				amount_paid: this.amountPaid,
				status: this.status,
				created_at: new Date(),
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		}
	}

	async delete() {
		await knex('invoices').where({business_reference:this.businessid, reference: this.reference}).update({status: 'deleted'})
		.catch((error)=>{throw new Error("internal error"+error);})
	}
	
	async permanentDelete() {
		await knex('invoices').where({ business_reference:this.businessid, reference: this.reference }).delete()
		.catch((error)=>{throw new Error("internal error"+error);});
		
	}

	async restore() {
		await knex('invoices').where({business_reference:this.businessid, reference: this.reference}).update({status: 'active'})
		.catch((error)=>{throw new Error("internal error"+error);})
	}

	toJSON(){
		return {
            reference: this.reference,
            businessreference: this.businessid,
            clientreference: this.clientid,
            currency: this.currency,
            duedate: this.dueDate,
            amount: this.amount,
            amountpaid: this.amountPaid,
			status: this.status,
			createdat: this.createdAt,
			updatedat: this.updatedAt
		}
	}
}

module.exports = {Invoice};