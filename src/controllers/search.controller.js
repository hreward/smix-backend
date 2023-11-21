const { Coop } = require("../models/business.model");
const { User } = require("../models/user.model");


class SearchController{
    static async searchByString(request, response){

        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            function isNotEmpty(string){
                if(string === undefined || string === null || string.length < 1){
                    return false;
                } else {
                    return true;
                }
            }
            
            if(!request.params.search || request.params.search.length < 1){
                return response.status(400).json({status:"error", success:false, message:"invalid search string"});
            }
            const searchString = request.params.search;

            console.log(request.session.sentSearchCoops);
            console.log(request.params);
            if(isNotEmpty(request.params.more) && request.session.sentSearchCoops){
                var blacklist = request.session.sentSearchCoops
            } else {
                request.session.sentSearchCoops = [];
                var blacklist = request.session.sentSearchCoops;
            }

            /**
             * @type {Coop[]}
             */
            const coops = await Coop.searchCoops(searchString, blacklist);
            
            //strip some data from coop
            coops.forEach(coop => {
                // add coops references to session
                request.session.sentSearchCoops.push(coop.reference);
                delete coop.approvedBy;
                delete coop.createdBy;
                delete coop.coreMission;
            });

            return response.status(200).json({
                status:true,
                success:true,
                data: coops,
            });
        
        } catch (error) {
            console.error(error);
            return response.status(200).json({
                status:true,
                success:false,
                message:error.message
            });
        }

    }
    static async exploreCoops(request, response){
        
        
        try {
            /**
             * @type {User}
             */
            const user = request.user;
            if(!user) throw new Error("You need to login");

            function isNotEmpty(string){
                if(string === undefined || string === null || string.length < 1){
                    return false;
                } else {
                    return true;
                }
            }
            if(isNotEmpty(request.params.more) && request.session.sentCoops){
                console.log(request.session.sentCoops);
                //load new content
                /**
                 * @type {Coop[]}
                 */
                var coops = await Coop.getRandomCoops(3, request.session.sentCoops);
            } else {
                request.session.sentCoops = [];
                /**
                 * @type {Coop[]}
                 */
                var coops = await Coop.getRandomCoops(3);
            }

            
            //strip some data from coop
            coops.forEach(coop => {
                // add coops references to session
                request.session.sentCoops.push(coop.reference);
                delete coop.approvedBy;
                delete coop.createdBy;
                delete coop.coreMission;
            });

            return response.status(200).json({
                status:true,
                success:true,
                data: coops,
            });
        
        } catch (error) {
            console.error(error);
            return response.status(200).json({
                status:true,
                success:false,
                message:error.message
            });
        }

    }

}

module.exports = {SearchController}