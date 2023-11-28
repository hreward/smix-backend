/////////////////////
/////APP GEN VAR/////
/////////////////////
const countryKeys = [ "NG", "GH", "KE", "UG", "ZA", "TZ" ];
const countryNamesKeys = {
	nigeria:"NG", ghana: "GH", kenya:"KE", uganda:"UG", "south africa":"ZA", tanzania:"TZ"
};
//supported currencies
const supportedCurrencies = ["NGN", "GHS"];
//supported countries
const supportedCountries = ["nigeria", "ghana", "kenya", "uganda", "south africa", "tanzania"];

// nigeria states
const nigeriaStates = ["abia", "adamawa", "akwaibom", "anambra", "bauchi", "bayelsa", "benue", "borno", "crossriver", "delta", "ebonyi", "edo", "ekiti", "enugu", "gombe", "imo", "jigawa", "kaduna", "kano", "katsina", "kebbi", "kogi", "kwara", "lagos", "nasarawa", "niger", "ogun", "ondo", "osun", "oyo", "plateau", "rivers", "sokoto", "taraba", "yobe", "zamfara"];

const countrycurrency = {
	supportedCurrencies: supportedCurrencies,
	supportedCountries: supportedCountries,
	countryShortCode: function(countryName){
		if(supportedCountries.includes(countryName.toLowerCase())){
			return countryNamesKeys[countryName];
		} else {
			return false;
		}
	}
}
const isNotEmpty = function (string){
	if(string === undefined || string === null || string.length < 1){
		return false;
	} else {
		return true;
	}
}

module.exports = {
	countrycurrency,
	supportedCountries,
	supportedCurrencies,
	nigeriaStates,
	isNotEmpty
}