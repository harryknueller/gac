const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Lade gespeicherte Kanäle aus config.json
let syncedChannels = {};
try {
    syncedChannels = JSON.parse(
        fs.readFileSync("config.json", "utf8"),
    ).syncedChannels;
} catch (error) {
    console.error("⚠️ Fehler beim Laden der Kanal-Daten:", error);
}

// Bot ist bereit
client.once("ready", () => {
    console.log(`✅ Bot ist online als ${client.user.tag}`);

    // Status setzen
    client.user.setActivity("Chat-Synchronisation 🌍", { type: "PLAYING" });

    console.log("✅ Status gesetzt!");
});

const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("✅ Bot läuft und ist online!");
});

app.listen(3000, () => {
    console.log("✅ Webserver für UptimeRobot gestartet.");
});

// Slash-Befehle erkennen
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const channelId = interaction.channel.id;

    if (interaction.commandName === "sync") {
        if (interaction.options.getSubcommand() === "add") {
            const guildName = interaction.options.getString("gildenname");

            if (syncedChannels[channelId]) {
                return interaction.reply({
                    content: `⚠️ Dieser Kanal ist bereits registriert!`,
                    ephemeral: true,
                });
            }

            syncedChannels[channelId] = guildName;
            fs.writeFileSync(
                "config.json",
                JSON.stringify({ syncedChannels }, null, 2),
            );

            return interaction.reply({
                content: `✅ Dieser Kanal ist nun registriert mit den Gildennamen **${guildName}** !`,
                ephemeral: true,
            });
        }

        // 🔥 Kanal aus der Synchronisation entfernen (`/sync remove`)
        if (interaction.options.getSubcommand() === "remove") {
            if (!syncedChannels[channelId]) {
                return interaction.reply({
                    content: "⚠️ Dieser Kanal ist nicht registriert!",
                    ephemeral: true,
                });
            }

            delete syncedChannels[channelId];
            fs.writeFileSync(
                "config.json",
                JSON.stringify({ syncedChannels }, null, 2),
            );

            return interaction.reply({
                content: `❌ Dieser Kanal wurde aus der Synchronisation entfernt!`,
                ephemeral: true,
            });
        }

        // 🔥 Gildenname ändern (`/sync rename NeuerName`)
        if (interaction.options.getSubcommand() === "rename") {
            if (!syncedChannels[channelId]) {
                return interaction.reply({
                    content: "⚠️ Dieser Kanal ist nicht registriert!",
                    ephemeral: true,
                });
            }

            const newName = interaction.options.getString("neuername");
            syncedChannels[channelId] = newName;
            fs.writeFileSync(
                "config.json",
                JSON.stringify({ syncedChannels }, null, 2),
            );

            return interaction.reply({
                content: `🔄 Der Gildenname wurde geändert zu **${newName}** !`,
                ephemeral: true,
            });
        }
    }
});

// Nachrichtensynchronisation mit Gildennamen
client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // Eigene Nachrichten ignorieren

    if (Object.keys(syncedChannels).includes(message.channel.id)) {
        const originalGuildName = syncedChannels[message.channel.id]; // KORREKT: Gildenname vom Ursprungs-Kanal!

        for (const channelId of Object.keys(syncedChannels)) {
            if (channelId !== message.channel.id) {
                const channel = await client.channels.fetch(channelId);
                if (channel) {
                    const member = await message.guild.members.fetch(
                        message.author.id,
                    );
                    const username = member.nickname || message.author.username;
                    const avatarURL = message.author.displayAvatarURL({
                        dynamic: true,
                    });
                    const mentionUser = `<@${message.author.id}>`;

                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle(`**${originalGuildName}**`) // KORREKT: Gildenname vom Ursprungs-Kanal!
                        .setDescription(`👤 **${mentionUser}**`) // Benutzername in fett, anklickbar
                        //.setThumbnail(avatarURL)
                        .addFields({
                            name: " ",
                            value: message.content,
                        })
                        .setFooter({ text: ` ` })
                        .setTimestamp();

                    channel.send({ embeds: [embed] });
                }
            }
        }
    }
});

// Bot mit Token starten
client.login(process.env.TOKEN);
