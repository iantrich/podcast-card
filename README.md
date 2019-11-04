# Podcast Card

🎧 [gPodder](https://gpodder.net/) Podcast Card

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

[![Discord][discord-shield]][discord]
[![Community Forum][forum-shield]][forum]

[![Twitter][twitter]][twitter]
[![Github][github]][github]

This card is for [Lovelace](https://www.home-assistant.io/lovelace) on [Home Assistant](https://www.home-assistant.io/) to display your podcast subscriptions and play them on your media players connected to Home Assistant

## Support

Hey dude! Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/zJtVxUAgH)

This card is for [Lovelace](https://www.home-assistant.io/lovelace) on [Home Assistant](https://www.home-assistant.io/).

![example](example.png)

## Installation

Use [HACS](https://hacs.xyz) or follow this [guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins)

```yaml
resources:
  url: /local/podcast-card.js
  type: module
```

## Options

| Name             | Type      | Requirement  | Description                                                                                                                          |
| ---------------- | --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `type`           | `string`  | **Required** | `custom:podcast-card`                                                                                                                |
| `entity`         | `string`  | **Required** | Podcast sensor entity e.g. [gPodder](https://github.com/custom-components/gpodder)                                                   |
| `name`           | `string`  | **Optional** | Card name `Podcasts`                                                                                                                 |
| `icon`           | `string`  | **Optional** | Target selection icon `mdi:speaker-multiple`                                                                                         |
| `default_target` | `string`  | **Optional** | Default target to select on first load                                                                                               |
| `show_player`    | `boolean` | **Optional** | Show media player controls? `True`                                                                                                   |
| `custom_player`  | `boolean` | **Optional** | Use [mini-media-player](https://github.com/kalkih/mini-media-player)? `False` **Note: Requires installation of `mini-media-player`** |
| `mime_type`      | `string`  | **Optional** | Specify custom mime_type for your player if the passed one is not working                                                            |

### Usage

```yaml
type: "custom:podcast-card"
entity: sensor.gpodder
name: Ian's Podcasts
default_target: media_player.office_home
show_player: True
custom_player: True
```

[Troubleshooting](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins)

[commits-shield]: https://img.shields.io/github/commit-activity/y/iantrich/podcast-card.svg?style=for-the-badge
[commits]: https://github.com/iantrich/podcast-card/commits/master
[discord]: https://discord.gg/Qa5fW2R
[discord-shield]: https://img.shields.io/discord/330944238910963714.svg?style=for-the-badge
[forum-shield]: https://img.shields.io/badge/community-forum-brightgreen.svg?style=for-the-badge
[forum]: https://community.home-assistant.io/t/podcast-card-component-for-gpodder/106758
[license-shield]: https://img.shields.io/github/license/iantrich/podcast-card.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/badge/maintainer-Ian%20Richardson%20%40iantrich-blue.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/iantrich/podcast-card.svg?style=for-the-badge
[releases]: https://github.com/iantrich/podcast-card/releases
[twitter]: https://img.shields.io/twitter/follow/iantrich.svg?style=social
[github]: https://img.shields.io/github/followers/iantrich.svg?style=social
