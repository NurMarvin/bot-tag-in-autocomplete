const { Plugin } = require('powercord/entities');
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');

module.exports = class BotTagInAutocomplete extends Plugin {
  async startPlugin() {
    const BotTag = await getModuleByDisplayName('BotTag');
    const Flex = await getModuleByDisplayName('Flex');
    const { marginLeft8 } = getModule(['marginLeft8'], false);
    const autocomplete = await getModule(['getAutocompleteOptions']);

    autocomplete.getAutocompleteOptions = (getAutocompleteOptions => (e, t, n, r, a) => {
      const autocompleteOptions = getAutocompleteOptions(e, t, n, r, a);
      const renderResults = autocompleteOptions.MENTIONS.renderResults;

      autocompleteOptions.MENTIONS.renderResults = function (...args) {
        const renderedResults = renderResults(...args);

        if (!renderedResults || renderedResults.length < 2) {
          return;
        }

        const members = renderedResults[1];

        for (const member of members) {
          member.type = class PatchedMemberType extends member.type {
            renderContent(...originalArgs) {
              const rendered = super.renderContent(...originalArgs);

              if (member.props && member.props.user && member.props.user.bot) {
                const { children } = rendered.props;
                const username = React.createElement('div', { className: marginLeft8 }, children[1].props.children);

                const botTag = React.createElement(BotTag, { verified: (member.props.user.publicFlags & 1 << 16) === (1 << 16) });
                const botTagWrapper = React.createElement('div', null, botTag);

                const botTagFlex = React.createElement(Flex.prototype.constructor.Child, {
                  className: marginLeft8
                }, botTagWrapper)

                children.splice(1, 1, username);
                children.splice(2, 0, botTagFlex)
              }

              return rendered;
            }
          }
        }

        return renderedResults;
      }

      return autocompleteOptions;
    })(autocomplete.__getAutocompleteOptions = autocomplete.getAutocompleteOptions);
  }
}
