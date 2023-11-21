const { AutoSave } = require("../models/autosave.model");
const { Queue } = require("../models/queue.model");
const scheduler = require("node-schedule");
const { CoopController } = require("./coop.controller");

const cronRule = new scheduler.RecurrenceRule();
cronRule.second = 0;

class CronJobs{
    static async getAutoSave(){
        try {
            console.log("queueing due autosaves");
            // get due autosave
            const time = new Date().getHours().toString().padStart(2, '0')+':00';
            const dueAutoSaves = await AutoSave.getDueAutoSave(time);

            if(dueAutoSaves.length <= 0){
                console.log("empty queue")
                return;
            }
            
            // put them in a queue
            const queue = new Queue('autosave2');

            for(const autosave of dueAutoSaves){
                await queue.enqueue(autosave);
            };
            
            // call worker to attend to queue in another job
            // CronJobs.doingAS = scheduler.scheduleJob(cronRule, CronJobs.startAutoSave);
            await CronJobs.startAutoSave().catch((error)=>{});
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
    static async startAutoSave(){
        try {
            console.log("doing debiting");
            // access queue
            const queue = new Queue('autosave2');
            while (await queue.size() > 0) {
                console.log("----");

                try {
                    // get item in front of queue
                    const fronItem = await queue.front();
                    
                    // initiate debit
                    /**
                     * @type {AutoSave}
                     */
                    const autoSave = JSON.parse(fronItem.details);
                    if(!autoSave){
                        throw new Error("Item isn't a proper autosave object")
                    }
                    const coopid = autoSave.coopReference;
                    const userId = autoSave.userId;
                    const amount = parseFloat(autoSave.amount);
                    const source = autoSave.source;
                    
                    await CoopController.makeAutoContribution(coopid, userId, amount, source);
    
                    // dequeue item from queue
                    await queue.dequeue();
                } catch (err) {
                    // dequeue item from queue
                    await queue.dequeue();
                }

            }
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
    }
}

module.exports = { CronJobs }