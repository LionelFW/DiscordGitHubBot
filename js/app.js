const Discord = require('discord.js');
const client = new Discord.Client();
const github = require('github-api');
const config = require('./../config/config.json');
const mysql = require('mysql');
const utils = require('./lib/utils');
const url_regex = new RegExp('(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)');

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
//guildCreate, guild
client.on('guildCreate', async (guild) => {
    console.log('Connecting to a new server...');
    try {
        await sql.query('SELECT * FROM guilds WHERE guild_name = ?', [guild.name], async (err, res, fields) => {
            if(err){
                throw err;
            }
            if(res.length == 0){
                await sql.query('INSERT INTO guilds(guild_id, guild_name) VALUES(?, ?)', [null, guild.name], (err, res, fields) => {
                    if(err){
                        throw err;
                    }
                });
            }
            await sql.query('SELECT guild_id FROM guilds WHERE guild_name = ?', [guild.name], async (err, res, fields) => {
                if(err){
                    throw(err);
                }
                if(res.length!= 1){
                    throw(new Error("Too many rows returned :" + res.length));
                }
                await sql.query('SELECT * FROM guild_repos WHERE guild_id = ?', [res[0].guild_id], async (err, res, fields) => {
                    if(err){
                        throw err;
                    }
                    var currentChannel = await utils.getDefaultChannel(guild);
                    currentChannel.send('Your server has no GitHub repository configured ! Please add one using the x command');
                });
            });
        });
    } catch (error) {
        console.log(error);
    }
});

client.on('message', async (msg) => {
    if(msg.content.startsWith("!gh_addrepo")){
        let parsed_msg = msg.content.split(' ');
        let currentChannel = await utils.getDefaultChannel(msg.guild);
        if(parsed_msg.length != 2){
            currentChannel.send('The !gh_addrepo command should follow this pattern: !gh_addrepo repo_url');
            return;
        }
        if(url_regex.test(parsed_msg[1])){
            currentChannel.send('The parameter for !gh_addrepo should be a valid url to the github repo');
            return;
        }
        let repo_url_parsed = parsed_msg[1].split('/');
        let repo_name = repo_url_parsed[repo_url_parsed.length - 1];
        
        await sql.query('SELECT * FROM repos WHERE repo_name = ?', [repo_name], async (err, res, fields) => {
            if(err){
                throw err;
            }
            if(res.length > 1){
                throw(new Error("Invalid number of rows got : " + res.length))
            }
            if(res.length == 1){
                currentChannel.send('There is already a repo configured for this server');
                return;
            } 
            if(res.length == 0){
                await sql.query('INSERT INTO repos(repo_id, repo_url, repo_name) values(?, ?, ?)', [null, parsed_msg[1], repo_name], async (err, res, fields) => {
                    if(err){
                        throw err;
                    }
                    let insertId = res.insertId;
                    await sql.query('SELECT guild_id FROM guilds WHERE guild_name = ?', [msg.guild.name], (err, res, fields) => {
                        if(err){
                            throw err;
                        }
                        sql.query('INSERT INTO guild_repos(pair_id, guild_id, repo_id) values(?, ?, ?)', [null, res[0].guild_id, insertId], (err, res, fields) => {
                            if(err){
                                throw err;
                            }
                            currentChannel.send('Repo ' + repo_name + ' added for this server');
                        });
                    });
                });
                return;
            }
        });
    }
});