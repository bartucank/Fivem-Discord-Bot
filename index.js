const axios = require('axios');
const Discord = require('discord.js');
const _ = require('lodash');


try {
  var options = require('./config/config').options;
} catch(error) {
  console.log('config');
}


const client = new Discord.Client();



const getPlayers = async server => {
  try {
    return axios.get(`${server}/players.json`, { responseType: 'json', timeout: 10000 });
  } catch(e) {
    console.log(e);
  }
};



client.on('ready', () => {
  console.log('Hazırım Patron!');
  console.log(` https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=67176464&scope=bot`);
});



client.setInterval(async () => {
  
  
  const servers = [];
  let total = 0;
  for (const server of options.servers) {
    let players = await getPlayers(`${server.url}/players.json`);
    servers.push({
      name: server.name,
      count: players.data.length,
    });
    total =+ players.data.length;
  };
  

 const counts = [];
  for (const value of servers) {
    counts.push(`${value.name}: ${value.count}`);
  }
  counts.push(`Toplam: ${total}  | !nefes & !nefes2`);
  const topic = counts.join(' | ');


  for (const channel of options.topicChannels){
    try {
      client.channels.find('name', channel).setTopic(topic);
    } catch(error){
      console.log(error);
    }
  }
}, options.pollRate * 1000);


client.on('message', message => {

	
if (message.channel.id === 'CHANNEL ID') {
       
   

	if(message.channel.type !== 'text' || message.member === null || !message.content.startsWith('!')) {
		return false;
	}

	let foundRole = false;
	for (const role of options.roles) {
		if (message.member.roles.find("name", role)){
		foundRole = true;
		break;
		}
	}
	if (!foundRole) {
		return false;
	}

	const rawCommand = String(message.content).substr(1).trim().toLowerCase().replace(/ /g,'');
	const server = options.servers.find(k => k.name.toLowerCase().replace(/ /g, '') === rawCommand || k.alias.toLowerCase().replace(/ /g, '') === rawCommand);

	if (server) {
		getPlayers(server.url).then(response => {
		let block = [_.startCase(_.toLower(server.name)) + " (" + response.data.length + "/64)", "---"];
		for (let player of response.data) {
			let playerId = _.padStart(player.id, 2);
			let playerPing = _.padStart(player.ping, 5);
			block.push("[Id: " + playerId + "] " + player.name + " [Ping:"+ playerPing +"]" );
		}
		message.channel.send(block.concat("\n"), {code: true});
		}).catch(error => {
		console.log(error)
		});
	} else {
		return;
	}
	
}
	
});


client.login(options.token);
