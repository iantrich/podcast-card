import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult
} from "lit-element";

import { PodcastCardConfig, HomeAssistant } from "./types";
import { fireEvent } from "./fire-event";

@customElement("podcast-card")
class PodcastCard extends LitElement {
  @property() public hass?: HomeAssistant;

  @property() private _config?: PodcastCardConfig;

  public setConfig(config: PodcastCardConfig): void {
    if (!config || !config.username || !config.password) {
      throw new Error("Invalid configuration");
    }

    this._config = config;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      <ha-card
        .header=${this._config.name ? this._config.name : "Podcasts"}
      ></ha-card>
    `;
  }

  // TODO On firstUpdated, get subscription list: https://gpoddernet.readthedocs.io/en/latest/api/reference/subscriptions.html#get-all-subscriptions
  // TODO Get subscription changes every ~30 minutes: https://gpoddernet.readthedocs.io/en/latest/api/reference/subscriptions.html#get-subscription-changes
  // TODO Search: https://gpoddernet.readthedocs.io/en/latest/api/reference/podcastlists.html
  // TODO Add/Remove subscription: https://gpoddernet.readthedocs.io/en/latest/api/reference/subscriptions.html#upload-subscription-changes
  // TODO Send url to media_player
}