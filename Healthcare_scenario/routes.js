//SPDX-License-Identifier: Apache-2.0

var abac = require('./controller.js');
//var abac = require('./controller_x.js');

module.exports = function(app){

  app.get('/get_ehr/:parameters', function(req, res){
    abac.get_ehr(req, res);
  });
  app.get('/get_ehr_no_eval/:parameters', function(req, res){
    abac.get_ehr_no_eval(req, res);
  });
  app.get('/add_ehr/:ehr', function(req, res){
    abac.add_ehr(req, res);
  });
  app.get('/add_ehr_no_eval/:ehr', function(req, res){
    abac.add_ehr_no_eval(req, res);
  });  
  app.get('/get_all_state/:parameters', function(req, res){
    abac.get_all_state(req, res);
  });
  app.get('/get_all_state_no_eval/:parameters', function(req, res){
    abac.get_all_state_no_eval(req, res);
  });
  app.get('/update_ehr/:ehr', function(req, res){
    abac.update_ehr(req, res);
  });
  app.get('/update_ehr_no_eval/:ehr', function(req, res){
    abac.update_ehr_no_eval(req, res);
  });
  app.get('/update_consent/:ehr', function(req, res){
    abac.update_consent(req, res);
  });
  app.get('/update_consent_no_eval/:ehr', function(req, res){
    abac.update_consent_no_eval(req, res);
  });
  app.get('/track_ehr/:ehr', function(req, res){
    abac.track_ehr(req, res);
  });
  app.get('/track_ehr_no_eval/:ehr', function(req, res){
    abac.track_ehr_no_eval(req, res);
  });
}
