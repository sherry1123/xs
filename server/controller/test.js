const model = {
	index(ctx) {
		ctx.body = 'Home Page';
	},
	get(ctx) {
		let param = ctx.param;
		ctx.body = param;
	},
	post(ctx) {
		let param = ctx.param;
		ctx.body = param
	}
}

module.exports = model;