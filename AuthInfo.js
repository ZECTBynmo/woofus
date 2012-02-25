var globalNamespace = {};
(function (exports) {
  
  exports.GetUserID = function(str) {
    return '4eca8214a3f751459f000b4a';
  };
  
  exports.GetAuth = function(str) {
    return 'auth+live+53781ac2f01396e4cfe1afb3c564b9fa771bee57';
  };
  
  exports.GetRoomID = function(str) {
	return '4e4460f314169c06532bc9c9';
  };
  
  exports.GetLastFMKey = function(str) {
	return 'add155dd0060865e79105240bc378065';
  };
  
  exports.GetLastFMSecret = function(str) {
	return '14d6d4dff7f52a65aa46e5d4644990b6';
  };
  
  exports.GetAppString = function(str) {
	return 'TurntableFM/v0.01 BotFM';
  };
  
  exports.GetScreenName = function(str) {
	return 'woofusTT';
  };
  
  exports.GetAIMPassword = function(str) {
	return 'poopoo';
  };
  
  exports.GetBotArmyIDs = function() {
  
	var botArmyIDs = new Array();
	botArmyIDs[0] = '4ee521154fe7d0603e001725';
	botArmyIDs[1] = '4ee5230e4fe7d0603e001735';
	botArmyIDs[2] = '4ee524544fe7d0603e00174c';
	botArmyIDs[3] = '4ee53faf4fe7d0603e001867';
  
	return botArmyIDs;
  };
  
exports.GetBotArmyAuths = function() {
	
	var botArmyAuths = new Array();
	botArmyAuths[0] = 'auth+live+75a63b7517081b8767485180640365232e5facdf';
	botArmyAuths[1] = 'auth+live+95841a4a2e4e19bf3e1c6aece421bd9171c8a381';
	botArmyAuths[2] = 'auth+live+f1311a79b08c972f7490fc8a1ddafd98bc24e9e8';
	botArmyAuths[3] = 'auth+live+cc15bc325bd10d0c847d131dda2db45d2d1a19d0';
  
	return botArmyAuths;
  };

}(typeof exports === 'object' && exports || globalNamespace));

/*
	var AUTH = 'auth+live+53781ac2f01396e4cfe1afb3c564b9fa771bee57';
	var USERID = '4eca8214a3f751459f000b4a';
	var ROOMID = '4e4460f314169c06532bc9c9';
	var LASTFM_KEY = 'add155dd0060865e79105240bc378065';
	var LASTFM_SECRET = '14d6d4dff7f52a65aa46e5d4644990b6';
	var APP_STRING = 'TurntableFM/v0.01 BotFM';
	
	// BOT ARMY INFO
	var num_army_bots = 4;
	var botArmyIDs = new Array();
	botArmyIDs[0] = '4ee521154fe7d0603e001725';
	botArmyIDs[1] = '4ee5230e4fe7d0603e001735';
	botArmyIDs[2] = '4ee524544fe7d0603e00174c';
	botArmyIDs[3] = '4ee53faf4fe7d0603e001867';
	var botArmyAuths = new Array();
	botArmyAuths[0] = 'auth+live+75a63b7517081b8767485180640365232e5facdf';
	botArmyAuths[1] = 'auth+live+95841a4a2e4e19bf3e1c6aece421bd9171c8a381';
	botArmyAuths[2] = 'auth+live+f1311a79b08c972f7490fc8a1ddafd98bc24e9e8';
	botArmyAuths[3] = 'auth+live+cc15bc325bd10d0c847d131dda2db45d2d1a19d0';
*/