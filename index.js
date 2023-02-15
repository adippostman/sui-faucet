import fetch from "node-fetch";
import moment from "moment";
import UserAgent from "user-agents";
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
    const get = await fetch(discord.endpoint + "/users/@me", {
        headers: {
            Authorization: token,
            "User-Agent": new UserAgent().toString(),
        },
    });
    return await get.json();
};

const sendMessages = async (text, token) => {
    const post = await fetch(
        discord.endpoint + "/channels/" + discord.channelId + "/messages",
        {
            method: "post",
            body: JSON.stringify({
                content: text,
            }),
            headers: {
                Authorization: token,
                "User-Agent": new UserAgent().toString(),
                "Content-Type": "application/json",
            },
        }
    );
    return await post.json();
};

(async () => {
    while (true) {
        for (let { no, token, address } of data) {
            const me = await getMe(token);
            while (true) {
                aconsole(`(${no}) username ${me.username}#${me.discriminator}`);
                const send = await sendMessages(`!faucet ${address}`, token);
                console.log(send);

                if (send.id) {
                    break;
                } else {
                    await delay(5000);
                }
            }
        }
        console.log("");
        aconsole(`delay for ${discord.delay / 1000} seconds`);
        await delay(discord.delay);
    }
})();
