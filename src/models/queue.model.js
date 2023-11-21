const {knex} = require('./db.model');
const uuid = require('uuid');


class Queue {
	constructor(reference) {
		this.reference = reference;
	}

	// Add an item to the end of the queue
	async enqueue(item) {
		item = JSON.stringify(item);
        const itemReference = uuid.v4().replace(/-/g, '');
		await knex('queues').insert({
            reference: this.reference,
            item_reference: itemReference, 
            details: item,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
        }).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
	}

	// Remove and return the item from the front of the queue
	async dequeue() {
        const rows = await knex('queues').where({reference: this.reference}).orderBy('created_at', 'asc').limit(1)
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
        if(rows.length < 1){
            throw new Error('Queue is empty');
        }

        // delete item entry
        await knex('queues').where({reference: this.reference, item_reference: rows[0].item_reference}).delete().limit(1).catch(
			(error)=>{throw new Error("internal error"+error);}
		);
	}

	// Get the size of the queue
	async size() {
        const rows = await knex('queues').where({reference: this.reference}).count('id as num')
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
        if(!rows){
            return 0
        } else {
            return rows[0].num;
        }
	}

	// Get the front item without removing it
	async front() {
        const rows = await knex('queues').where({reference: this.reference}).orderBy('created_at', 'asc').limit(1)
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);
        if(rows.length <= 0){
            return null;
        }
		return rows[0];
	}
}

module.exports = { Queue }