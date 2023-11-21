const { knex } = require("./db.model");
const uuid = require("uuid");
const { ngCities } = require("./states-cities.model");
const { User } = require("./user.model");
const { OfflineUser } = require("./offlineuser.model");
const { Loan } = require("./loan.model");
const { Docs } = require("./docs.model");
const { Poll } = require("./poll.model");

class Coop {
    _reference;
    _name;
    _logo;
    _registrationId;
    _coreMission;
    _country;
    _state;
    _city;
    _address;
    _regApproval;
    _withdrawalApproval;
    _exitApproval;
    _visibility;
    _createdBy;
    _approvedBy;
    _createdAt;
    _updatedAt;
    _status;

    constructor(reference, name, logo, registrationId, country, state, createdBy) {
        this.reference = reference;
        this.name = name;
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
    
    get registrationId() {
        return this._registrationId;
    }
    set registrationId(value) {
        this._registrationId = value;
    }
    
    get coreMission() {
        return this._coreMission;
    }
    set coreMission(value) {
        this._coreMission = value;
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
    
    get regApproval() {
        return this._regApproval;
    }
    set regApproval(value) {
        this._regApproval = value;
    }
    
    get withdrawalApproval() {
        return this._withdrawalApproval;
    }
    set withdrawalApproval(value) {
        this._withdrawalApproval = value;
    }
    
    get exitApproval() {
        return this._exitApproval;
    }
    set exitApproval(value) {
        this._exitApproval = value;
    }
    
    get visibility() {
        return this._visibility;
    }
    set visibility(value) {
        this._visibility = value;
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
    
	async save() {
		const existingCoop = await knex('coops').where({ reference: this.reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingCoop && existingCoop.reference === this.reference) {
			await knex('coops').where({ reference: this.reference }).update({
                logo: this._logo,
                name: this.name,
                registration_id: this.registrationId,
                core_mission: this.coreMission,
                country: this.country,
                state: this.state,
                city: this.city,
                address: this.address,
                visibility: this.visibility,
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
                await trx('coops').insert({
                    reference: this.reference,
                    logo: this._logo,
                    name: this.name,
                    registration_id: this.registrationId,
                    core_mission: this.coreMission,
                    country: this.country,
                    state: this.state,
                    city: this.city,
                    address: this.address,
                    visibility: this.visibility,
                    created_by: this.createdBy,
                    approved_by: this.approvedBy,
                    created_at: new Date(),
                    updated_at: new Date(),
                    status: this.status
                });

                await trx('coop_members').insert({
                    coop_id: this.reference, member_id: this.createdBy, role: 'chairman'
                });
                
			    await trx.commit();

			} catch(error) {
                await trx.rollback();
				throw new Error("internal error"+error);
            }
		}
	}


    async addMember(memberId, role = 'member') {
        if(await this.isUserMember(memberId)){
            throw new Error("User is already a member");
        }
        await knex('coop_members')
        .insert({
            coop_id: this.reference,
            member_id: memberId,
            role,
            created_at: new Date()
        }).catch(
            (error)=>{throw new Error("internal error"+error);}
        );
    }

    async removeMember(memberId) {
        await knex('coop_members')
        .where({ coop_id: this.reference, member_id: memberId })
        .del().catch(
            (error)=>{throw new Error("internal error"+error);}
        );
    }

    async isUserMember(userId) {
        const result = await knex('coop_members')
        .where({coop_id: this.reference, member_id: userId})
        .select('member_id')
        .union([
            knex('offline_users')
            .where({coop_id: this.reference, uuid: userId})
            .select('uuid')
        ])
        .first().catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        if(result){
            return true;
        }
        else{
            return false;
        }
    }

    async getUserRole(userId) {
        const result = await knex('coop_members').where({coop_id: this.reference, member_id: userId}).first().catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        if(result){
            return result.role;
        }
        else{
            return null;
        }
    }

    async addMemberRequest(userId) {
        if(await this.isMemberRequestPending(userId)){
            throw new Error("There is already a pending membership request");
        }
        await knex('membership_requests')
        .insert({
            coop_id: this.reference,
            user_id: userId,
            created_at: new Date(),
            updated_at: new Date(),
            status: 'pending'
        }).catch(
            (error)=>{throw new Error("internal error"+error);}
        );
    }

    async removeMemberRequest(userId) {
        if(! await this.isMemberRequestPending(userId)){
            throw new Error("No pending membership request");
        }
        await knex('membership_requests')
        .where({
            coop_id: this.reference,
            user_id: userId,
            status: 'pending'
        }).delete().catch(
            (error)=>{throw new Error("internal error"+error);}
        );
    }

    async isMemberRequestPending(userId) {
        const existingRequest = await knex('membership_requests').where({coop_id: this.reference, user_id: userId, status: 'pending'}).first().catch((error)=>{throw new Error("internal error"+error);});
        if(existingRequest){
            return true;
        } else {
            return false;
        }
    }

    async acceptMemberRequest(executiveId, memberId) {
        await knex('membership_requests').where({coop_id: this.reference, user_id: memberId})
        .update({
            approved_by: executiveId,
            status: 'accepted',
            updated_at: new Date()
        }).catch(
            (error)=>{throw new Error("internal error"+error);}
        );

        await this.addMember(memberId);
    }

    async getCoopMembers(pageNo = 1, perPage=50){
        const offset = (pageNo-1) * perPage;

		const rows = await knex("coop_members")
        .select('member_id', 'created_at', 'role')
        .where({coop_id: this.reference})
        .union([
            knex('offline_users')
            .select('uuid', 'created_at', 'uuid')
            .where({coop_id: this.reference})
        ])
        .limit(perPage)
        .orderBy("created_at", "desc")
        .offset(offset)
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        /**
         * @type {User[]}
         */
        const users = await Promise.all(
            rows.map(async (user) => {
                var thisUser;
                
                try { // attempt offline user object
                    thisUser = await OfflineUser.findById(user.member_id);
                    thisUser.offlineuser = true;
                    thisUser.role = 'member';
                } catch (error) { // fallback to online user
                    thisUser = await User.findById(user.member_id);
                    thisUser.offlineuser = false;
                    thisUser.role = user.role;
                }
                return thisUser;
            })
        );
        return users;
	}

    async searchCoopMembers(searchTerm, perPage=50){

		const rows = await knex("coop_members")
        .innerJoin('users', 'coop_members.member_id', 'users.uuid')
        .select('coop_members.member_id', 'users.created_at', 'users.lastname', 'users.firstname', 'users.email')
        .where({coop_id: this.reference})
        .andWhere((qq)=>{
            qq = qq.whereILike('member_id', `%${searchTerm}%`)
            .orWhereILike('lastname', `%${searchTerm}%`)
            .orWhereILike('firstname', `%${searchTerm}%`)
            .orWhereILike('email', `%${searchTerm}%`);
        })
        .union([
            knex('offline_users')
            .select('uuid', 'created_at', 'lastname', 'firstname', 'email')
            .where({coop_id: this.reference})
            .andWhere((qq)=>{
                qq = qq.whereILike('uuid', `%${searchTerm}%`)
                .orWhereILike('lastname', `%${searchTerm}%`)
                .orWhereILike('firstname', `%${searchTerm}%`)
                .orWhereILike('email', `%${searchTerm}%`);
            })
        ])
        .limit(perPage)
        .orderBy("created_at", "desc")
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        /**
         * @type {User[]}
         */
        const users = await Promise.all(
            rows.map(async (user) => {
                var thisUser;
                
                try { // attempt offline user object
                    thisUser = await OfflineUser.findById(user.member_id);
                    thisUser.offlineuser = true
                } catch (error) { // fallback to online user
                    thisUser = await User.findById(user.member_id);
                    thisUser.offlineuser = false;
                }
                return thisUser;
            })
        );
        return users;
	}

    async getCoopMembershipRequests(pageNo = 1, perPage=20){
        const offset = (pageNo-1) * perPage;
		const rows = await knex("membership_requests")
        .where({coop_id: this.reference})
        .limit(perPage)
        .orderBy("created_at", "desc")
        .offset(offset)
        .catch(
			(error)=>{throw new Error("internal error");}
		);

        /**
         * @type {User[]}
         */
        const users = await Promise.all(
            rows.map(async (user) => {
                const thisUser = await User.findById(user.user_id);
                return thisUser;
            })
        );
        return users;
	}

    static async findById(coopId) {
        const [result] = await knex('coops').where({ reference: coopId }).catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        if(!result){
            throw new Error(`Co-operative with the id ${coopId} not found`)
        }
        const coop = new Coop(result.reference, result.name, result.logo, result.registration_d, result.country, result.state, result.created_by);

        coop.coreMission = result.core_mission;
        coop.city = result.city;
        coop.address = result.address;
        coop.exitApproval = result.exit_approval;
        coop.regApproval = result.reg_approval;
        coop.exitApproval = result.exit_approval;
        coop.withdrawalApproval = result.withdrawal_approval;
        coop.visibility = result.visibility;
        coop.createdAt = result.createdAt;
        coop.approvedBy = result.approvedBy;
        coop.status = result.status;
        
        return coop;
    }

    static async findByUser(userId) {
        const results = await knex('coops')
        .innerJoin('coop_members', 'coops.reference', 'coop_members.coop_id')
        .where('coop_members.member_id', userId)
        .select('coops.*', 'coop_members.role').catch(
            (error)=>{throw new Error("internal error"+error);}
        );

        /**
         * @type {Coop[]}
         */
        const coops = [];
        results.map((result, idx)=>{
            let coop = new Coop(result.reference, result.name, result.logo, result.registration_d, result.country, result.state, result.created_by);

            coop.coreMission = result.core_mission;
            coop.city = result.city;
            coop.address = result.address;
            coop.exitApproval = result.exit_approval;
            coop.regApproval = result.reg_approval;
            coop.exitApproval = result.exit_approval;
            coop.withdrawalApproval = result.withdrawal_approval;
            coop.visibility = result.visibility;
            coop.createdAt = result.createdAt;
            coop.approvedBy = result.approvedBy;
            coop.status = result.status;
            coops.push(coop);
        })
        return coops;
    }

    async getContribution(reference){
        const contribution = await knex('contributions')
        .where({reference: reference, coop_id: this.reference}).first()
        .catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        if(!contribution){
            throw new Error(`Contribution with the reference ${reference} not found`)
        }
        return contribution;
    }

    async getUserContribution(userId){
        const contributions = await knex('contributions')
        .innerJoin('coops', 'coops.reference', 'contributions.coop_id')
        .where({'contributions.user_id': userId, 'contributions.coop_id': this.reference})
        .select('contributions.*')
        .catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        return contributions;
    }

    async makeContribution(tranxReference, userId, amount, account, channel, comment = ''){
        // Check if memberId is a valid member of the coop
        if(! await this.isUserMember(userId)){
            throw new Error("You (user) are not a member of this co-operative");
        }
        
        // Validate amount is a positive number
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Invalid contribution amount');
        }
        
        // Add the contribution db
        await knex('contributions').insert({ 
            reference: tranxReference, 
            user_id: userId, 
            coop_id: this.reference, 
            amount, created_at: new Date(),
            account: account,
            channel: channel,
            comment: comment,
            transaction_reference: tranxReference 
        });
    }

    async getCoopContributions(pageNo = 1, perPage=50) {
        const offset = (pageNo-1) * perPage;
        const contributions = await knex('contributions')
        .where({ coop_id: this.reference })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .offset(offset)
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        return contributions
    }

    async searchCoopContributions(searchTerm, perPage=50){

		const rows = await knex("contributions")
        .where({'contributions.coop_id': this.reference})
        .innerJoin('users', 'contributions.user_id', 'users.uuid')
        .select('contributions.*', 'users.uuid', 'users.lastname', 'users.firstname', 'users.email')
        .andWhere((qq)=>{
            qq = qq.whereILike('reference', `%${searchTerm}%`)
            .orWhereILike('amount', `%${searchTerm}%`)
            .orWhereILike('transaction_reference', `%${searchTerm}%`)
            .orWhereILike('comment', `%${searchTerm}%`)
            .orWhereILike('email', `%${searchTerm}%`)
            .orWhereILike('firstname', `%${searchTerm}%`)
            .orWhereILike('lastname', `%${searchTerm}%`);
        })
        .union([
            knex('contributions')
            .where({'contributions.coop_id': this.reference})
            .innerJoin('offline_users', 'contributions.user_id', 'offline_users.uuid')
            .select('contributions.*', 'offline_users.uuid', 'offline_users.lastname', 'offline_users.firstname', 'offline_users.email')
            .andWhere((qq)=>{
                qq = qq.whereILike('reference', `%${searchTerm}%`)
                .orWhereILike('amount', `%${searchTerm}%`)
                .orWhereILike('transaction_reference', `%${searchTerm}%`)
                .orWhereILike('comment', `%${searchTerm}%`)
                .orWhereILike('email', `%${searchTerm}%`)
                .orWhereILike('firstname', `%${searchTerm}%`)
                .orWhereILike('lastname', `%${searchTerm}%`);
            })
        ])
        .limit(perPage)
        .orderBy("created_at", "desc")
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        return rows;
	}

	async getCoopBankAccount(){
		const bank = await knex("coop_bank_accounts").where({coop_reference: this.reference}).first()
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

	async saveCoopBankAccount(bankname, bankcode, accountname, accountnumber){
		const existingAcct = await knex('coop_bank_accounts').where({ coop_reference: this.reference }).first().catch(
			(error)=>{throw new Error("internal error"+error);}
		);
		if (existingAcct) {
			await knex('coop_bank_account').where({ coop_reference: this.reference }).update({
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
			await knex('coop_bank_accounts').insert({
				reference: bankRef,
				coop_reference: this.reference,
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

    async getLoanTerms(){
        const terms = await knex("loan_terms").where({coop_id: this.reference}).first().catch(
            (error)=>{throw new Error("internal error"+error);}
        )
        if(terms){
            return {monthly_interest_rate: terms.monthly_interest_rate, yearly_interest_rate: terms.yearly_interest_rate}
        } else {
            return {monthly_interest_rate: 0, yearly_interest_rate: 0}
        }
    }

    toJSON() {
        return {
            reference: this.reference,
            name: this.name,
            logo: this.logo,
            registrationId: this.registrationId,
            coreMission: this.coreMission,
            country: this.country,
            state: this.state,
            city: this.city,
            address: this.address,
            regApproval: this.regApproval,
            withdrawalApproval: this.withdrawalApproval,
            exitApproval: this.exitApproval,
            visibility: this.visibility,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            status: this.status
        };
    }

    async getCoopApprovals(){
        const approvals = await knex('coop_approvals')
        .where({coop_reference: this.reference}).first()
        .catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        if(!approvals){
            return {
                registration: 0,
                withdrawal: 0,
                exit: 0,
            }
        }

        return {
            registration: approvals.registration,
            withdrawal: approvals.withdrawal,
            exit: approvals.exit,
        }
        
    }

    async saveCoopApprovals(registration, withdrawal, exit){
        // check, if entry exists update else create
        const existingApprovals = await knex('coop_approvals')
        .where({coop_reference: this.reference}).first()
        .catch(
            (error)=>{throw new Error("internal error"+error);}
        )
        if(existingApprovals){
            await knex('coop_approvals').where({coop_reference: this.reference})
            .update({
                registration: registration,
                withdrawal: withdrawal,
                exit: exit,
                updated_at: new Date()
            })
        } else {
            await knex('coop_approvals').insert({
                coop_reference: this.reference,
                registration: registration,
                withdrawal: withdrawal,
                exit: exit,
                updated_at: new Date()
            });
        }
    }

    async getCoopFees(){
        const fees = await knex('coop_fees')
        .where({coop_reference: this.reference}).first()
        .catch(
            (error)=>{throw new Error("internal error"+error);}
        );
        
        if(!fees){
            return {
                registration: 0.00,
                withdrawal: 0.00,
                exit: 0.00,
            }
        }
        return {
            registration: fees.registration,
            withdrawal: fees.withdrawal,
            exit: fees.exit,
        }
    }

    async saveCoopFees(registration, withdrawal, exit){
        // check, if entry exists update else create
        const existingApprovals = await knex('coop_fees')
        .where({coop_reference: this.reference}).first()
        .catch(
            (error)=>{throw new Error("internal error"+error);}
        )
        if(existingApprovals){
            await knex('coop_fees').where({coop_reference: this.reference})
            .update({
                registration: registration,
                withdrawal: withdrawal,
                exit: exit,
                updated_at: new Date()
            })
            .catch(
                (error)=>{throw new Error("internal error"+error);}
            );
        } else {
            await knex('coop_fees').insert({
                coop_reference: this.reference,
                registration: registration,
                withdrawal: withdrawal,
                exit: exit,
                updated_at: new Date()
            })
            .catch(
                (error)=>{throw new Error("internal error"+error);}
            );
        }
    }



    /**
     * 
     * @param {string} searchString
     * @returns
     */
    static async searchCoops(searchString, blacklist = []) {
        // Parse the search string to extract keywords and filter values
        
        const keywords = searchString.split(" ");
        const filteredString = searchString
            .replace(/for\s+/gi, "") // remove "for"
            .replace(/that\s+is\s+/gi, "") // remove "that is"
            .replace(/\s+/g, " ") // replace multiple spaces with single space
            .toLowerCase(); // convert to lowercase
      
        var state = null;
        var coopCity = null;
        keywords.forEach(word=>{
            for (const city of ngCities) {
                if(city.city.toLowerCase() === word.toLowerCase()){
                    state = city.state;
                    coopCity = city.city;
                    break;
                }
            }
        });
      
        const interestRateRegex = /\b(\d+(\.\d+)?)\s*(?:%|percent)?\s*(?:interest|interest rate|rate|of interest)?/gi;
        const interestRateMatch = filteredString.match(interestRateRegex);
        const interestRate = interestRateMatch ? interestRateMatch[1] : null;
      
        const nameRegex = new RegExp(`^(${keywords.join("|")})\\s+(.*?)\\s+(?:'')`, "i");
        const nameMatch = filteredString.match(nameRegex);
        const name = nameMatch ? nameMatch[2] : null;
      
        // Construct database query based on search criteria

        let query = knex.select('*')
        .from('coops')
        .havingNotIn('reference', blacklist)
        .where({visibility: true, status: 'active'});

        query.where((qq)=>{
            if (state) {
                qq = qq.orWhereILike('state', `%${state}%`);
            }
            if (coopCity) {
                qq = qq.orWhereILike('city', `%${coopCity}%`);
            }
            if (interestRate) {
                qq = qq.orWhereILike('interest_rate', `%${interestRate}%`);
            }
            if (searchString) {
                qq = qq.orWhereILike('name', `%${searchString}%`);
                // query = query.orHaving('name', 'like', `%${keywords}%`);
            }
        });
        
        // Fetch cooperatives from the database and apply filters
        const results = await query.catch((error)=>{
            throw new Error("internal error"+error);
        });
        
        var coops = [];
        results.map((result)=>{
            const coop = new Coop(result.reference, result.name, result.logo, result.registration_d, result.country, result.state, result.created_by);

            coop.coreMission = result.core_mission;
            coop.city = result.city;
            coop.address = result.address;
            coop.exitApproval = result.exit_approval;
            coop.regApproval = result.reg_approval;
            coop.exitApproval = result.exit_approval;
            coop.withdrawalApproval = result.withdrawal_approval;
            coop.visibility = result.visibility;
            coop.createdAt = result.createdAt;
            coop.approvedBy = result.approvedBy;
            coop.status = result.status;
            coops.push(coop);
        })
        
        return coops;
    }
      

    static async getRandomCoops(quantity = 5, blacklist = []){
		const rows = await knex("coops")
        .havingNotIn('reference', blacklist)
        .orderByRaw('RAND()')
        .limit(quantity)
        .catch(
			(error)=>{throw new Error("internal error");}
		);

        var coops = [];
		rows.map((result) => {
            const coop = new Coop(result.reference, result.name, result.logo, result.registration_d, result.country, result.state, result.created_by);

            coop.coreMission = result.core_mission;
            coop.city = result.city;
            coop.address = result.address;
            coop.exitApproval = result.exit_approval;
            coop.regApproval = result.reg_approval;
            coop.exitApproval = result.exit_approval;
            coop.withdrawalApproval = result.withdrawal_approval;
            coop.visibility = result.visibility;
            coop.createdAt = result.createdAt;
            coop.approvedBy = result.approvedBy;
            coop.status = result.status;
            coops.push(coop);
        });
        return coops;
	}

    async getCoopLoans(pageNo = 1, perPage=50) {
        const offset = (pageNo-1) * perPage;
        const loans = await knex('loans')
        .where({ coop_reference: this.reference })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .offset(offset)
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        return loans.map((loan) => new Loan(loan.reference, loan.type, loan.user_id, loan.coop_reference, loan.amount, loan.tenure, loan.repayment_plan, loan.interest_rate, loan.interest_term, loan.status, loan.createdAt, loan.updatedAt));
    }

    async searchCoopLoans(searchTerm, perPage=50){

		const rows = await knex("loans")
        .where({coop_reference: this.reference})
        .innerJoin('users', 'loans.user_id', 'users.uuid')
        .select('loans.*', 'users.uuid', 'users.lastname', 'users.firstname', 'users.email')
        .andWhere((qq)=>{
            qq = qq.whereILike('reference', `%${searchTerm}%`)
            .orWhereILike('coop_reference', `%${searchTerm}%`)
            .orWhereILike('amount', `%${searchTerm}%`)
            .orWhereILike('repayment_plan', `%${searchTerm}%`)
            .orWhereILike('loans.status', `%${searchTerm}%`)
            .orWhereILike('email', `%${searchTerm}%`)
            .orWhereILike('firstname', `%${searchTerm}%`)
            .orWhereILike('lastname', `%${searchTerm}%`);
        })
        .unionAll([
            knex('loans')
            .where({coop_reference: this.reference})
            .innerJoin('offline_users', 'loans.user_id', 'offline_users.uuid')
            .select('loans.*', 'offline_users.uuid', 'offline_users.lastname', 'offline_users.firstname', 'offline_users.email')
            .andWhere((qq)=>{
                qq = qq.whereILike('reference', `%${searchTerm}%`)
                .orWhereILike('coop_reference', `%${searchTerm}%`)
                .orWhereILike('amount', `%${searchTerm}%`)
                .orWhereILike('repayment_plan', `%${searchTerm}%`)
                .orWhereILike('loans.status', `%${searchTerm}%`)
                .orWhereILike('email', `%${searchTerm}%`)
                .orWhereILike('firstname', `%${searchTerm}%`)
                .orWhereILike('lastname', `%${searchTerm}%`);
            })
        ])
        .limit(perPage)
        .orderBy("created_at", "desc")
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        /**
         * @type {Loan[]}
         */
        const loans = await Promise.all(
            rows.map(async (loan) => new Loan(loan.reference, loan.type, loan.user_id, loan.coop_reference, loan.amount, loan.tenure, loan.repayment_plan, loan.interest_rate, loan.interest_term, loan.status, loan.createdAt, loan.updatedAt))
        );
        return loans;
	}

    async getCoopDocs(pageNo = 1, perPage=50) {
        const offset = (pageNo-1) * perPage;
        const docs = await knex('coop_docs')
        .where({ coop_reference: this.reference })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .offset(offset)
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        return docs.map((doc) => new Docs(doc.reference, doc.coop_reference, doc.user_id, doc.title, doc.permission, doc.status, doc.created_at, doc.updated_at));
    }

    async searchCoopDocs(searchTerm, perPage=50){

		const rows = await knex("coop_docs")
        .where({coop_reference: this.reference})
        .andWhere((qq)=>{
            qq = qq.whereILike('reference', `%${searchTerm}%`)
            .orWhereILike('title', `%${searchTerm}%`)
        })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        /**
         * @type {Docs[]}
         */
        const docs = await Promise.all(
            rows.map(async (doc) => new Docs(doc.reference, doc.coop_reference, doc.user_id, doc.title, doc.permission, doc.filename, doc.status, doc.created_at, doc.updated_at))
        );
        return docs;
	}

    async getCoopPolls(pageNo = 1, perPage=50) {
        const offset = (pageNo-1) * perPage;
        const polls = await knex('coop_polls')
        .where({ coop_reference: this.reference })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .offset(offset)
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        return polls.map((poll) => new Poll(poll.reference, poll.coop_reference, poll.user_id, poll.question, poll.description, JSON.parse(poll.options), poll.start_date, poll.end_date, poll.status, poll.created_at, poll.updated_at));
    }

    async searchCoopPolls(searchTerm, perPage=50){

		const rows = await knex("coop_polls")
        .where({coop_reference: this.reference})
        .andWhere((qq)=>{
            qq = qq.whereILike('reference', `%${searchTerm}%`)
            .orWhereILike('question', `%${searchTerm}%`)
            .orWhereILike('description', `%${searchTerm}%`)
        })
        .limit(perPage)
        .orderBy("created_at", "desc")
        .catch(
			(error)=>{throw new Error("internal error"+error);}
		);

        /**
         * @type {Poll[]}
         */
        return await Promise.all(
            rows.map(async (poll) => new Poll(poll.reference, poll.coop_reference, poll.user_id, poll.question, poll.description, JSON.parse(poll.options), poll.start_date, poll.end_date, poll.status, poll.created_at, poll.updated_at))
        );
	}
}


module.exports = {Coop};