const discord = require('discord.js');
const fs = require('fs');

const bot = new discord.Client();
bot.prefix = 'fork ';
bot.token = JSON.parse(fs.readFileSync('./config.json', 'utf8'))["token"];

const admins = [
    '739032871087374408',
    '458280808482996234'
];

const jobs = [
    {
    	"Name": "bin-man",
    	"Payout": 500,
    	"RequiredLevel": 0
    },
    {
    	"Name": "tesco-cleaner",
    	"Payout": 2000,
    	"RequiredLevel": 5
    }
];

function sleep(msec) {
    return function(cb) {
        setTimeout(cb, msec);
    };
};

var cache = {
	"CashService": {}
};
cache.Collection = [];
cache.Default = {
	"UserID": 0,
	"Level": 0,
    "Bal": 0,
    "Job": "useless",
    "Cooldown": false
};
cache.FindByUserID = function(userid) {
	for (var i = 0; i < cache.Collection.length; i ++) {
	    if (cache.Collection[i].UserID == userid) return i;
	};

	return -1;
};

if (fs.existsSync("./cache.json")) {
	cache.Collection = JSON.parse(fs.readFileSync('./cache.json', 'utf8'));
} else {
	fs.writeFileSync('./cache.json', JSON.stringify(cache.Collection));
};

process.on('exit', () => {
	console.log('\n\x1b[0m\x1b[33mEnded.\x1b[0m');
	fs.writeFileSync('./cache.json', JSON.stringify(cache.Collection));
});

process.on('SIGINT', () => {
	process.exit();
});

process.on('SIGUSR1', () => {
	process.exit();
});

process.on('SIGUSR2', () => {	
	process.exit();
});

process.on('uncaughtException', err => {
	console.log('\x1b[1m\x1b[31mError: ' + err);
});

bot.on('ready', () => {
	bot.user.setActivity(bot.prefix + 'help', {type: 'PLAYING'});	

	console.log('\x1b[0m\x1b[1m\x1b[33mReady.');

	setTimeout(() => {
		while (bot.ws.ping == -1) {};
		console.log('\x1b[0m\x1b[1m\x1b[33mAPI-Latency: \x1b[0m\x1b[1m' + bot.ws.ping + 'ms');
	}, 500);
});

bot.on('message', message => {
	message.content = message.content.toLowerCase();

	if (message.author.id != bot.user.id && !message.author.bot) {
		if (message.content.substring(0, bot.prefix.length) == bot.prefix) {
			var userIndex;

			let result = cache.FindByUserID(message.author.id);
			if (result == -1) {
				cache.Default["UserID"] = message.author.id;
				cache.Collection.push(cache.Default);
			} else {
				userIndex = result;
			};

			if (cache.Collection[userIndex]["Cooldown"]) {
				message.channel.send("```Hold your horses!```");

				return;
			};

			cache.Collection[userIndex]["Cooldown"] = true;
			setTimeout(() => {
				cache.Collection[userIndex]["Cooldown"] = false;
			}, 1000);

		    let args = message.content.substring(bot.prefix.length).split(" ");

		    switch (args[0]) {
			    case 'help': {
			    	message.channel.send(`\`\`\`ComBot Help
Basics {
    com id - Return your user ID.
    com id <ping> - Return the user ID of the pinged user
}
Economy {
    com bal - Return your balance
    com bal <ping> - Return the balance of the pinged user
    com beg - Beg for money
    
    Jobs {
        com job list - List all available jobs with their pay and requirements.
        com job get <job> - Get a job
    }
}
Extra {
    com profile - Show your ComBot profile
    com profile <ping> - Show the pinged user ComBot profile
}\`\`\``);
			    	break;
			    };

			    case 'profile': {
			    	if (message.mentions.users.first()) {
			    		const result = cache.FindByUserID(message.mentions.users.first().id);

			    		if (result == -1) {
			    			message.channel.send('```That user does not have an economy account!```')

			    			break;
			    		};

			    		userIndex = result;
			    	};

			    	message.channel.send(`\`\`\`
ComBot Profile:
User ID: ${message.author.id}

Money:
Wallet: ${cache.Collection[userIndex]["Bal"]}

Other:
Level: ${cache.Collection[userIndex]["Level"]}
Job: ${cache.Collection[userIndex]["Job"]}\`\`\``);

			    	break;
			    };

			    case 'id': {
			    	if (message.mentions.users.first()) {
			    		message.channel.send(`\`\`\`That user's ID: ${message.mentions.users.first().id}\`\`\``);
			    	} else {
			    		message.channel.send(`\`\`\`Your ID: ${message.author.id}\`\`\``);
			    	};

			    	break;
			    };

			    case 'beg': {
			    	const responses = [
			    	    {
			    	    	"Message": "I have no money!",
			    	    	"Give": false
			    	    },
			    	    {
			    	    	"Message": "Take this you poor beggar",
			    	    	"Give": true
			    	    },
			    	    {
			    	    	"Message": "Go away!",
			    	    	"Give": false
			    	    },
			    	    {
			    	    	"Message": "Just take this and go away",
			    	    	"Give": true
			    	    },
			    	];

			    	const responseIndex = Math.floor(Math.random() * responses.length);
			    	var responseAmount = 0;
			    	if (responses[responseIndex]["Give"] == true) {
			    		responseAmount = Math.floor(Math.random() * 100) + 1;
			    	};

			    	message.channel.send(`\`\`\`"${responses[responseIndex]["Message"]}"
You recieve: ${responseAmount}\`\`\``);

			    	cache.Collection[userIndex]["Bal"] += responseAmount;

			    	break;
			    };

			    case 'bal': {
			    	if (message.mentions.users.first()) {
			    		const result = cache.FindByUserID(message.mentions.users.first().id);

			    		if (result == -1) {
			    			message.channel.send('```That user does not have an economy account!```')

			    			break;
			    		};

			    		message.channel.send(`\`\`\`Their balance:
Wallet: ${cache.Collection[result]["Bal"]}\`\`\``);
			    	} else {
			    		message.channel.send(`\`\`\`Your balance:
Wallet: ${cache.Collection[userIndex]["Bal"]}\`\`\``);
			    	};

			    	break;
			    };

			    case "job": {
			    	if (args[1]) {
			    		switch (args[1]) {
			    			case "list": {
			    				let jobsString = "ComBot Jobs\n";
			    				for (var i = 0; i < jobs.length; i ++) {
			    					jobsString += `${jobs[i]["Name"]} - ${jobs[i]["Payout"]} ComCoins an hour (Level ${jobs[i]["RequiredLevel"]}+)\n`;
			    				};

			    				message.channel.send('```' + jobsString + '```');

			    				break;
			    			};

			    			case "get": {
			    				if (args[2]) {
			    					let jobIndex = -1;

			    					for (var i = 0; i < jobs.length; i ++) {
			    						if (jobs[i]["Name"] == args[2]) {
			    							jobIndex = i;

			    							break;
			    						};
			    					};

			    					if (jobIndex != -1) {
			    				        message.channel.send(`\`\`\`Getting job ${args[2]}\`\`\``);

			    				        cache.Collection[userIndex]["Job"] = args[2];

			    				        message.channel.send('```Done```');
			    					};
			    				};

			    				break;
			    			};
			    		};
			    	};

			    	break;
			    };

			    case "admin-control": {
			    	if (admins.includes(message.author.id)) {
			    		if (args[1]) {
			    			switch (args[1]) {
			    				case "shutdown": {
			    					message.channel.send('```Shutting down.. Thank you for using ComBot!```');

			    					process.exit(0);

			    					break;
			    				};

			    				case "restart": {
			    					let exec = require('child_process').exec;

                                    message.channel.send('```Cant restart me lol```');

			    					break;
			    				};

			    				case "reset-economy": {
			    					cache.Collection = [];

			    					message.channel.send('```Economy has been reset.```');

			    					break;
			    				};
			    			};
			    		} else message.channel.send(`\`\`\`ComBot Admin Panel
shutdown - shutdown ComBot
restart - restart ComBot
reset-economy - Reset ComBot economy\`\`\``);
			    	} else message.channel.send('```You are not authorized to make this action.```');

			    	break;
			    };
		    };
	    };
	};
});

bot.login(bot.token);