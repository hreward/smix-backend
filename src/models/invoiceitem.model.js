const {knex} = require('./db.model');

class InvoiceItem {
	_reference;
    _businessid;
    _invoiceid;
    _serialNumber;
    _description;
    _quantity;
    _rate;
    _amount;
    _createdAt;
    _updatedAt;	

	constructor(reference, businessid, invoiceid, serialNumber, description, quantity, rate, amount, createdAt = new Date(), updatedAt = new Date()) {
        this._reference = reference,
		this._businessid = businessid;
		this._invoiceid = invoiceid;
		this._serialNumber = serialNumber;
		this._description = description;
		this._quantity = quantity;
		this._rate = rate;
		this._amount = amount;
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
    
    get invoiceid() {
        return this._invoiceid;
    }
    set invoiceid(value) {
        this._invoiceid = value;
    }

    get serialNumber() {
        return this._serialNumber;
    }
    set serialNumber(value) {
        this._serialNumber = value;
    }

    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }

    get quantity() {
        return this._quantity;
    }
    set quantity(value) {
        this._quantity = value;
    }

    get rate() {
        return this._rate;
    }
    set rate(value) {
        this._rate = value;
    }

    get amount() {
        return this._amount;
    }
    set amount(value) {
        this._amount = value;
    }

	get createdAt() {
		return this._createdAt;
	}

	get updatedAt() {
		return this._updatedAt;
	}

	static async findById(reference) {
		const item = await knex('invoice_items').where({ reference:reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!item) {
			throw new Error(`Invoice item with id ${reference} not found`);
		}
		return new InvoiceItem(item.reference, item.business_reference, item.invoice_reference, item.serial_number, item.description, item.quantity, item.rate, item.amount, item.created_at, item.updated_at);
	}

	static async findByInvoice(invoiceid) {
		const items = await knex('invoice_items').where({ invoice_reference:invoiceid }).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		return items.map((item)=>{
            return new InvoiceItem(item.reference, item.business_reference, item.invoice_reference, item.serial_number, item.description, item.quantity, item.rate, item.amount, item.created_at, item.updated_at);
        }); 
	}

	async save() {
		const existingItem = await knex('invoice_items').where({ business_reference: this.businessid, reference: this.reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingItem && existingItem.reference !== this.reference) {
			throw new Error(`Invoice item with id ${this.email} already exists`);
		}
		if (existingItem && existingItem.reference === this.reference) {
			await knex('invoice_items').where({ reference: this.id }).update({
				serial_number: this.serialNumber,
                description: this.description,
                quantity: this.quantity,
                rate: this.rate,
				amount: this.amount,
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {
			await knex('invoice_items').insert({
                reference: this.reference,
				business_reference: this.businessid,
                invoice_reference: this.invoiceid,
				serial_number: this.serialNumber,
                description: this.description,
                quantity: this.quantity,
                rate: this.rate,
				amount: this.amount,
				created_at: new Date(),
				updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		}
	}

	async delete() {
		await knex('invoice_items').where({ business_reference:this.businessid, reference: this.reference }).delete()
		.catch((error)=>{throw new Error("internal error"+error);});
	}

	toJSON(){
		return {
            reference: this.reference,
            businessreference: this.businessid,
            invoicereference: this.invoiceid,
            serialnumber: this.serialNumber,
            description: this.description,
            quantity: this.quantity,
            rate: this.rate,
            amount: this.amount,
			createdat: this.createdAt,
			updatedat: this.updatedAt
		}
	}
}

module.exports = {InvoiceItem};