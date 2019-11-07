import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult
} from "lit-element";
import {
  HomeAssistant,
  fireEvent,
  LovelaceCardEditor
} from "custom-card-helpers";

import { PodcastCardConfig } from "./types";

@customElement("podcast-card-editor")
export class PodcastCardEditor extends LitElement
  implements LovelaceCardEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: PodcastCardConfig;

  public setConfig(config: PodcastCardConfig): void {
    this._config = config;
  }

  get _name(): string {
    return this._config!.name || "";
  }

  get _entity(): string {
    return this._config!.entity || "";
  }

  get _icon(): string {
    return this._config!.icon || "";
  }

  get _default_target(): string {
    return this._config!.default_target || "";
  }

  get _show_player(): boolean {
    return this._config!.show_player || true;
  }

  get _custom_player(): boolean {
    return this._config!.custom_player || false;
  }

  get _mime_type(): string {
    return this._config!.mime_type || "";
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    const entities = Object.keys(this.hass.states).filter(
      eid => eid.substr(0, eid.indexOf(".")) === "media_player"
    );

    return html`
      <div class="card-config">
        <paper-dropdown-menu
          label="Entity"
          @value-changed=${this._valueChanged}
          .configValue=${"entity"}
        >
          <paper-listbox
            slot="dropdown-content"
            .selected=${entities.indexOf(this._entity)}
          >
            ${entities.map(entity => {
              return html`
                <paper-item>${entity}</paper-item>
              `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>
        <paper-input
          label="Name (Optional)"
          .value=${this._name}
          .configValue=${"name"}
          @value-changed=${this._valueChanged}
        ></paper-input>
        <paper-input
          label="Icon (Optional)"
          .value=${this._icon}
          .configValue=${"icon"}
          @value-changed=${this._valueChanged}
        ></paper-input>
        <paper-dropdown-menu
          label="Default Target"
          @value-changed=${this._valueChanged}
          .configValue=${"default_target"}
        >
          <paper-listbox
            slot="dropdown-content"
            .selected=${entities.indexOf(this._default_target)}
          >
            ${entities.map(entity => {
              return html`
                <paper-item>${entity}</paper-item>
              `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>
        <paper-toggle-button
          ?checked=${this._show_player !== false}
          .configValue=${"show_player"}
          @change=${this._valueChanged}
          >Show Player?</paper-toggle-button
        >
        <paper-toggle-button
          ?checked=${this._custom_player !== false}
          .configValue=${"custom_player"}
          @change=${this._valueChanged}
          >Use mini-media-player?</paper-toggle-button
        >
      </div>
    `;
  }

  private _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]:
            target.checked !== undefined ? target.checked : target.value
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
}
