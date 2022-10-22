import {
  bold,
  CacheType,
  ChatInputCommandInteraction,
  codeBlock,
  CommandInteractionOption,
  SlashCommandBuilder,
} from "discord.js";
import { createEmbed } from "../../utils/functions/createEmbed.js";
import { ClientInterface } from "../../utils/interfaces/ClientInterface.js";
import { CommandInterface } from "../../utils/interfaces/CommandInterface.js";

export class Search implements CommandInterface {
  name = "search";
  category = "games";
  data = new SlashCommandBuilder()
    .setName("search")
    .setDescription("search player stats")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("apex")
        .setDescription("Search for apex legends profile stats")
        .addStringOption((input) =>
          input
            .setName("platform")
            .setDescription("Gaming Platform")
            .setRequired(true)
            .addChoices(
              { name: "Origin", value: "origin" },
              { name: "Xbox Live Gamertag", value: "xbl" },
              { name: "Playstation Network", value: "psn" }
            )
        )
        .addStringOption((input) =>
          input
            .setName("id")
            .setDescription("Origin ID, Xbox Live gamertag, PSN ID")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("csgo")
        .setDescription("Search for csgo profile stats")
        .addStringOption((input) =>
          input
            .setName("id")
            .setDescription(
              "Steam ID, Steam Community URL, Steam Vanity Username"
            )
            .setRequired(true)
        )
    );

  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
    client: ClientInterface
  ) {
    try {
      const commandUsed = interaction.options.getSubcommand(true);

      let selectedOptions: any = {};

      if (commandUsed === "apex") {
        selectedOptions.platform = interaction.options.get("platform", true);
        selectedOptions.id = interaction.options.get("id", true);

        await this.sendApexStats(interaction, client, selectedOptions);
      } else if (commandUsed === "csgo") {
        selectedOptions.id = interaction.options.get("id", true);
        await this.sendCsgoStats(interaction, client, selectedOptions);
      }
    } catch (error) {
      throw error;
    }
  }

  async sendCsgoStats(
    interaction: ChatInputCommandInteraction,
    client: ClientInterface,
    selectedOptions: {
      id: CommandInteractionOption;
    }
  ) {
    const link = this.resolveCsgoStatsLink(selectedOptions.id.value as string);

    const playerData = await this.fetchProfileStats<searchCsgoSearchResponse>(
      link,
      client
    );

    const resolvedData = this.resolveCsgoProfileData(playerData, client)!;

    const embed = createEmbed({
      author: {
        name: `${
          resolvedData.platform.userHandle
        } | ${client.utils.convertToPascalCase(resolvedData.platform.name)}`,
        iconURL: resolvedData.platform.avatarUrl,
      },
      color: "#ebb13a",
      thumbnail: {
        url: "https://cdn.discordapp.com/attachments/1031053322523791390/1033210011050049578/pngwing.com.png",
        height: 128,
      },
      footer: {
        iconURL:
          "https://cdn.discordapp.com/attachments/1031053322523791390/1031116739523657728/TRN-Logo_full-color.png",
        text: "Information Provided by tracker.gg",
      },
      timestamp: true,
    });

    embed.addFields({
      name: "General Information",
      value: bold(
        codeBlock(
          `➥ Steam Id :- ${resolvedData.platform.userId}\n➥ Username :- ${resolvedData.platform.userHandle}`
        )
      ),
    });

    resolvedData.segments.forEach((segement) => {
      const statsArray = segement.stats
        .map((stat) => {
          return `➥ ${stat.name} :- ${stat.value}`;
        })
        .join("\n");

      embed.addFields({
        name: segement.type,
        value: bold(codeBlock(`${statsArray}`)),
      });
    });

    interaction.editReply({
      content: "Here is your data",
      embeds: [embed],
    });
  }

  async sendApexStats(
    interaction: ChatInputCommandInteraction,
    client: ClientInterface,
    selectedOptions: {
      platform: CommandInteractionOption;
      id: CommandInteractionOption;
    }
  ) {
    const link = this.resolveApexStatsLink(
      selectedOptions.platform.value as string,
      selectedOptions.id.value as string
    );

    const playerData = await this.fetchProfileStats<searchApexLegendResponse>(
      link,
      client
    );

    const resolvedData = this.resolveApexPlayerData(playerData, client);

    const embed = createEmbed({
      author: {
        name: `${
          resolvedData.platform.userHandle
        } | ${client.utils.convertToPascalCase(resolvedData.platform.name)}`,
        iconURL: resolvedData.platform.avatarUrl,
      },
      color: "#CD3333",
      thumbnail: {
        url: "https://cdn.discordapp.com/attachments/1031053322523791390/1031091168882212864/logo-apex-legends-4.webp",
      },
      footer: {
        iconURL:
          "https://cdn.discordapp.com/attachments/1031053322523791390/1031116739523657728/TRN-Logo_full-color.png",
        text: "Information Provided by tracker.gg",
      },
      timestamp: true,
    });

    embed.addFields([
      {
        name: "General Information",
        value: bold(
          codeBlock(
            `➥ User Id :- ${resolvedData.userInfo.userId}\n➥ Premium Member :- ${resolvedData.userInfo.isPremium}\n➥ Verified Member :- ${resolvedData.userInfo.isVerified}\n➥ Suspicious Member :- ${resolvedData.userInfo.isSuspicious}`
          )
        ),
      },
      {
        name: "Season & Legend",
        value: bold(
          codeBlock(
            `➥ Current Season :- ${resolvedData.metadata.currentSeason}\n➥ Active Legend :- ${resolvedData.metadata.activeLegendName}\n➥ Active Ban :- ${resolvedData.metadata.isGameBanned}`
          )
        ),
      },
    ]);

    resolvedData.segments.forEach((segment) => {
      const statsArray = segment.stats
        .map((e) => {
          if (e.metadata.rankName) {
            return `➥ ${e.name} :- ${e.value} | ${e.metadata?.rankName}`;
          } else {
            return `➥ ${e.name} :- ${e.value}`;
          }
        })
        .join("\n");

      embed.addFields({
        name: segment.type,
        value: bold(
          codeBlock(`➥ Name :- ${segment.metadata.name}\n${statsArray}`)
        ),
      });
    });

    interaction.editReply({
      content: "Here is your data",
      embeds: [embed],
    });
  }

  resolveCsgoProfileData(
    playerData: searchCsgoSearchResponse,
    client: ClientInterface
  ) {
    let data: CsgoMainData = {
      platform: {
        name: "",
        userId: "",
        userHandle: "",
        avatarUrl: "",
      },
      segments: [],
    };

    data.platform = {
      name: client.utils.convertToPascalCase(
        playerData.data.platformInfo.platformSlug
      ),
      userId: playerData.data.platformInfo.platformUserId,
      userHandle: playerData.data.platformInfo.platformUserHandle,
      avatarUrl: playerData.data.platformInfo.avatarUrl,
    };

    data.segments = playerData.data.segments.map((segment) => {
      let e: CsgoSegments = {
        type: "",
        stats: [],
      };

      e.type = client.utils.convertToPascalCase(segment.type);

      e.stats = Object.entries(segment.stats).map((stat) => {
        return {
          name: stat[1].displayName,
          value: stat[1].displayValue,
        };
      });

      return e;
    });

    return data;
  }

  resolveApexPlayerData(
    playerData: searchApexLegendResponse,
    client: ClientInterface
  ) {
    let data: ApexMainData = {
      platform: {
        name: "",
        userId: "",
        userHandle: "",
        avatarUrl: "",
      },
      userInfo: {
        userId: "",
        isPremium: "",
        isVerified: "",
        customAvatarUrl: "",
        customHeroUrl: "",
        isSuspicious: "",
      },
      metadata: {
        currentSeason: 0,
        activeLegendName: "",
        isGameBanned: "",
      },
      segments: [],
    };

    data.platform = {
      name: client.utils.convertToPascalCase(
        playerData.data.platformInfo.platformSlug
      ),
      userId: playerData.data.platformInfo.platformUserHandle,
      userHandle: playerData.data.platformInfo.platformUserHandle,
      avatarUrl: playerData.data.platformInfo.avatarUrl,
    };

    data.userInfo = {
      userId: playerData.data.userInfo.userId
        ? playerData.data.userInfo.userId
        : "Not Found",
      isPremium: playerData.data.userInfo.isPremium ? "Yes" : "No",
      isVerified: playerData.data.userInfo.isPremium ? "Yes" : "No",
      customAvatarUrl: playerData.data.userInfo.customAvatarUrl
        ? playerData.data.userInfo.customAvatarUrl
        : "Not Found",
      customHeroUrl: playerData.data.userInfo.customHeroUrl
        ? playerData.data.userInfo.customHeroUrl
        : "Not Found",
      isSuspicious: playerData.data.userInfo.isPremium ? "Yes" : "No",
    };

    data.metadata = {
      currentSeason: playerData.data.metadata.currentSeason,
      activeLegendName: playerData.data.metadata.activeLegendName,
      isGameBanned: playerData.data.metadata.isGameBanned ? "Yes" : "No",
    };

    data.segments = playerData.data.segments.map((s) => {
      let e: ApexSegmentsData = {
        type: "",
        metadata: {
          name: "",
          imageUrl: "",
          tallImageUrl: "",
          bgImageUrl: "",
          portraitImageUrl: "",
          legendColor: "",
          isActive: "",
        },
        stats: [],
      };
      e.type = client.utils.convertToPascalCase(s.type);

      e.metadata = {
        name: s.metadata.name,
        imageUrl: s.metadata.imageUrl ? s.metadata.imageUrl : undefined,
        tallImageUrl: s.metadata.tallImageUrl
          ? s.metadata.tallImageUrl
          : "Not Found",
        bgImageUrl: s.metadata.bgImageUrl ? s.metadata.bgImageUrl : "Not Found",
        portraitImageUrl: s.metadata.portraitImageUrl
          ? s.metadata.portraitImageUrl
          : "Not Found",
        legendColor: s.metadata.legendColor
          ? s.metadata.legendColor
          : "Not Found",
        isActive: s.metadata.isActive ? "Yes" : "No",
      };

      e.stats = Object.entries(s.stats).map((stat) => {
        return {
          name: stat[1].displayName,
          value: stat[1].value,
          metadata: {
            rankName: stat[1].metadata ? stat[1].metadata.rankName : undefined,
          },
        };
      });

      return e;
    });

    return data;
  }

  async fetchProfileStats<R>(
    link: string,
    client: ClientInterface
  ): Promise<R> {
    try {
      const response = await client.config.fetch(link, {
        method: "GET",
        headers: {
          "TRN-Api-Key": client.config.trackerggApiKey,
        },
      });

      /**
       * @todo add promise.race with requestTimeout method
       */

      if (response.status >= 400) {
        const { errors } = (await response.json()) as {
          errors: { code: string; message: string }[];
        };

        /**
         * @todo do better error handling
         */
        const error = errors[0];
        if (error.code === "CollectorResultStatus::NotFound") {
          error.message = "Player not found";
        } else if (error.code === "CollectorResultStatus::Private") {
          error.message = error.message;
        }

        throw new Error(error.message);
      }

      const json = (await response.json()) as R;

      return json;
    } catch (error) {
      throw error;
    }
  }

  resolveApexStatsLink(platform: string, id: string) {
    return `https://public-api.tracker.gg/v2/apex/standard/profile/${platform}/${id}`;
  }

  resolveCsgoStatsLink(id: string) {
    return `https://public-api.tracker.gg/v2/csgo/standard/profile/steam/${id}`;
  }
}
