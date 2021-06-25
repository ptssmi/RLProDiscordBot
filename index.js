const Discord = require("discord.js");
const { google } = require("googleapis");
require("dotenv").config();

const client0 = new Discord.Client();

const TOKEN = process.env.TOKEN;
const spreadsheetId = process.env.spreadsheetId;

const auth = new google.auth.GoogleAuth({
keyFile: "credentials.json",
scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// Create client instance for auth
const client1 = auth.getClient();

// Instance of Google Sheets API
const googleSheets = google.sheets({ version: "v4", auth: client1 });


// Get metadata about spreadsheet
const metaData =  googleSheets.spreadsheets.get({
auth,
spreadsheetId,
});

var sheetdata;

// Read rows from spreadsheet
googleSheets.spreadsheets.values.get({
auth,
spreadsheetId,
range: "Sheet1!A:F",
}).then(async getRows=>{
    //Gets the very first row and column of the spreadsheet
    sheetdata = getRows.data.values;
    
});

//Sends out the formatted help menu
function help_menu(){
    let header   = "**List of Commands**"
    let command0 = "```!cam [team] [player] : retrieves the camera settings of the given player```"
    let command1 = "```!sens [team] [player] : retrieves the sensitivity settings of the given player```"
    let command2 = "```!social [team] [player] : retrieves the social media data of the given player```"
    let command3 = "```!teamlist : retrieves all professional teams```"
    let command4 = "```!teamname [team] : retrieves all players on given team```"

    return  `${header}`+`${command0}`+`${command1}`+`${command2}`+`${command3}`+`${command4}`;
}

//Checks to ensure data matches command then sends out to Discord
function retrieve_contents(split_message,sheetdata,message_type){
    for (let i = 0; i < sheetdata.length; i++) {
        if(sheetdata[i][1] != undefined){
            if((split_message[1] == sheetdata[i][0].toLowerCase()) && (split_message[2]== sheetdata[i][1].toLowerCase())){
                switch(message_type){
                    case 0:
                            return "**"+split_message[2]+"'s camera settings:** " + sheetdata[i][2];
                    case 1:
                            return "**"+split_message[2]+"'s sensitivity settings:** " + sheetdata[i][3];
                    case 2:
                            return "**"+split_message[2]+"'s social:** " + sheetdata[i][4];
                }
            }
        }
    }
}

//Gathers all team names and checks against repeats
function retrieve_teams(sheetdata){
    var arr = [];
    for (let i = 6; i < sheetdata.length; i++) {
        if(sheetdata[i][0] != undefined){
            if(sheetdata[i][0] != "Other"){
                if(sheetdata[i-1][0] != sheetdata[i][0]){
                    arr.push(sheetdata[i][0].trim());
                }
            }
        }
    }
    return arr;
}

//Identifies commands
function check_message(message){
    const split_message = message.split(" ");
    switch (split_message[0]) {
      case "!cam":
        var message_type = 0
        return retrieve_contents(split_message,sheetdata,message_type);
      case "!sens":
        var message_type = 1
        return retrieve_contents(split_message,sheetdata,message_type);
      case "!social":
        var message_type = 2
        return retrieve_contents(split_message,sheetdata,message_type);
      case "!teamlist":
        return retrieve_teams(sheetdata);
      case "!help":
        return help_menu();
    }

}

client0.on("message", async message => {
    if (message.author.bot) return; //later refresh name of tagged users
    let response = check_message(message.content.toLowerCase());
    if (response != null){
        message.channel.send(response)
    }
});

client0.on("ready", () => {
    console.log(`Logged in as ${client0.user.tag}!`);
  });
  client0.login(TOKEN);
