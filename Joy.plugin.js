//META{"name":"Joy","authorId":"192251117948633088","displayName":"Joy","donate":"https://www.paypal.me/Proddy3","website":"https://github.com/Hampo/BetterDiscordPlugins","source":"https://raw.githubusercontent.com/Hampo/BetterDiscordPlugins/main/Joy.plugin.js"}*//
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

var Joy = (() => {
	const config = {"info":{"name":"Joy","authors":[{"name":"Proddy","discord_id":"192251117948633088","github_username":"Hampo","twitter_username":"proddy"}],"version":"0.1.0","description":"Makes \":')\" the joy emoji again.","github":"https://github.com/Hampo/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/Hampo/BetterDiscordPlugins/main/Joy.plugin.js"},"changelog":[{"title":"0.1.0","items":["Initial release"]}],"main":"index.js"};

	return !global.ZeresPluginLibrary ? class {
		constructor() {this._config = config;}
		getName() {return config.info.name;}
		getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
		getDescription() {return config.info.description;}
		getVersion() {return config.info.version;}
		load() {
			const title = "Library Missing";
			const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
			const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
			const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
			if (!ModalStack || !ConfirmationModal || !TextElement) return BdApi.alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
			ModalStack.push(function(props) {
				return BdApi.React.createElement(ConfirmationModal, Object.assign({
					header: title,
					children: [BdApi.React.createElement(TextElement, {color: TextElement.Colors.PRIMARY, children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]})],
					red: false,
					confirmText: "Download Now",
					cancelText: "Cancel",
					onConfirm: () => {
						require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
							if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
							await new Promise(r => require("fs").writeFile(require("path").join(ContentManager.pluginsFolder, "0PluginLibrary.plugin.js"), body, r));
						});
					}
				}, props));
			});
		}
		start() {}
		stop() {}
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Library) => {

	const { Logger, DiscordModules, Patcher, Settings } = Library;

	return class Joy extends Plugin {
		constructor() {
			super();
			
			this.smiling_face_with_tear = "\uD83E\uDD72";
			this.face_with_tears_of_joy = "\uD83D\uDE02";
		}

		onStart() {
			Logger.log("Started");
			
			Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
				let content = a[1].content;
				
				if (content.includes(this.smiling_face_with_tear))
				{
					a[1].content = content.replace(this.smiling_face_with_tear, this.face_with_tears_of_joy);
				}
			});

			this.update();
		}

		onStop() {
			Patcher.unpatchAll();
			Logger.log("Stopped");
		}

		update() {
			this.initialized = true;
		}
	};

};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/