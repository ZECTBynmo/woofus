(function(){
	var Bot = require('ttapi');							// TT API
	var LastFmNode = require('lastfm').LastFmNode;		// LastFM API
	var tt_auth = require('./AuthInfo.js');				// Our auth info (we do auth externally so the code can go up on git)
	var oscar = require('oscar');						// AIM API
	
	var AUTH = tt_auth.GetAuth();
	var USERID = tt_auth.GetUserID();
	var ROOMID = tt_auth.GetRoomID();
	var LASTFM_KEY = tt_auth.GetLastFMKey();
	var LASTFM_SECRET = tt_auth.GetLastFMSecret();
	var APP_STRING = tt_auth.GetAppString();
	
	// BOT ARMY INFO
	var num_army_bots = 4;								// Update this when adding more bots
	var botArmyIDs = tt_auth.GetBotArmyIDs();
	var botArmyAuths = tt_auth.GetBotArmyAuths();
	
	// LastFM Struct
	var lastfm = new LastFmNode({
	  api_key: LASTFM_KEY,
	  secret: LASTFM_SECRET,
	  useragent: APP_STRING
	});
	
	
	// AIM Struct
	var aim = new oscar.OscarConnection({
	  connection: {
		username: tt_auth.GetScreenName(),
		password: tt_auth.GetAIMPassword()
	  }
	});
	
	
	var current_room = ROOMID;
	var current_avatar = 0;
	
	var always_skip = true;
	var handled_command = false;
	var control_army= true;
	
	var user_to_follow = '4e14a021a3f75102d3013beb';
	var currently_following = false;
	var currently_sending_trooper = false;
	var trooper_sent = 0;
	
	var fuck_dubstep = true;
	
	// Kick this user next time
	var user_to_kick;
	var about_to_kick;
	
	// Log woofus into turntable
	var bot = new Bot(AUTH, USERID, ROOMID);
	
	// Log in woofus' army
	var botArmy = new Array();
	for (botIndex=0;botIndex<num_army_bots;botIndex=botIndex+1) {
		botArmy[botIndex] = new Bot(botArmyAuths[botIndex], botArmyIDs[botIndex], ROOMID);
	}
	
	/*
	// Start up our http server
	if( bot.listen(8080, '127.0.0.1') ) {
		console.log( "holy shit it worked" );
	} else {
		console.log("no dice");
	}
	*/
	
	
	// Connect to AIM
	aim.connect(function(err) {
	  if (err)
		console.log('AIM connection error: ' + err);
	  else {
		console.log('Connected to AIM!');
		// automatically check for offline messages
		aim.getOfflineMsgs();
	  }
	});
	
	
	var myScriptVersion = '0.0.0';

	/*
	// Handle HTTP requests
	bot.on('httpRequest', function (req, res) {
	   var method = req.method;
	   var url    = req.url;
	   switch (url) {
		  case '/version/':
			 if (method == 'GET') {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end("Aw shit, it's working");
			 } else {
				res.writeHead(500);
				res.end();
			 }
			 break;
		  default:
			 res.writeHead(500);
			 res.end();
			 console.log("got '" + url + "' from the interwebs");
			 break;
	   }
	});
	*/
	
	
	// Handle IM's
	aim.on('im', function(text, sender, flags, when) {
		console.log('test.js :: received ' + (when ? 'offline ' : '')
					+ 'IM from ' + sender.name + (when ? ' (on ' + when + ')' : '')
				    + ': ' + text);
		if (when)			// I don't know what this does...
			return;
		
		// If we're responding to a command from woofus, ignore it
		if ( sender.name.indexOf("woofus") != -1 )
			return;
		
		if( text.indexOf("woofus") != -1 ) {
			aim.sendIM(sender.name, 'woofus');
		} else {
			aim.sendIM(sender.name, "That's not a command, but I got it...");
		}
	});
	

	// Someone spoke
	bot.on('speak', function(data) {
		// Make sure it's not woofus or his army before trying to process
	    if( data.userid == USERID ) {
			return;
		} else {
			for( botIndex=0; botIndex<num_army_bots; botIndex=botIndex+1 ) {
				if( data.userid == botArmyIDs[botIndex] ) {
					return;
				}
			}
		}
	
	    // Get the data
	    var name = data.name;
	    var text = data.text;
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		//	Handle Commands
		//////////////////////////////////////////////////////////////////////////////////////////////////////		
		// Skip this song
		if ( text.indexOf("skip this") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSkipping my song\n\n', data); 
			botSpeak( bot, 'I didnt like that one anyway' );
			skipSong( bot );
			handled_command = true;
	    }
		
		// Skip your songs
		if ( text.indexOf("skip your songs") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSkipping all my songs\n\n', data); 
			botSpeak( bot, 'What is my taste not good enough? Fine!' );
			always_skip= true;
			handled_command = true;
	    }
		
		// Play your songs
		if ( text.indexOf("play your songs") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\n Playing all my songs\n\n', data);
			botSpeak( bot, 'Oh so you finally wanna hear some good music?' );
			always_skip= false;
			handled_command = true;
	    }
		
		// Follow this user
		if ( data.userid == user_to_follow && text.indexOf("follow me") != -1 && text.indexOf("woofus") != -1 ) {
			botSpeak( bot, "Where?" );
			console.log('\n Following ' + data.name + '\n', data); 
			currently_following = true;
			handled_command = true;
	    }
		
		// Switch rooms if we're in follow mode
		if( currently_following && !handled_command ) {
			if( data.userid == user_to_follow ) {
				currently_following = false;
				console.log('\nChanging to ' + data.text + '\n', data); 
				changeRooms( bot, data.text);
				current_room = data.text;
			} else {
				console.log('\nThe wrong person said something\n', data); 
			}
		}
		
		// Awesome this song
		if ( text.indexOf("awesome") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone asked me to vote up\n\n', data);
			botSpeak( bot, 'Yeah, this is awesome, good call' );			
			sleep(1000);
			botVote( bot, 'up', true );
			handled_command = true;
	    }
		
		// Downvote this song
		if ( text.indexOf("engage downvote cannon") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nFIRE AWAY\n\n', data);
			botSpeak( bot, 'My ears are bleeding!' );			
			sleep(1000);
			botVote( bot, 'down', true );
			handled_command = true;
	    }
		
		// Hop up
		if ( text.indexOf("hop up") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone asked me to hop up\n\n', data); 
			botSpeak( bot, 'Alright' );	
			bot.addDj();
			handled_command = true;
	    }
		
		// Step up
		if ( text.indexOf("step up") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone asked me to hop up\n\n', data); 
			botSpeak( bot, 'Alright' );	
			bot.addDj();
			handled_command = true;
	    }
		
		// Stop DJing
		if ( text.indexOf("sit down") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone asked me to step down\n\n', data); 
			botSpeak( bot, '/me grumbles' );	
			bot.remDj ();
			handled_command = true;
	    }
		
		// Stop DJing
		if ( text.indexOf("step down") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone asked me to step down\n\n', data); 
			bot.speak('/me grumbles');	
			bot.remDj ();
			handled_command = true;
	    }
		
		// Kick user off after one song
		if ( text.indexOf("kick me off") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nKicking the user next time\n\n', data); 
			user_to_kick = data.userid;
			botSpeak( bot, "will do." );
			handled_command = true;
	    }
		
		// Pass the bong
		if ( text.indexOf("bong") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone asked me about a bong\n\n', data); 
			botSpeak( bot, "I only smoke gravs. Normal bongs are for little girls and bros" );
			handled_command = true;
	    }
		
		// Mottos
		if ( text.indexOf("what") != -1 && text.indexOf("motto") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nMotto time\n\n', data); 
			if ( text.indexOf("420") != -1 ) {
				botSpeak( bot, "It's always within 30 minutes of 4:20 somewhere" );
			} else if ( text.indexOf("dubstep") != -1 ) {
				botSpeak( bot, "Basically, fuck dubstep" );
			} else {
				botSpeak( bot, "I don't have a motto asshole" );
			}			
			
			handled_command = true;
	    }
		
		// Hide troops
		if ( text.indexOf("get rid") != -1 && text.indexOf("troops") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nGetting rid of the troops\n\n', data);
			for( botIndex=0; botIndex<num_army_bots; botIndex=botIndex+1 ) {
				sleep(250);
				botArmy[botIndex].roomDeregister();
			}
			control_army = false;
			handled_command = true;
	    }
		
		// Bring back troops
		if ( text.indexOf("bring") != -1 && text.indexOf("troops") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nBringing the troops back\n\n', data); 
			for( botIndex=0; botIndex<num_army_bots; botIndex=botIndex+1 ) {
				sleep(250);
				botArmy[botIndex].roomRegister(current_room);
			}
			control_army = true;
			handled_command = true;
	    }
		
		// Print ASCII
		if ( text.indexOf("ASCII") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nASCII\n\n', data); 
			botSpeak( bot, 
				"&&&&&&&..........................................................\n&..................................................&......&\n&&&..........&.........&......&&&&&....&....&\n&..............&.........&......&..\n..........&&..\n&..............&........&.......&.............&...&\n&.............&&&&&&.......&&&&&....&....&" );
			control_army = true;
			handled_command = true;
	    }
		
		// Change avatars
		if ( text.indexOf("change avatars") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone dislikes my avatar\n\n', data); 
			botSpeak( bot, "I didn't know this party had a dress code" );	
			
			if( current_avatar < 9 ) {
				current_avatar++;
			} else {
				current_avatar = 0;
			}
			
			bot.setAvatar( current_avatar );
			
			handled_command = true;
	    }
		
		// Change laptop
		if ( text.indexOf("use") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone is telling me to change laptops\n\n', data); 
			botSpeak( bot, "PC > all, just sayin" );	
			
			if( text.indexOf("PC") != -1 || text.indexOf("pc") != -1 ) {
				bot.modifyLaptop( 'pc' );
			} else if( text.indexOf("mac") != -1 ) {
				bot.modifyLaptop( 'mac' );
			} else if( text.indexOf("linux") != -1 ) {
				bot.modifyLaptop( 'linux' );
			} else if( text.indexOf("chrome") != -1 ) {
				bot.modifyLaptop( 'chrome' );
			} else if( text.indexOf("no laptop") != -1 ) {
				bot.modifyLaptop( 0 );
			} else {
				botSpeak( bot, "Also, that's not an OS..." );
			} 
			
			bot.setAvatar( current_avatar );
			
			handled_command = true;
	    }
		
		// Reset yourself
		if ( text.indexOf("reset") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nResetting\n\n', data);

			var reset_troops;
			
			if( text.indexOf("all") != -1 ) {
				reset_troops = true;
			} else {
				reset_troops = false;
			}

			if( text.indexOf("hard") != -1 ) {
				botReset( bot, true, reset_troops );
			} else {
				botReset( bot, false, reset_troops );
			}
			console.log('\nSuccessfully reset and rejoined room\n\n', data);
			botSpeak( bot, 'I wasnt broken, I just dont like you' );	
			
			handled_command = true;
	    }
		
		// Add this song to our playlist
		if ( text.indexOf("add this") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nAdding a song to my playlist\n\n', data);		
			
			bot.roomInfo(true, function(data) {
				var newSong = data.room.metadata.current_song._id;
				var newSongName = songName = data.room.metadata.current_song.metadata.song;
				bot.playlistAdd(newSong);
				botSpeak( bot, 'Yep, added ' + newSongName + ' to my queue' );	
		    });
			
			handled_command = true;
	    }
		
		// Send a trooper to a room and collect songs
		if ( text.indexOf("send a trooper") != -1 && text.indexOf("woofus") != -1 ) {
			botSpeak( bot, "Where should I send him?" );
			console.log('\n Sending trooper after ' + data.name + '\n', data); 
			currently_sending_trooper = true;
			handled_command = true;
		}
		
		// Send a trooper out!
		if( currently_sending_trooper && !handled_command ) {
			if( data.userid == user_to_follow ) {
				currently_sending_trooper = false;
				console.log('\nChanging to ' + data.text + '\n', data); 
				changeRooms( botArmy[trooper_sent], data.text);
				trooper_sent = trooper_sent + 1;
				current_room = data.text;
			} else {
				console.log('\nThe wrong person said something\n', data); 
			}
		}
		
		// Say the genre of the song
		if ( text.indexOf("what genre") != -1 && text.indexOf("woofus") != -1 ) {
			console.log('\nSomeone asked me what the genre is\n\n', data);		
			
			// Get the current room info
			bot.roomInfo(true, function(data) {
				// Get the current song name
				var songName = data.room.metadata.current_song.metadata.song;
				var artist= data.room.metadata.current_song.metadata.artist;
			
				// Ask last.fm what the genre is
				var request = lastfm.request("track.getInfo", {
					track: songName,
					artist: artist,
					handlers: {
						success: function(data) {
							console.log("Success: " + data);
							botSpeak( bot, data.track.toptags.tag[0].name );
						},
						error: function(error) {
							console.log("Error: " + error.message);
							botSpeak( bot, "...no idea you hipster" );
						}
					}
				});
			});
			handled_command = true;
	    }
		
		// Say stuff when someone says woofus
	    if ( !handled_command && text.indexOf("woofus") != -1 ) {
			console.log('\nI heard my name\n\n', data); 
			botSpeak( bot, '/me woofus' );
			sleep(1000);
	    }
		
		// Reset our command handled flag
		handled_command = false;
	});
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//	Handle New Song Events
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	bot.on('newsong', function (data) { 
		console.log( "\nNew song\n" );
		
		// If we are djing and we're in "always skip" mode, and we're not the only dj
		if ( data.room.metadata.current_dj == USERID && always_skip && data.room.metadata.djcount != 1 ) {
			skipSong( bot );
			sleep(1000);
			//botVote( bot, 'up', false );
			console.log('Im skipping all my songs\n\n', data); 
		} // Else we're playing the song
		else {			
			if( about_to_kick ) {
				console.log('Kicked him\n', data); 
				bot.remDj( user_to_kick );
			}
		
			sleep(6000);
			botVote( bot, 'up', true );
			console.log('Voted up\n\n', data); 
			
			if( data.room.metadata.current_dj == user_to_kick ) {
				console.log('\The uerrser is playing a song, about to kick him\n\n', data); 
				about_to_kick = true;
			}
		}
		
		// Ask last.fm what the genre is
		if( fuck_dubstep ) {
			var songName = data.room.metadata.current_song.metadata.song;
			var artist= data.room.metadata.current_song.metadata.artist;
			var genre = "";
		
			var request = lastfm.request("track.getInfo", {
				track: songName,
				artist: artist,
				handlers: {
					success: function(data) {
						console.log("Success: " + data);
						genre = data.track.toptags.tag[0].name;
						filterDubstep( genre );
					},
					error: function(error) {
						console.log("Error: " + error.message);
					}
				}
			});
		}
	});
	
	function changeRooms( targetBot, roomNumber) {
		targetBot.roomDeregister();
		targetBot.roomRegister(roomNumber);
	} // end changeRooms()
	
	// Have targetBot speak your message
	function botSpeak( targetBot, message, use_army ) {
		targetBot.speak( message );
		
		if( control_army && use_army ) {
			for( botIndex=0; botIndex<num_army_bots; botIndex=botIndex+1 ) {
				botSpeak( botArmy[botIndex], message, false );
			}
		}
	}
	
	// Have targetBot reset itself
	function botReset( targetBot, resetHard, use_army ) {
		if( resetHard ) {
			targetBot.roomDeregister();	
			targetBot.roomRegister(current_room); 
			
			trooper_sent = 0;
		}
		
		if( control_army && use_army ) {
			botSpeak( bot, "RESET TROOPS!" );
			for( botIndex=0; botIndex<num_army_bots; botIndex=botIndex+1 ) {
				sleep( 250 );
				botReset( botArmy[botIndex], resetHard, false );
				sleep( 250 );
				botSpeak( botArmy[botIndex], "YES SIR!", false );
			}
		}
	}
	
	// Have targetBot vote
	function botVote( targetBot, voteupdown, use_army ) {
		sleep(500);
		targetBot.vote( voteupdown ); 
		sleep(500);
		if( false && control_army && use_army ) {
			botSpeak( bot, "VOTE TROOPS!" );
			for( botIndex=0; botIndex<num_army_bots; botIndex=botIndex+1 ) {
				sleep(250);
				botArmy[botIndex].vote( voteupdown );
				sleep(250);
				//botSpeak( botArmy[botIndex], "YES SIR!", false );
			}
		}
	}
	
	// Check whether the given genre is dubstep
	function filterDubstep( genre ) {
		console.log( "Checking for dubstep" );
		if( genre.indexOf("dubstep") != -1 ) {
			botSpeak( bot, "DUBSTEP DETECTED, CANNONS CHARGING" );
			sleep(1000);
			botSpeak( bot, "FIRE" );
			botVote( bot, "down" );
		}
	}
	
	// Have targetBot skip the song
	function skipSong( targetBot) {
		targetBot.stopSong();
	}
	
	function sleep(ms) {
	
		var dt = new Date();
		dt.setTime(dt.getTime() + ms);
		while (new Date().getTime() < dt.getTime());
	}

})()
