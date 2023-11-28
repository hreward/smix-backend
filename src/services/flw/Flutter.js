const uuid = require("uuid");
const superagent = require("superagent");
const { User } = require("../../models/client.model");
const { Card } = require("../../models/card.model");

class Flutter {
	constructor(apiKey) {
		this.apiKey = apiKey;
		this.baseUrl = 'https://api.flutterwave.com/v3';
	}

  /**
   * 
   * @param {string} tokenReference
   * @param {User} user
   * @param {string} narration
   * @param {Number} amount
   */
	async tokenCharge(tokenReference, user, narration, amount) {
		try {
			const card = await Card.findByRef(tokenReference);
			if(card.status !== 'active'){
				throw new Error("Selected card token is not active");
			}
			if(card.userId !== user.id){
				throw new Error("You don't seem be the owner of this card.")
			}
			const response = await superagent.post(`${this.baseUrl}/tokenized-charges`)
				.send({
					token: card.token,
					tx_ref: uuid.v4(),
					amount: amount,
					currency: "NGN",
					email: user.email,
					first_name: user.firstName,
					last_name: user.lastName,
					narration: `${narration}`,
					meta: {},
					customer: {
						email: user.email,
						phonenumber: user.phone,
						name: `${user.firstName} ${user.lastName}`
					}
				})
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${this.apiKey}`)
				.catch((error)=>{
					if(error.code == 'ENOTFOUND'){
						throw new Error ("Flutter service is not reachable.");
					} else {
						throw error.response.text
					}
				});

			// Log the payment to the appropriate user and co-operative

			const responseData = response.body;
			if(responseData.status === 'success'){
				return responseData.data;
			} else {
				throw new Error(responseData.message);
			}
		} catch (error) {
			// Handle error
			console.error('Card charge failed:', error);
			throw new Error('Card charge failed');
		}
	}


	async fetchChargeTransaction(id) {
		try {
			const response = await superagent.get(`${this.baseUrl}/transactions/${id}/verify`)
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${this.apiKey}`)
				.catch((error)=>{
					if(error.code == 'ENOTFOUND'){
						throw new Error ("Flutterwave service is not reachable.");
					} else {
						throw error.response.text
					}
				});

			// Log the payment to the appropriate user and co-operative
			const responseData = response.body;
			if(responseData.status === 'success'){
				return responseData.data;
			} else {
				throw new Error(responseData.message);
			}
		} catch (error) {
			// Handle error
			console.error('Charge verification failed:', error);
			throw new Error('Charge verification failed');
		}
	}


	async getBanks() {
		try {
			const response = await superagent.get(`${this.baseUrl}/banks/NG`)
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${this.apiKey}`)
				.catch((error)=>{
					if(error.code == 'ENOTFOUND'){
						throw new Error ("Flutterwave service is not reachable.");
					} else {
						throw error.response.text
					}
				});

			// Log the payment to the appropriate user and co-operative
			// return response.body.data;
			const responseData = response.body;
			if(responseData.status === 'success'){
				return responseData.data;
			} else {
				throw new Error(responseData.message);
			}
		} catch (error) {
			// Handle error
			console.error('Banks query failed:', error);
			throw new Error('Banks query failed');
		}
	}


	async resolveAccount(accountnumber, bank) {
		try {
			const response = await superagent.post(`${this.baseUrl}/accounts/resolve`)
				.send({
					account_number: accountnumber,
					account_bank: bank
				})
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${this.apiKey}`)
				.catch((error)=>{
					if(error.code == 'ENOTFOUND'){
						throw new Error ("Flutterwave service is not reachable.");
					} else {
						throw error.response.text;
					}
				});

			// Log the payment to the appropriate user and co-operative
			// return response.body.data;
			const responseData = response.body;
			if(responseData.status === 'success'){
				return responseData.data;
			} else {
				throw new Error(responseData.message);
			}
		} catch (error) {
			// Handle error
			console.error('Account resolve failed:', error);
			throw new Error('Account resolve failed');
		}
	}

	async transferFunds(reference, bankcode, accountNumber, amount, currency, userId) {
		try {
			const response = await superagent.post(`${this.baseUrl}/transfers`)
				.send({
					meta: {
						userId: userId,
					},
					reference: reference,
					account_bank: bankcode,
					account_number: accountNumber,
					amount,
					currency,
				})
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${this.apiKey}`)
				.catch((error)=>{
					if(error.code == 'ENOTFOUND'){
						throw new Error ("Flutterwave service is not reachable.");
					} else {
						throw error.response.text;
					}
				});

			// Log the payment to the appropriate user and co-operative
			// return response.body.data;
			const responseData = response.body;
			if(responseData.status === 'success'){
				return responseData.data;
			} else {
				throw new Error(responseData.message);
			}
		} catch (error) {
			// Handle error
			console.error('Fund transfer failed:', error);
			throw new Error('Fund transfer failed');
		}
	}


	async chargeUrl(user, coop, amount, currency) {
		try {
			
			const response = await superagent.post(`${this.baseUrl}/charges`)
				.send({
					token: "",
					tx_ref: uuid.v4(),
					amount: amount,
					currency: currency.toUpperCase(),
					redirect_url: `http://localhost:8000/whooks/charge`,
					meta: {},
					customer: {
						email: user.email,
						phonenumber: user.phone,
						name: `${user.firstName} ${user.lastName}`
					},
					customizations: {
						title: `${bus_details.name} ${bus_details.bid}`,
						// logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
						logo: bus_details.logo
					}
				})
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${this.apiKey}`)
				.catch((error)=>{throw new Error("Service Error")})

			// Log the payment to the appropriate user and co-operative

			return response.data;
		} catch (error) {
			// Handle error
			console.error('Card charge failed:', error.response.data);
			throw new Error('Card charge failed');
		}
	}


	async chargeCard(user, cardDetails, amount, currency) {
		try {
			const response = await axios.post(`${this.baseUrl}/charges`, {
				user_id: user.id, // Assuming you have a user object with an `id` property
				co_op_id: user.cooperativeId, // Assuming you have a user object with a `cooperativeId` property
				card_number: cardDetails.cardNumber,
				cvv: cardDetails.cvv,
				expiry_month: cardDetails.expiryMonth,
				expiry_year: cardDetails.expiryYear,
				amount,
				currency,
			}, {
				headers: {
				Authorization: `Bearer ${this.apiKey}`,
				},
			});

			// Log the payment to the appropriate user and co-operative

			return response.data;
		} catch (error) {
			// Handle error
			console.error('Card charge failed:', error.response.data);
			throw new Error('Card charge failed');
		}
	}
}

module.exports = Flutter;
