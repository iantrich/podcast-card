import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult,
  css,
  CSSResult,
  PropertyValues
} from "lit-element";

import { PodcastCardConfig, HomeAssistant, Podcast } from "./types";
import { fireEvent } from "./fire-event";

@customElement("podcast-card")
class PodcastCard extends LitElement {
  @property() public hass?: HomeAssistant;

  @property() private _config?: PodcastCardConfig;

  @property() private _selectedPlayer?: string;

  public setConfig(config: PodcastCardConfig): void {
    if (!config || !config.entity) {
      throw new Error("Invalid configuration");
    }

    this._config = { show_player: true, ...config };

    this._selectedPlayer = this._config.default_target;
  }

  public getCardSize(): number {
    return 6;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("_config")) {
      return true;
    }

    if (this._config!.show_player) {
      const playerDiv = this.shadowRoot!.querySelector(
        "#player"
      ) as HTMLElement;

      const player = playerDiv.getElementsByTagName(
        this._config!.custom_player
          ? "mini-media-player"
          : "hui-media-player-entity-row"
      )[0] as any;

      player.hass = this.hass;
    }

    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;

    if (oldHass) {
      return (
        oldHass.states[this._config!.entity] !==
        this.hass!.states[this._config!.entity]
      );
    }

    return true;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="warning">
            Entity not available: ${this._config.entity}
          </div>
        </ha-card>
      `;
    }

    const podcasts = stateObj.attributes["podcasts"] as Podcast[];
    const entityIds = Object.keys(this.hass.states).filter(
      eid => eid.substr(0, eid.indexOf(".")) === "media_player"
    );
    this._selectedPlayer = this._selectedPlayer
      ? this._selectedPlayer
      : entityIds
      ? entityIds[0]
      : "";
    const player = this._config.custom_player
      ? this.createThing({
          type: "custom:mini-media-player",
          entity: this._selectedPlayer,
          group: true
        })
      : this.createThing({
          type: "custom:hui-media-player-entity-row",
          entity: this._selectedPlayer
        });

    player.hass = this.hass;

    return html`
      <ha-card .header=${this._config.name ? this._config.name : "Podcasts"}>
        ${this._config.show_player
          ? html`
              <div id="player">
                <paper-menu-button>
                  <paper-icon-button
                    .icon="${this._config.icon || "mdi:speaker-multiple"}"
                    slot="dropdown-trigger"
                  ></paper-icon-button>
                  <paper-listbox slot="dropdown-content">
                    ${entityIds.map(
                      entity =>
                        html`
                          <paper-item
                            @click="${this._valueChanged}"
                            .entity="${entity}"
                            >${entity}</paper-item
                          >
                        `
                    )}
                  </paper-listbox>
                </paper-menu-button>
                ${player}
              </div>
            `
          : html`
              <div>
                <paper-menu-button>
                  <paper-icon-button
                    .icon="${this._config.icon || "mdi:speaker-multiple"}"
                    slot="dropdown-trigger"
                  ></paper-icon-button>
                  <paper-listbox slot="dropdown-content">
                    ${entityIds.map(
                      entity =>
                        html`
                          <paper-item
                            @click="${this._valueChanged}"
                            .entity="${entity}"
                            >${entity}</paper-item
                          >
                        `
                    )}
                  </paper-listbox>
                </paper-menu-button>
                <span
                  >${this._selectedPlayer
                    ? this.hass.states[this._selectedPlayer].attributes
                        .friendly_name
                    : ""}</span
                >
              </div>
            `}

        <ul>
          ${podcasts.map(
            podcast =>
              html`
                <li
                  @click="${this._togglePodcastEpisodes}"
                  .podcast="${podcast.title.replace(/[ )(]/g, "-")}"
                >
                  ${podcast.title}
                </li>
                <ul
                  class="episodes"
                  id="${podcast.title.replace(/[ )(]/g, "-")}"
                >
                  ${podcast.episodes.map(
                    episode =>
                      html`
                        <li @click="${this._playEpisode}" .url="${episode.url}">
                          <ha-icon
                            icon="mdi:play-circle"
                            .url="${episode.url}"
                          ></ha-icon
                          >${episode.title}
                        </li>
                      `
                  )}
                </ul>
              `
          )}
        </ul>
      </ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }

      #player {
        display: flex;
      }

      ul {
        list-style: none;
      }

      li {
        cursor: pointer;
      }

      .episodes {
        display: none;
      }
    `;
  }

  private createThing(cardConfig) {
    const _createError = (error, config) => {
      return _createThing("hui-error-card", {
        type: "error",
        error,
        config
      });
    };

    const _createThing = (tag, config) => {
      const element = window.document.createElement(tag);
      try {
        element.setConfig(config);
      } catch (err) {
        console.error(tag, err);
        return _createError(err.message, config);
      }
      return element;
    };

    if (
      !cardConfig ||
      typeof cardConfig !== "object" ||
      !cardConfig.type ||
      !cardConfig.type.startsWith("custom:")
    )
      return _createError("No type configured", cardConfig);

    const tag = cardConfig.type.substr("custom:".length);

    if (customElements.get(tag)) return _createThing(tag, cardConfig);

    // If element doesn't exist (yet) create an error
    const element = _createError(
      `Custom element doesn't exist: ${cardConfig.type}.`,
      cardConfig
    );
    element.style.display = "None";
    const timer = setTimeout(() => {
      element.style.display = "";
    }, 2000);
    // Remove error if element is defined later
    customElements.whenDefined(cardConfig.type).then(() => {
      clearTimeout(timer);
      fireEvent(this, "ll-rebuild", {}, element);
    });

    return element;
  }

  private _togglePodcastEpisodes(ev: Event): void {
    const target = ev.target as any;
    target.classList.toggle("active");
    const list = this.shadowRoot!.querySelector(
      `#${target.podcast.replace(/[ )(]/g, "-")}`
    ) as HTMLElement;

    if (list) {
      if (list.style.display === "block") {
        list.style.display = "none";
      } else {
        list.style.display = "block";
      }
    }
  }

  private _playEpisode(ev: Event): void {
    const target = ev.target as any;
    this.hass!.callService("media_player", "play_media", {
      entity_id: this._selectedPlayer,
      media_content_id: target.url,
      media_content_type: "audio/mp4"
    });
  }

  private _valueChanged(ev: Event): void {
    const target = ev.target as any;
    this._selectedPlayer = target.entity;
  }
}
