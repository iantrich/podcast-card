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

    return html``;
  }
}