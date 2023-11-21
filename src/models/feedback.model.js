const {knex} = require('./db.model');

class Feedback {

	_reference;
	_name;
	_email;
	_pageName;
	_pageUrl;
	_message;
	_attachment;
	_createdAt;
	_updatedAt;
	_status;


	get reference() {
		return this._reference;
	}
	set reference(value) {
		this._reference = value;
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
    set email(value) {
        this._email = value;
    }

    get pageName() {
        return this._pageName;
    }
    set pageName(value) {
        this._pageName = value;
    }

    get pageUrl() {
        return this._pageUrl;
    }
    set pageUrl(value) {
        this._pageUrl = value;
    }

    get message() {
        return this._message;
    }
    set message(value) {
        this._message = value;
    }
    
    get attachment() {
        return this._attachment;
    }
    set attachment(value) {
        this._attachment = value;
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

	get status() {
		return this._status;
	}
	set status(value) {
		this._status = value;
	}
	
	constructor(reference, name, email, pageName, pageUrl, message, attachment, status, createdAt = new Date(), updatedAt = new Date()) {
		this.reference = reference,
		this.name = name,
		this.email = email,
		this.pageName = pageName,
		this.pageUrl = pageUrl,
		this.message = message,
		this.attachment = attachment,
		this.createdAt = createdAt,
		this.updatedAt = updatedAt,
		this.status = status
	}

	static async findByRef(reference) {
		const feedback = await knex('feedbacks').where({ reference:reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (!feedback) {
			throw new Error(`Feedback with ref ${reference} not found`);
		}
        
		return new Feedback(feedback.reference, feedback.name, feedback.email, feedback.page_name, feedback.page_url, feedback.message, feedback.attachment, card.status, card.created_at, card.updated_at);
	}

	async save() {
		const existingFeed = await knex('feedbacks').where({ reference: this.reference}).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingFeed) {
			await knex('feedbacks').where({ uuid: this.id }).update({
                name: this.name,
                email: this.email,
                page_name: this.pageName,
                page_url: this.pageUrl,
                message: this.message,
                attachment: this.attachment,
                status: this.status,
                updated_at: new Date(),
			}).catch(
				(error)=>{throw new Error("internal error"+error);}
			);
		} else {

            await knex('feedbacks').insert({
                reference: this.reference,
                name: this.name,
                email: this.email,
                page_name: this.pageName,
                page_url: this.pageUrl,
                message: this.message,
                attachment: this.attachment,
                status: this.status,
                created_at: new Date(),
                updated_at: new Date(),
            }).catch(
                (error)=>{throw new Error("internal error"+error);}
            );
        }
	}

	async delete() {
		await knex('feedbacks').where({ reference: this.reference }).delete()
		.catch(
			(error)=>{throw new Error("internal error"+error);}
		);
	}

	toJSON(){
		return {
			reference: this.reference, name: this.name, email: this.email, pagename: this.pageName, pageurl:this.pageUrl, message: this.message, attachment: this.attachment, created_at: this.createdAt,	updated_at: this.updatedAt, status: this.status
		}
	}
}

module.exports = {Feedback};