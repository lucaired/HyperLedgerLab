'use strict';
const getParameters = require('./getParameters');
const create = require('./create');
const play = require('./play');
const queryRightHolders = require('./queryRightHolders');
const viewMetaData = require('./viewMetaData');
const calcRevenue = require('./calcRevenue');
const fs = require('fs');
const read = require('read-yaml');
const KnuthShuffle = require('./knuthShuffle');
const random = require('./random');
var deck = require('deck');
var Picker = require('random-picker').Picker;
//const parameters = read.sync('parameters.yaml');

const ALLTESTCASE = [
    create,
    play,
    queryRightHolders,
    viewMetaData,
    calcRevenue
];

//let readHeavy = {0 : 1, 1 : 1, 2 : 1, 3 : 1, 4 : 10, 5 : 10, 6 : 1, 7 : 1, 8 : 10};
//let writeHeavy = {0 : 10, 1 : 10, 2 : 10, 3 : 10, 4 : 1, 5 : 1, 6 : 10, 7 : 10, 8 : 1};
let readHeavy = [2, 3, 4];
let writeHeavy = [0, 1];


// PROVIDE NUMBER OF TESTCASES
let testCasePermuation = [
    0,
    1,
    2,
    3,
    4
];

let permutationsToCompute = 1;

function isDefined(t) {
  if (t === undefined) {
     return false;
  }
  return true;
}


module.exports.info = 'DRM Chaincode function randomizer';

let bc, contx;

module.exports.init = function (blockchain, context, args) {
    bc = blockchain;
    contx = context;
    return Promise.resolve();
};
module.exports.run = function () {

    let args;
    let chaincodeType = getParameters.chaincodeType();
    //picker.removeAll();
    var picker = new Picker(); 
    let prob = getParameters.readWriteProb();
    picker.option(0, prob);
    picker.option(1, 100 - prob);

    if (chaincodeType == 0) {
	let uniformPick = deck.pick(testCasePermuation);
	args = ALLTESTCASE[uniformPick].get();
	//console.info('chaincode function:', ALLTESTCASE[uniformPick]);
	//console.info('Otherarguments:', args);		
	//if (uniformPick == 2) {
		//console.info('chaincode function:', ALLTESTCASE[uniformPick]);
		//console.info('arguments:', args);		
	//}
	//console.info('CURRENT CHAINCODE FUNCTION:');
	//console.info(ALLTESTCASE[uniformPick]);
    }
    else if (chaincodeType == 1) {
	let weightedPick = 0;
	if (picker.pick() == 0) {	
		weightedPick = deck.pick(readHeavy);
	}
	else {
		weightedPick = deck.pick(writeHeavy);
	}
	args = ALLTESTCASE[weightedPick].get();
        //console.info('CURRENT CHAINCODE FUNCTION:');
	//console.info(ALLTESTCASE[weightedPick]);
    }
    else if (chaincodeType == 2) {
	let weightedPick = 0;
        if (picker.pick() == 0) {
                weightedPick = deck.pick(writeHeavy);
        }
        else {
                weightedPick = deck.pick(readHeavy);
        }
        args = ALLTESTCASE[weightedPick].get();
        //console.info('CURRENT CHAINCODE FUNCTION:');
        //console.info(ALLTESTCASE[weightedPick]);
    }

    //console.info('arguments:', args);
    let txstatus = bc.invokeSmartContract(contx, 'drm', 'v1', args, 120);
    //console.info('TRANSACTION STATUS');

    txstatus.then(function(result) {
	//Endorse errors
	if (isDefined(result[0].Get('endorse_error'))){
		console.info('endorse_error: ', result[0].Get('endorse_error'));
	}
	if (isDefined(result[0].Get('endorse_sig_error'))){
                console.info('endorse_sig_error: ', result[0].Get('endorse_sig_error'));
        }
	if (isDefined(result[0].Get('endorse_denied_error'))){
                console.info('endorse_denied_error: ', result[0].Get('endorse_denied_error'));
        }

	if (isDefined(result[0].Get('endorse_rwmismatch_error'))){
                console.info('endorse_rwmismatch_error: ', result[0].Get('endorse_rwmismatch_error'));
        }

	//Ordering errors
	if (isDefined(result[0].Get('ordering_error'))){
                console.info('ordering_error: ', result[0].Get('ordering_error'));
        }
	//Commit error
	if (isDefined(result[0].Get('commit_error'))){
                console.info('commit_error: ', result[0].Get('commit_error'));
        }
	//Submit Tx all other caught errors (unexpected errors)
	if (isDefined(result[0].Get('submittx_error'))){
                console.info('submittx_error: ', result[0].Get('submittx_error'));
        }
	if (isDefined(result[0].Get('submittx_expected_error'))){
                console.info('submittx_expected_error: ', result[0].Get('submittx_expected_error'));
        }
	//Latencies
	if (isDefined(result[0].Get('endorse_latency'))){
                console.info('endorse_latency: ', result[0].Get('endorse_latency'));
        }
	if (isDefined(result[0].Get('ordering_submission_latency'))){
                console.info('ordering_submission_latency: ', result[0].Get('ordering_submission_latency'));
        }
	if (isDefined(result[0].Get('commit_success_time'))){
                console.info('commit_success_time: ', result[0].Get('commit_success_time'));
        }
	if (isDefined(result[0].Get('orderingandvalidation_time'))){
                console.info('orderingandvalidation_time: ', result[0].Get('orderingandvalidation_time'));
        }
	if (isDefined(result[0].Get('total_transaction_time'))){
                console.info('total_transaction_time: ', result[0].Get('total_transaction_time'));
        }
	if (isDefined(result[0].Get('ordering_broadcast_timeout'))){
                console.info('ordering_broadcast_timeout: ', result[0].Get('ordering_broadcast_timeout'));
        }


    })
    return txstatus;
};

module.exports.end = function () {
return Promise.resolve();
};




