'use strict';

const BaseComponent = require('./BaseComponent');
const { ComponentTypes } = require('../util/Constants');
const Util = require('../util/Util');

class SelectMenuComponent extends BaseComponent {
  /**
   * @typedef {BaseComponentOptions} SelectMenuComponentOptions
   * @property {string} [customId] A unique string to be sent in the interaction when clicked
   * @property {string} [placeholder] Custom placeholder text to display when nothing is selected
   * @property {number} [minValues] The minimum number of selections required
   * @property {number} [maxValues] The maximum number of selections allowed
   * @property {SelectMenuOption[]} [options] Options for the select menu
   * @property {boolean} [disabled=false] Disables the select menu to prevent interactions
   */

  /**
   * @typedef {Object} SelectMenuOption
   * @property {string} label The text to be displayed on this option
   * @property {string} value The value to be sent for this option
   * @property {?string} description Optional description to show for this option
   * @property {?RawEmoji} emoji Emoji to display for this option
   * @property {boolean} default Render this option as the default selection
   */

  /**
   * @typedef {Object} SelectMenuComponentOptionData
   * @property {string} label The text to be displayed on this option
   * @property {string} value The value to be sent for this option
   * @property {string} [description] Optional description to show for this option
   * @property {EmojiIdentifierResolvable} [emoji] Emoji to display for this option
   * @property {boolean} [default] Render this option as the default selection
   */

  /**
   * @param {SelectMenuComponent|SelectMenuComponentOptions} [data={}] SelectMenuComponent to clone or raw data
   */
  constructor(data = {}) {
    super({ type: 'SELECT_MENU' });

    /**
     * A unique string to be sent in the interaction when clicked
     * @type {?string}
     */
    this.customId = data.custom_id ?? data.customId ?? null;

    /**
     * Custom placeholder text to display when nothing is selected
     * @type {?string}
     */
    this.placeholder = data.placeholder ?? null;

    /**
     * The minimum number of selections required
     * @type {?number}
     */
    this.minValues = data.min_values ?? data.minValues ?? null;

    /**
     * The maximum number of selections allowed
     * @type {?number}
     */
    this.maxValues = data.max_values ?? data.maxValues ?? null;

    /**
     * Options for the select menu
     * @type {SelectMenuOption[]}
     */
    this.options = this.constructor.normalizeOptions(data.options ?? []);

    /**
     * Whether this select menu is currently disabled
     * @type {boolean}
     */
    this.disabled = data.disabled ?? false;
  }

  /**
   * Sets the custom id of this select menu
   * @param {string} customId A unique string to be sent in the interaction when clicked
   * @returns {SelectMenuComponent}
   */
  setCustomId(customId) {
    this.customId = Util.verifyString(customId, RangeError, 'SELECT_MENU_CUSTOM_ID');
    return this;
  }

  /**
   * Sets the interactive status of the select menu
   * @param {boolean} [disabled=true] Whether this select menu should be disabled
   * @returns {SelectMenuComponent}
   */
  setDisabled(disabled = true) {
    this.disabled = disabled;
    return this;
  }

  /**
   * Sets the maximum number of selections allowed for this select menu
   * @param {number} maxValues Number of selections to be allowed
   * @returns {SelectMenuComponent}
   */
  setMaxValues(maxValues) {
    this.maxValues = maxValues;
    return this;
  }

  /**
   * Sets the minimum number of selections required for this select menu
   * <info>This will default the maxValues to the number of options, unless manually set</info>
   * @param {number} minValues Number of selections to be required
   * @returns {SelectMenuComponent}
   */
  setMinValues(minValues) {
    this.minValues = minValues;
    return this;
  }

  /**
   * Sets the placeholder of this select menu
   * @param {string} placeholder Custom placeholder text to display when nothing is selected
   * @returns {SelectMenuComponent}
   */
  setPlaceholder(placeholder) {
    this.placeholder = Util.verifyString(placeholder, RangeError, 'SELECT_MENU_PLACEHOLDER');
    return this;
  }

  /**
   * Adds options to the select menu.
   * @param {...SelectMenuComponentOptionData|SelectMenuComponentOptionData[]} options The options to add
   * @returns {SelectMenuComponent}
   */
  addOptions(...options) {
    this.options.push(...this.constructor.normalizeOptions(options));
    return this;
  }

  /**
   * Sets the options of the select menu.
   * @param {...SelectMenuComponentOptionData|SelectMenuComponentOptionData[]} options The options to set
   * @returns {SelectMenuComponent}
   */
  setOptions(...options) {
    this.spliceOptions(0, this.options.length, options);
    return this;
  }

  /**
   * Removes, replaces, and inserts options in the select menu.
   * @param {number} index The index to start at
   * @param {number} deleteCount The number of options to remove
   * @param {...SelectMenuComponentOptionData|SelectMenuComponentOptionData[]} [options] The replacing option objects
   * @returns {SelectMenuComponent}
   */
  spliceOptions(index, deleteCount, ...options) {
    this.options.splice(index, deleteCount, ...this.constructor.normalizeOptions(...options));
    return this;
  }

  /**
   * Transforms the select menu into a plain object
   * @returns {APIMessageSelectMenu} The raw data of this select menu
   */
  toJSON() {
    return {
      custom_id: this.customId,
      disabled: this.disabled,
      placeholder: this.placeholder,
      min_values: this.minValues,
      max_values: this.maxValues ?? (this.minValues ? this.options.length : undefined),
      options: this.options,
      type: typeof this.type === 'string' ? ComponentTypes[this.type] : this.type,
    };
  }

  /**
   * Normalizes option input and resolves strings and emojis.
   * @param {SelectMenuComponentOptionDat} option The select menu option to normalize
   * @returns {SelectMenuOption}
   */
  static normalizeOption(option) {
    let { label, value, description, emoji } = option;

    label = Util.verifyString(label, RangeError, 'SELECT_OPTION_LABEL');
    value = Util.verifyString(value, RangeError, 'SELECT_OPTION_VALUE');
    emoji = emoji ? Util.resolvePartialEmoji(emoji) : null;
    description = description ? Util.verifyString(description, RangeError, 'SELECT_OPTION_DESCRIPTION', true) : null;

    return { label, value, description, emoji, default: option.default ?? false };
  }

  /**
   * Normalizes option input and resolves strings and emojis.
   * @param {...SelectMenuComponentOptionData|SelectMenuComponentOptionData[]} options The select
   * menu options to normalize
   * @returns {SelectMenuOption[]}
   */
  static normalizeOptions(...options) {
    return options.flat(Infinity).map(option => this.normalizeOption(option));
  }
}

module.exports = SelectMenuComponent;
