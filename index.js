import axios from "axios";
import moment from "moment";
import UserAgent from "user-agents";
import * as dotenv from "dotenv";
dotenv.config();
import data from "./data.js";

const discord = {
    endpoint: "https://discord.com/api/v9",
    delay: 2 * 60 * 60 * 1000,
    channelId: "1037811694564560966",
};

const delay = async (timeInMs) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeInMs);
    });
};

const aconsole = (text, newLine = false) => {
    newLine
        ? console.log(`[${moment().format("LTS")}] ${text}\n`)
        : console.log(`[${moment().format("LTS")}] ${text}`);
};

const getMe = async (token) => {
    const get = await axios.get(discord.endpoint + "/users/@me", {
        headers: {
            Authorization: token,
            "User-Agent": new UserAgent().toString(),
        },
    });
    return get.data;
};

const sendMessages = async (text, token) => {
    const post = await axios.post(
        discord.endpoint + "/channels/" + discord.channelId + "/messages",
        JSON.stringify({
            content: text,
        }),
        {
            headers: {
                Authorization: token,
                "User-Agent": new UserAgent().toString(),
                "Content-Type": "application/json",
            },
        }
    );
    return post.data.id ? post.data : false;
};

(async () => {
    while (true) {
        for (let [index, { token, address }] of data.entries()) {
            const me = await getMe(token);
            aconsole(
                `[${index + 1}] username ${me.username}#${me.discriminator}`
            );

            const send = await sendMessages(`!faucet ${address}`, token);
            send && send.id
                ? aconsole(`success send message to channel`, true)
                : aconsole(`failed unknown error or rate limits`, true);
            await delay(3000);
        }

        aconsole(`delay for ${discord.delay / 1000} seconds`);
        await delay(discord.delay);
    }
})();
