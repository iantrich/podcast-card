import { LitElement, html, customElement, property, TemplateResult, css, CSSResult, PropertyValues } from 'lit-element';
import { HomeAssistant, fireEvent, createThing, LovelaceCard } from 'custom-card-helpers';

import { PodcastCardConfig, Podcast } from './types';
import { CARD_VERSION } from './const';

/* eslint no-console: 0 */
console.info(
  `%c  PODCAST-CARD  \n%c  Version ${CARD_VERSION} `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

@customElement('podcast-card')
export class PodcastCard extends LitElement {
  @property() public hass?: HomeAssistant;
  @property() private _config?: PodcastCardConfig;
  @property() private _selectedPlayer?: string;

  public setConfig(config: PodcastCardConfig): void {
    if (!config || !config.entity) {
      throw new Error('Invalid configuration');
    }

    this._config = { show_player: true, ...config };
    this._selectedPlayer = this._config.default_target;
  }

  public getCardSize(): number {
    return 6;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has('_config')) {
      return true;
    }

    if (this._config && this.shadowRoot && this.hass) {
      if (this._config.show_player) {
        const playerDiv = this.shadowRoot.querySelector('#player') as HTMLElement;

        const player = playerDiv.getElementsByTagName(
          this._config.custom_player ? 'mini-media-player' : 'hui-media-player-entity-row',
        )[0] as LovelaceCard;

        player.hass = this.hass;
      }

      const oldHass = changedProps.get('hass') as HomeAssistant | undefined;

      if (oldHass) {
        return oldHass.states[this._config.entity] !== this.hass.states[this._config.entity];
      }
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

    const podcasts = stateObj.attributes['podcasts'] as Podcast[];
    const entityIds = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'media_player');
    this._selectedPlayer = this._selectedPlayer ? this._selectedPlayer : entityIds ? entityIds[0] : '';
    const player = this._config.custom_player
      ? createThing({
          type: 'custom:mini-media-player',
          entity: this._selectedPlayer,
          group: true,
        })
      : createThing({
          type: 'custom:hui-media-player-entity-row',
          entity: this._selectedPlayer,
        });

    player.hass = this.hass;

    return html`
      <ha-card>
        <div class="header">
          <paper-menu-button>
            <paper-icon-button .icon="${this._config.icon || 'mdi:speaker-multiple'}" slot="dropdown-trigger"
              >${this.hass.states[this._selectedPlayer].attributes.friendly_name}</paper-icon-button
            >
            <paper-listbox slot="dropdown-content">
              ${entityIds.map(entity =>
                this.hass
                  ? html`
                      <paper-item @click="${this._valueChanged}" .entity="${entity}"
                        >${this.hass.states[entity].attributes.friendly_name}</paper-item
                      >
                    `
                  : '',
              )}
            </paper-listbox>
          </paper-menu-button>
          <div @click="${this._moreInfo}" class="title">
            ${this._config.name || 'Podcasts'}
          </div>
        </div>
        <div id="player">
          ${this._config.show_player
            ? html`
                ${player}
              `
            : ''}
        </div>
        ${podcasts.map(
          (podcast, index) =>
            html`
              <div class="divider"></div>
              <paper-item @click=${this._togglePodcastEpisodes} .podcast=${index}>
                ${podcast.title}
              </paper-item>
              <div class="episodes" id="podcast${index}">
                ${podcast.episodes.map(
                  episode =>
                    html`
                      <paper-item @click="${this._playEpisode}" .url="${episode.url}" .mime_type="${episode.mime_type}">
                        <div .url="${episode.url}" .mime_type="${episode.mime_type}">
                          ${episode.title}
                        </div>
                      </paper-item>
                    `,
                )}
              </div>
            `,
        )}
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

      .header {
        /* start paper-font-headline style */
        font-family: 'Roboto', 'Noto', sans-serif;
        -webkit-font-smoothing: antialiased; /* OS X subpixel AA bleed bug */
        text-rendering: optimizeLegibility;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: -0.012em;
        /* end paper-font-headline style */

        line-height: 40px;
        padding: 8px;
        cursor: pointer;
        display: flex;
      }

      .title {
        padding-top: 8px;
      }

      #player {
        padding-left: 16px;
        padding-right: 16px;
      }

      paper-item {
        cursor: pointer;
        --paper-item-min-height: 32px;
      }

      paper-item > div {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--secondary-text-color);
        font-size: 10px;
      }

      .episodes {
        display: none;
      }

      .episodes > paper-item {
        padding-left: 24px;
        --paper-item-min-height: 24px;
      }

      ha-icon {
        padding-right: 16px;
      }

      paper-icon-button {
        color: var(--primary-color);
      }
    `;
  }

  private _moreInfo(): void {
    if (this._config) {
      fireEvent(this, 'hass-more-info', {
        entityId: this._config.entity,
      });
    }
  }

  private _togglePodcastEpisodes(ev: Event): void {
    if (this.shadowRoot) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const target = ev.target as any;
      target.classList.toggle('active');
      const list = this.shadowRoot.querySelector(`#podcast${target.podcast}`) as HTMLElement;

      if (list) {
        if (list.style.display === 'block') {
          list.style.display = 'none';
        } else {
          list.style.display = 'block';
        }
      }
    }
  }

  private _playEpisode(ev: Event): void {
    if (this.hass && this._config) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const target = ev.target as any;
      this.hass.callService('media_player', 'play_media', {
        entity_id: this._selectedPlayer,
        media_content_id: target.url,
        media_content_type: this._config.mime_type ? this._config.mime_type : target.mime_type,
      });
    }
  }

  private _valueChanged(ev: Event): void {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const target = ev.target as any;
    this._selectedPlayer = target.entity;
  }
}
