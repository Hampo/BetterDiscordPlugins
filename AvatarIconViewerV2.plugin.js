//META{"name":"AvatarIconViewerV2","authorId":"192251117948633088","donate":"https://www.paypal.me/Proddy3","website":"https://www.zhbot.org","source":"https://raw.githubusercontent.com/Hampo/BetterDiscordPlugins/main/AvatarIconViewerV2.plugin.js"}*//

module.exports = (() => {
	const config =
	{
		info:
		{
			name: "AvatarIconViewerV2",
			author: "Proddy",
			version: "1",
			description: "A remake of Metalloriff's AvatarIconViewer using BDFDB to resolve the context menu issues. Allows you to view server icons, user avatars and emotes in fullscreen view the context menu, or copy the link to them."
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`//META{"name":"`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {}
		stop() {}
	} : (([Plugin, BDFDB]) => {
		var settings = {};
		
		function openImageModal(url) {
			BDFDB.LibraryModules.ModalUtils.openModal(modalData => {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalRoot, Object.assign({
					className: BDFDB.disCN.imagemodal
				}, modalData, {
					size: BDFDB.LibraryComponents.ModalComponents.ModalSize.DYNAMIC,
					"aria-label": BDFDB.LanguageUtils.LanguageStrings.IMAGE,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ImageModal, {
						animated: false,
						src: url,
						original: url,
						width: 2048,
						height: 2048,
						className: BDFDB.disCN.imagemodalimage,
						shouldAnimate: true,
						renderLinkComponent: props => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, props)
					})
				}), true);
			});
		}
		
		const formatURL = url =>
				url == null || url.length == 0
					? null
					: (url.includes("/a_")
						? url.replace(".webp", ".gif").replace(".png", ".gif")
						: url).split("?")[0] + "?size=2048";
		
		return class AvatarIconViewerV2 extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						avatars:		{value:true, 				description:"Add link to avatars"},
						emojis:		{value:true, 				description:"Add link to emojis"},
						guilds:		{value:true, 				description:"Add link to guilds"}
					}
				};
			}
			
			onStart() {
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
			}
			
			onMessageContextMenu (e) {
				let target = e.instance.props.target;
				if (target && target.src && settings.emojis) {
					let entries = [
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: "View Emoji",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "view-emoji"),
							action: _ => {
								openImageModal(target.src);
							}
						}),
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: "Copy Emoji Link",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-emoji"),
							action: _ => {
								BDFDB.LibraryRequires.electron.clipboard.write({text:target.src});
							}
						})
					];
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: entries
					}));
				}
			}
			
			onUserContextMenu (e) {
				if (e.subType == "useUserProfileItem" && e.instance.props.id && settings.avatars)
				{
					let avatarURL = formatURL(BDFDB.UserUtils.getAvatar(e.instance.props.id));
					let entries = [
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: "View Avatar",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "view-avatar"),
							action: _ => {
								openImageModal(avatarURL);
							}
						}),
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: "Copy Avatar Link",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-avatar"),
							action: _ => {
								BDFDB.LibraryRequires.electron.clipboard.write({text:avatarURL});
							}
						})
					];
					e.returnvalue.push(entries);
				}
			}
			
			onGuildContextMenu (e) {
				let guild = e.instance.props.guild;
				if (guild && settings.guilds) {
					let iconURL = formatURL(guild.getIconURL(2048));
					let entries = [
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: "View Icon",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "view-icon"),
							action: _ => {
								openImageModal(iconURL);
							}
						}),
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: "Copy Icon Link",
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-icon"),
							action: _ => {
								BDFDB.LibraryRequires.electron.clipboard.write({text:iconURL});
							}
						})
					];
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: entries
					}));
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();