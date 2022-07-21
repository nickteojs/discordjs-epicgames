# Discord Bot - Epic Games

This is a discord bot that fetches free games from the Epic Store every week on release. 
It uses Cron to schedule the fetch job, and axios to fetch the list of games from Epic.

The channel that you create for the bot HAS to be named #free-games.

![Epic Games Discord Bot](https://i.imgur.com/uKw9G5F.jpeg)

## Installation

In the project directory, run:
### `npm install`

To run this locally, create a config file with your own discord token, and use `client.login("Your token path")`.

Once complete, use:
### `npm start`

For a hosting, leave `client.login(process.env.token)` as it is and include the token in your hosting platform.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
