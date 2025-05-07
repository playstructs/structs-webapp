import {ColorUtil} from "../util/ColorUtil";

export class Blockies {

	constructor() {
		this.colorUtil = new ColorUtil();
		this.randseed = new Array(4); // Xorshift: [x, y, z, w] 32 bit values
	}

	seedrand(seed) {
		this.randseed.fill(0);

		for(let i = 0; i < seed.length; i++) {
			this.randseed[i%4] = ((this.randseed[i%4] << 5) - this.randseed[i%4]) + seed.charCodeAt(i);
		}
	}

	rand() {
		// based on Java's String.hashCode(), expanded to 4 32bit values
		const t = this.randseed[0] ^ (this.randseed[0] << 11);

		this.randseed[0] = this.randseed[1];
		this.randseed[1] = this.randseed[2];
		this.randseed[2] = this.randseed[3];
		this.randseed[3] = (this.randseed[3] ^ (this.randseed[3] >> 19) ^ t ^ (t >> 8));

		return (this.randseed[3] >>> 0) / ((1 << 31) >>> 0);
	}

	createColor() {
		//saturation is the whole color spectrum
		const h = Math.floor(this.rand() * 360);
		//saturation goes from 40 to 100, it avoids greyish colors
		const s = ((this.rand() * 60) + 40) + '%';
		//lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
		const l = ((this.rand() + this.rand() + this.rand() + this.rand()) * 25) + '%';

		return 'hsl(' + h + ',' + s + ',' + l + ')';
	}

	createImageData(size) {
		const width = size; // Only support square icons for now
		const height = size;

		const dataWidth = Math.ceil(width / 2);
		const mirrorWidth = width - dataWidth;

		const data = [];
		for(let y = 0; y < height; y++) {
			let row = [];
			for(let x = 0; x < dataWidth; x++) {
				// this makes foreground and background color to have a 43% (1/2.3) probability
				// spot color has 13% chance
				row[x] = Math.floor(this.rand()*2.3);
			}
			const r = row.slice(0, mirrorWidth);
			r.reverse();
			row = row.concat(r);

			for(let i = 0; i < row.length; i++) {
				data.push(row[i]);
			}
		}

		return data;
	}

	buildOpts(opts) {
		const newOpts = {};

		newOpts.seed = opts.seed || Math.floor((Math.random()*Math.pow(10,16))).toString(16);

		this.seedrand(newOpts.seed);

		newOpts.size = opts.size || 8;
		newOpts.scale = opts.scale || 4;
		newOpts.color = opts.color || this.createColor();
		newOpts.bgcolor = opts.bgcolor || this.createColor();
		newOpts.spotcolor = opts.spotcolor || this.createColor();

		return newOpts;
	}

	renderIcon(opts, canvas) {
		opts = this.buildOpts(opts || {});
		const imageData = this.createImageData(opts.size);
		const width = Math.sqrt(imageData.length);

		canvas.width = canvas.height = opts.size * opts.scale;

		const cc = canvas.getContext('2d');
		cc.fillStyle = opts.bgcolor;
		cc.fillRect(0, 0, canvas.width, canvas.height);
		cc.fillStyle = opts.color;

		for(let i = 0; i < imageData.length; i++) {

			// if data is 0, leave the background
			if(imageData[i]) {
				const row = Math.floor(i / width);
				const col = i % width;

				// if data is 2, choose spot color, if 1 choose foreground
				cc.fillStyle = (imageData[i] === 1) ? opts.color : opts.spotcolor;

				cc.fillRect(col * opts.scale, row * opts.scale, opts.scale, opts.scale);
			}
		}

		return canvas;
	}

	createIcon(opts) {
		let canvas = document.createElement('canvas');

		this.renderIcon(opts, canvas);

		return canvas;
	}

	createBlockie(address) {
		return this.createIcon({
			seed: address,
			color: this.colorUtil.getHexColorFromBase36Address(address,0),
			bgcolor: this.colorUtil.getHexColorFromBase36Address(address,1),
			size: 10,
			scale: 8,
			spotcolor: this.colorUtil.getHexColorFromBase36Address(address,2)
		});
	}
}
