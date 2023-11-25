const http = require ("http");
const {mapp} = require ("./app");
// const { CronJobs } = require("../src/controllers/cronjobs.controller");
const scheduler = require("node-schedule");
const { createWebSocketServer } = require("./wsapp");

const PORT = process.env.PORT || 8000;

const server = http.createServer(mapp);

// Create the WebSocket server using the HTTP server
const wss = createWebSocketServer(server);

server.listen(PORT, ()=>{
    console.log(`Listening on PORT ${PORT}`);
});

// cron job
const cronRule = new scheduler.RecurrenceRule();
cronRule.minute = 1;
//"*/5 * * * *" for 5minutes pass each hour
// const gettingAS = scheduler.scheduleJob(cronRule, CronJobs.getAutoSave);