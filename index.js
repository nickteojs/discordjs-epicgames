import axios from "axios";
import { Client, Intents, MessageEmbed } from "discord.js";
// import token from './config.js'
import cron from 'cron'

// Games that are CURRENTLY free have discountPrice: 0
// Games that UPCOMING have discountPrice same as originalPrice
// Games that are NO LONGER free have isCodeRedemptionOnly = true
// Release time: 11PM (23:00) every Thursday (GMT + 8) OR 8AM Thursday (PT)
const API_ENDPOINT = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=SG'
const gameList = []
const longMonths = ['Jan', 'Mar', "May", "Jul", "Aug", "Oct", "Dec"]
const restMonths = ['Apr', 'Jun', 'Sep', 'Nov']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getGames = async () => {
    const response = await axios.get(API_ENDPOINT)
    const gamesList = response.data.data.Catalog.searchStore.elements;
    const activeGames = gamesList.filter(game => game.isCodeRedemptionOnly === false && game.price.totalPrice.discountPrice === 0 && game.price.totalPrice.originalPrice !== 0) 
    activeGames.forEach(game => {
        gameList.push(game)
    })
}

const getUrl = game => {
    if (game.offerMappings.length === 0) {
        return game.productSlug
    } else if (game.offerMappings.length) {
        return game.offerMappings[0].pageSlug
    }
}

const calcOverflowDays = (total, days, month) => {
    const overflow = total - days
    const currentMonth = months.findIndex(m => m === month)
    const nextMonth = months[currentMonth + 1]
    return `${overflow} ${nextMonth}`
}

const calcEndDate = (month, dayNumber) => {
    const total = +dayNumber + 7
    if (longMonths.includes(month)) {
        const days = 31
        if (total > days) {
            return calcOverflowDays(total, days, month)
        } else {
            return `${+dayNumber + 7} ${month}`
        }
    } else if (restMonths.includes(month)) {
        const days = 30
        if (total > days) {
            return calcOverflowDays(total, days, month)
        } else {
            return `${+dayNumber + 7} ${month}`
        }
    } else if (month === "Feb") {
        const days = 28
        if (total > days) {
            return calcOverflowDays(total, days, month)
        } else {
            return `${+dayNumber + 7} ${month}`
        }
    } 
}

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    const channels = client.channels.cache.filter(channel => channel.name === 'free-games')
    // const devChannel = client.channels.cache.find(channel => channel.id === "999601814007717928")
    let scheduleFetch = new cron.CronJob('02 15 * * 4', () => {
        const currentDate = Date()
        const [date, time] = currentDate.split("2022")
        const [day, month, dayNumber] = date.split(" ")
        getGames().then(() => {
            gameList.forEach(game => {
                // Destructuring keys from each game object
                const {title, description, keyImages, price} = game
                const originalPrice = price.totalPrice.fmtPrice.originalPrice
                let imageUrl = keyImages[0].url
                // If game thumbnail URL is improperly formatted
                // if (imageUrl.slice(-3) !== "jpg" && imageUrl.slice(-3) !== "png") {
                //     imageUrl = ""
                // }
                const productSlug = getUrl(game)
                const endDate = calcEndDate(month, dayNumber)
                const gameEmbed = new MessageEmbed()
                    .setAuthor({ name: 'Free Game(s) this week'})
                    .setTitle(title)
                    .setURL(`https://store.epicgames.com/en-US/p/${productSlug}`)
                    .setDescription(description)
                    .addFields(
                        { name: 'Valid from', value: `${dayNumber} ${month} to ${endDate}` }, 
                        { name: 'Original Price:', value: originalPrice }
                        )
                    .setImage(imageUrl)
                    channels.forEach(channel => channel.send({ embeds: [gameEmbed]}))
                    // devChannel.send({ embeds: [gameEmbed]})
            })
        }).catch((error) => {
            console.log(error)
            const errorCode = error.response.status
            const errorMessage = error.response.statusText
            channels.forEach(channel => channel.send(`Error Code: ${errorCode}, ${errorMessage}`))
        })
    })
    scheduleFetch.start()
});

// client.login(token.token)
client.login(process.env.token);

















