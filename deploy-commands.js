const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
    new SlashCommandBuilder()
        .setName("sync")
        .setDescription("Verwalte synchronisierte Kanäle")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription(
                    "Registriert diesen Kanal mit einem Gildennamen",
                )
                .addStringOption((option) =>
                    option
                        .setName("gildenname")
                        .setDescription("Der Name der Gilde")
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription(
                    "Entfernt diesen Kanal aus der Synchronisation",
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("rename")
                .setDescription("Ändert deinen Gildennamen")
                .addStringOption((option) =>
                    option
                        .setName("neuername")
                        .setDescription("Der neue Gildenname")
                        .setRequired(true),
                ),
        ),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("📢 Slash-Befehle werden registriert...");
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: commands,
        });
        console.log("✅ Slash-Befehle erfolgreich registriert!");
    } catch (error) {
        console.error("❌ Fehler beim Registrieren der Befehle:", error);
    }
})();
