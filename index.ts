import * as solax from "./solax.ts";


const IP = Deno.env.get("INVERTER_IP") || "5.8.8.8";
const SERIAL = Deno.env.get("INVERTER_SERIAL") || "";
const PREFIX = Deno.env.get("METRIC_PREFIX") || "solax_";
const PORT = Deno.env.get("PORT") || "9100";

function createHandler(initialData: number[]) {
	let data = initialData;

	async function update() { data = await solax.fetch(IP, SERIAL); }

	setInterval(update, 30*1000);

	return function(_request: Request) {
		const metrics = solax.generateMetrics(data, PREFIX);
		const str = solax.metricsToPrometheus(metrics);
		return new Response(str);
	}
}

const data = await solax.fetch(IP, SERIAL);

switch (Deno.args[0]) {
	case "show-raw": {
		console.log(JSON.stringify(data));
	} break;

	case "show-unused": {
		console.log(solax.parseUnused(data));
	} break;

	case "show-prom": {
		const metrics = solax.generateMetrics(data, PREFIX);
		const str = solax.metricsToPrometheus(metrics);
		console.log(str);
	} break;

	case "show-json": {
		const metrics = solax.generateMetrics(data, PREFIX);
		console.log(solax.metricsToJSON(metrics));
	} break;

	case "serve-prom": {
		let handler = createHandler(data);
		await Deno.serve({ port: Number(PORT) }, handler);
	} break;

	default: {
		console.log("Unknown task, use one of the following:", ["show-raw", "show-unused", "show-prom", "show-json", "serve-prom"]);
	} break;
}
