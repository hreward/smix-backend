const { knex } = require("./db.model");
const uuid = require("uuid");
const moment = require("moment");
const {global} = require("../helper");

class AuthCodes {
    static async generateCode(purpose, userEmail){
        //generate code
        const code = uuid.v4().split("-")[0].slice(0,7).toUpperCase();

        var code_details = {
            code: code,
            user_email: userEmail,
            purpose: purpose,
            date_generated: moment().format("YYYY-MM-DD HH:mm:s"),
            expiry_date: moment().add(30, "minutes").format("YYYY-MM-DD HH:mm:s"),
            date_used: moment().format("YYYY-MM-DD HH:mm:s"),
            status: "active"
        };

        //delete codes that have been generated for this purpose
        await knex('auth_codes').where({user_email: userEmail, purpose}).delete().catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        await knex('auth_codes').insert(code_details).catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        return code;
    }

    static async verifyCode(email, code){
        const dbcode = await knex('auth_codes').where({code, user_email: email}).first()
            .catch( (error)=>{throw new Error("internal error"+error);} );
        
        if(!dbcode){
            throw new Error(`Code is invalid or has expired`);
        }

        if(dbcode.status == "used"){
            throw new Error(`Code has been used already`);
        } else if (moment(dbcode.expiry_date).isBefore(moment())){
            throw new Error(`Code has expired`);
        }
        
        this.cleanCodes();
        return true;
    }

    static async markCodeUsed(email, code){
        await knex('auth_codes').where({code: code, user_email: email}).update({status: 'used'}).
        catch( (error)=>{throw new Error("internal error"+error);} );
    }

    static async cleanCodes(){
        const deleteDate = moment().subtract(10, "days").format("YYYY-MM-DD HH:mm:s");
        await knex('auth_codes').whereRaw('expiry_date' < deleteDate).delete().catch(
            (error)=>{
                console.log(error);
                throw new Error("internal error"+error);
            }
        );
    }
}


module.exports = {AuthCodes};