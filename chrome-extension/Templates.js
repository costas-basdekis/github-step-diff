"use strict";

class Templates {
	static default(key, value) {
		Templates.defaultCtx[key] = value;
	}
	static register(path, template) {
		Templates.templates[path] = template;
	}
	static render(path, ctx) {
		var fullCtx = Object.assign({}, Templates.defaultCtx, ctx);
		return Templates.templates[path](fullCtx);
	}
}
Templates.defaultCtx = {};
Templates.templates = {};
