const Discord = require('discord.js');
const client = new Discord.Client();
const github = require('github-api');
const config = require('./../config/config.json');
const mysql = require('mysql');
const utils = require('./lib/utils');

var sql = mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_database
});


client.login(config.discord_token);

client.on('ready', () => {
    console.log('Bot online !');
});

client.on('guildCreate',async (guild) => {
    console.log('Connecting to a new server...');
    try {
        await sql.query('SELECT * FROM guilds WHERE guild_name = ?', [guild.name], async (err, res) => {
            if(err){
                throw err;
            }
            if(res.affectedRows == 0){
                sql.query('INSERT INTO guilds(guild_id, guild_name) VALUES(null, ?)', [guild.name], (err, res) => {
                    if(err){
                        throw err;
                    }
                });
            }
            await sql.query('SELECT id FROM guilds WHERE guild_name = ?', [guild.name], async (err, res) => {
                if(err){
                    throw(err);
                }
                if(res.affectedRows != 1){
                    throw(new Error("Too many rows returned :" + res.affectedRows));
                }
                await sql.query('SELECT * FROM guild_repos WHERE guild_id = ?' + res[0].id, (err, res) => {
                    if(err){
                        throw err;
                    }
                    var currentChannel = utils.getDefaultChannel(guild);
                    currentChannel.send('Your server has no GitHub repository configured ! Please add one using the x command');
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
});