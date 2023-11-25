const { knex } = require("./db.model");
const uuid = require("uuid");
const bcrypt = require('bcryptjs');

class Business {
    _reference;
    _name;
    _email;
    _phone;
    _password;
    _logo;
    _registrationId;
    _country;
    _state;
    _city;
    _address;
    _createdBy;
    _approvedBy;
    _createdAt;
    _updatedAt;
    _status;

    constructor(reference, name, email, phone, logo, registrationId, country, state, createdBy) {
        this.reference = reference;
        this.name = name;
		this.email = email;
		this.phone = phone;
        this.logo = logo;
        this.registrationId = registrationId;
        this.country = country;
        this.state = state;
        this.createdBy = createdBy;
    }

    get reference() {
        return this._reference;
    }
    set reference(value) {
        this._reference = value;
    }
    
    get logo() {
        const parentLink = `${process.env.cdnLink}logos/`;
        if(this._logo && this._logo.length > 2){
		    return `${parentLink}${this._logo}`;
        } else {
    		return `${parentLink}defaultlogo.png`;
        }
    }
    set logo(value) {
        this._logo = value;
    }
    
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }

	get email() {
		return this._email;
	}

	set email(email) {
		this._email = email;
	}

	get phone() {
		return this._phone;
	}
	set phone(value) {
		this._phone = value;
	}
    
    get registrationId() {
        return this._registrationId;
    }
    set registrationId(value) {
        this._registrationId = value;
    }
    
    get country() {
        return this._country;
    }
    set country(value) {
        this._country = value;
    }
    
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
    }
    
    get city() {
        return this._city;
    }
    set city(value) {
        this._city = value;
    }
    
    get address() {
        return this._address;
    }
    set address(value) {
        this._address = value;
    }

    get createdBy() {
        return this._createdBy;
    }
    set createdBy(value) {
        this._createdBy = value;
    }
    
    get approvedBy() {
        return this._approvedBy;
    }
    set approvedBy(value) {
        this._approvedBy = value;
    }
    
    get updatedAt() {
        return this._updatedAt;
    }
    
    set updatedAt(value) {
        this._updatedAt = value;
    }
    
    get createdAt() {
        return this._createdAt;
    }
    
    set createdAt(value) {
        this._createdAt = value;
    }
    
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }

	
	async verifyPassword(password) {
		const passwordMatch = await bcrypt.compare(password, this._password);
		if (passwordMatch) {
			return true;
		} else {
			return false;
		}
	}

	async setPassword(password) {
		this._password = bcrypt.hashSync(password, 10);
	}
    
	async save() {
		const existingBusiness = await knex('businesses').where({ reference: this.reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingBusiness && existingBusiness.reference === this.reference) {
			await knex('businesses').where({ reference: this.reference }).update({
                logo: this._logo,
                name: this.name,
                email: this.email,
                phone: this.phone,
                password: this._password,
                registration_id: this.registrationId,
                country: this.country,
                state: this.state,
                city: this.city,
                address: this.address,
                approved_by: this.approvedBy,
                updated_at: new Date(),
                status: this.status
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {
            const trx = await knex.transaction().catch(
                (error)=>{throw new Error("internal error"+error);}
            );
            try{
                await trx('businesses').insert({
                    reference: this.reference,
                    logo: this._logo,
                    name: this.name,
                    email: this.email,
                    phone: this.phone,
                    password: this._password,
                    registration_id: this.registrationId,
                    country: this.country,
                    state: this.state,
                    city: this.city,
                    address: this.address,
                    created_by: this.createdBy,
                    approved_by: this.approvedBy,
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: this.status
                });
                
			    await trx.commit();

			} catch(error) {
                await trx.rollback();
				throw new Error("internal error"+error);
            }
		}
	}

    static async findById(businessId) {
        const result = await knex('businesses').where({ reference: businessId }).first()
        .catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        if(!result){
            throw new Error(`Business with the id ${businessId} not found`)
        }
        const business = new Business(result.reference, result.name, result.email, result.logo, result.registration_d, result.country, result.state, result.created_by);

        business.city = result.city;
        business.address = result.address;
        business.createdAt = result.createdAt;
        business.approvedBy = result.approvedBy;
        business.status = result.status;
        
        return business;
    }

    static async findByEmail(email) {
        const result = await knex('businesses').where({ email: email }).first()
        .catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        if(!result){
            throw new Error(`Business with the email ${email} not found`)
        }
        const business = new Business(result.reference, result.name, result.email, result.logo, result.registration_d, result.country, result.state, result.created_by);

        business.city = result.city;
        business.address = result.address;
        business.createdAt = result.createdAt;
        business.approvedBy = result.approvedBy;
        business.status = result.status;
        
        return business;
    }

	async getBusinessBankAccount(){
		const bank = await knex("bank_accounts").where({business_reference: this.reference}).first()
		.catch((error)=>{throw new Error("internal error"+error);});
		
		if(bank){
			return {
                bankname: bank.bank_name,
                bankcode: bank.bank_code,
                accountname: bank.account_name,
                accountnumber: bank.account_number,
                updatedat: bank.updated_at
            }
		} else {
			return null;
		}
	}

	async saveBusinessBankAccount(bankname, bankcode, accountname, accountnumber){
		const existingAcct = await knex('bank_accounts').where({ business_reference: this.reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingAcct) {
			await knex('bank_accounts').where({ business_reference: this.reference }).update({
				bank_name: bankname,
				bank_code: bankcode,
				account_name: accountname,
				account_number: accountnumber,
                updated_at: new Date(),
				status: this.status
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {
			const bankRef = uuid.v4().replace(/-/g, "");
			await knex('bank_accounts').insert({
				reference: bankRef,
				business_reference: this.reference,
				bank_name: bankname,
				bank_code: bankcode,
				account_name: accountname,
				account_number: accountnumber,
                updated_at: new Date(),
				status: this.status,
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		}
	}

	async delete() {
		await knex('businesses').where({reference: this.reference}).update({status: 'deleted'})
        .catch((error)=>{throw new Error("internal error"+error);})
	}
	
	async permanentDelete() {
		await knex('businesses').where({ reference: this.reference }).delete()
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		
	}

    toJSON() {
        return {
            reference: this.reference,
            name: this.name,
            email: this.email,
            phone: this.phone,
            logo: this.logo,
            registrationId: this.registrationId,
            country: this.country,
            state: this.state,
            city: this.city,
            address: this.address,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status
        };
    }
}


module.exports = {Business};