function div10(n: number) { return n/10; }
function div100(n: number) { return n/100; }
function div1000(n: number) { return n/1000; }

function s16(n: number) {
	return (n < 32768 ? n : n - 65536);
}
function s16div10(n: number) { return div10(s16(n)); }
function s16div100(n: number) { return div100(s16(n)); }

function u32(a: number, b: number) {
	return a + 65536 * b;
}
function s32(a: number, b: number) {
	let sum = u32(a, b);
	return (b < 32768 ? sum : sum - 4294967296);
}
function u32div10(a: number, b: number) { return div10(u32(a, b)); }
function u32div100(a: number, b: number) { return div100(u32(a, b)); }
function u32div1000(a: number, b: number) { return div1000(u32(a, b)); }

type SingleOp = (n:number) => number;
type DoubleOp = (a:number, b:number) => number;

interface CommonDefinition {
	m: string; // metric name
	a?: string; // alt
	l?: Record<string, string>; //labels
}

interface SingleItemDefinition extends CommonDefinition {
	i: number;
	op?: SingleOp;
}

interface DoubleItemDefinition extends CommonDefinition {
	i: number[];
	op: DoubleOp;
}

type ItemDefinition = SingleItemDefinition | DoubleItemDefinition;


const DEFS: ItemDefinition[] = [
	{i:0, m:"inverter_out_voltage_volts", op:div10, l:{"phase":"a"}},
	{i:1, m:"inverter_out_voltage_volts", op:div10, l:{"phase":"b"}},
	{i:2, m:"inverter_out_voltage_volts", op:div10, l:{"phase":"c"}},

	{i:3, m:"inverter_out_current_amps", op:s16div10, l:{"phase":"a"}},
	{i:4, m:"inverter_out_current_amps", op:s16div10, l:{"phase":"b"}},
	{i:5, m:"inverter_out_current_amps", op:s16div10, l:{"phase":"c"}},

	{i:6, m:"inverter_out_power_watts", op:s16, l:{"phase":"a"}},
	{i:7, m:"inverter_out_power_watts", op:s16, l:{"phase":"b"}},
	{i:8, m:"inverter_out_power_watts", op:s16, l:{"phase":"c"}},
	{i:9, m:"inverter_out_power_watts", a:"yield", op:s16, l:{"phase":"sum"}},  // vystup ze stridace do domu (nebo domu+ulice?): kdyz nabijime, tak strecha-baterie; kdyz vybijime, tak strecha+baterie

	// co dodava strecha
	{i:10, m:"pv_voltage_volts", op:div10, l:{"panel":"a"}},
	{i:11, m:"pv_voltage_volts", op:div10, l:{"panel":"b"}},
	{i:12, m:"pv_current_amps", op:div10, l:{"panel":"a"}},
	{i:13, m:"pv_current_amps", op:div10, l:{"panel":"b"}},
	{i:14, m:"pv_power_watts", l:{"panel":"a"}},
	{i:15, m:"pv_power_watts", l:{"panel":"b"}},

	{i:16, m:"inverter_out_frequency_hz", op:div100, l:{"phase":"a"}},
	{i:17, m:"inverter_out_frequency_hz", op:div100, l:{"phase":"b"}},
	{i:18, m:"inverter_out_frequency_hz", op:div100, l:{"phase":"c"}},

	/**
		{0: "Waiting", 1: "Checking",
		2: "Normal", 3: "Off", 4: "Permanent Fault",
		5: "Updating", 6: "EPS Check", 7: "EPS Mode",
		8: "Self Test", 9: "Idle", 10: "Standby"}
		*/
	{i:19, m:"run_mode"},

	// eps - same nuly
	{i:23, m:"eps_voltage_volts", op:div10, l:{"phase":"a"}},
	{i:24, m:"eps_voltage_volts", op:div10, l:{"phase":"b"}},
	{i:25, m:"eps_voltage_volts", op:div10, l:{"phase":"c"}},
	{i:26, m:"eps_current_amps", op:s16div10, l:{"phase":"a"}},
	{i:27, m:"eps_current_amps", op:s16div10, l:{"phase":"b"}},
	{i:28, m:"eps_current_amps", op:s16div10, l:{"phase":"c"}},
	{i:29, m:"eps_power_watts", op:s16, l:{"phase":"a"}},
	{i:30, m:"eps_power_watts", op:s16, l:{"phase":"b"}},
	{i:31, m:"eps_power_watts", op:s16, l:{"phase":"c"}},

	{i:[34,35], m:"grid_out_power_watts", op:s32, a:"feedin power"},  // vystup do gridu, watty. minus=spotreba, plus=prebytek/

	{i:39, m:"battery_voltage_volts", op:div100},
	{i:40, m:"battery_current_amps", op:s16div100},
	{i:41, m:"battery_power_watts", op:s16},  // baterie, watt (kladne = nabijime, zaporne = pouzivame)

	{i:47, m:"household_consumption_power_watts", op:s16}, // spotreba domu, tj. elektrina ze stridace + ze site. soucet GridNPower, watt

	{i:54, m:"radiator_temperature_celsius", op:s16},

	{i:[68,69], m:"inverter_out_energy_kwh_total", op:u32div10, a:"total yield"}, // energie na vystupu ze stridace (mix strecha+baterie)
	{i:70, m:"inverter_out_energy_kwh_today", op:div10, a:"daily yield"},

	{i:[74, 75], m:"battery_discharge_energy_kwh_total", op:u32div10},
	{i:[76, 77], m:"battery_charge_energy_kwh_total", op:u32div10},
	{i:78, m:"battery_discharge_energy_kwh_today", op:div10},
	{i:79, m:"battery_charge_energy_kwh_today", op:div10},

	{i:[80,81], m:"pv_energy_kwh_total", op:u32div10, a:"pv energy total"},
	{i:82, m:"pv_energy_kwh_today", op:div10},

	{i:[86,87], m:"grid_out_energy_kwh_total", op:u32div100, a:"feedin total energy"},
	{i:[88,89], m:"grid_in_energy_kwh_total", op:u32div100, a:"consumption total"},

	{i:[90,91], m:"grid_out_energy_kwh_today", op:u32div100, a:"feedin today energy"},
	{i:[92,93], m:"grid_in_energy_kwh_today", op:u32div100, a:"consumption today"},

	{i:103, m:"battery_capacity_percent"}, // procenta 0..100
	{i:105, m:"battery_temperature_celsius", op:s16},
	{i:106, m:"battery_remaining_energy", op:div10},

	{i:[127,128], m:"battery_combined_energy_kwh_total", op:u32div1000, a:"battery in + out"},

	/**
		0: "Self Use Mode",
		1: "Force Time Use",
		2: "Back Up Mode",
		3: "Feed-in Priority"
	 */
	{i:168, m:"battery_mode"},

	{i:[169,170], m:"battery_voltage_2_volts", op:u32div100},

	{i:42, m:"debug", l:{index:"42"}},
	{i:43, m:"debug", op:s16, l:{index:"43"}},
	{i:44, m:"debug", op:s16, l:{index:"44"}},
	{i:50, m:"debug", l:{index:"50"}},
	{i:110, m:"debug", l:{index:"110"}},
	{i:111, m:"debug", l:{index:"111"}},
	{i:125, m:"debug", l:{index:"125"}},
	{i:126, m:"debug", l:{index:"126"}},
	{i:164, m:"debug", l:{index:"164"}},
	{i:165, m:"debug", l:{index:"165"}}
];

function fullMetricName(metric: Metric) {
	if (metric.labels) {
		let pairs = Object.entries(metric.labels).map(([key, value]) => `${key}="${value}"`);
		return `${metric.name}{${pairs.join(",")}}`;
	} else {
		return metric.name;
	}
}

export function parseUnused(data: number[]) {
	function isUsed(i: number) {
		return DEFS.some(def => {
			if (def.i instanceof Array) {
				return def.i.includes(i);
			} else {
				return def.i == i;
			}
		})
	}

	let result = new Map<number, number>();

	for (let i=0;i<data.length;i++) {
		if (isUsed(i)) { continue; }

		let value = data[i];
		if (value == 0) { continue; }
		result.set(i, value);
	}

	return result;
}


interface Metric {
	name: string;
	labels?: Record<string, string>;
	help?: string;
	value: number;
}

function CMP(a: Metric, b: Metric) { return a.name.localeCompare(b.name); }

function generateMetric(def: ItemDefinition, data: number[], prefix=""): Metric {
	let value;
	if (typeof(def.i) == "number") {
		value = data[def.i];
		if (def.op) { value = (def.op as SingleOp)(value); }
	} else {
		value = (def.op as DoubleOp)(data[def.i[0]], data[def.i[1]]);
	}

	return { name: `${prefix}${def.m}`, value, labels: def.l, help: def.a };
}

export function generateMetrics(data: number[], prefix=""): Metric[] {
	return DEFS.map(def => generateMetric(def, data, prefix));
}

export async function fetch(ip: string, serial: string) {
	let r = await globalThis.fetch(`http://${ip}`, {method:"POST", body:`optType=ReadRealTimeData&pwd=${serial}`});
	let str = await r.text();
	return JSON.parse(str).Data as number[];
}

export function metricsToJSON(metrics: Metric[]) {
	let result: Record<string, number> = {};

	metrics.toSorted(CMP).forEach(metric => {
		result[fullMetricName(metric)] = metric.value;
	});
	return result;
}

export function metricsToPrometheus(metrics: Metric[]) {
	let lines: string[] = [];
	let namesSeen = new Set<string>();

	metrics.toSorted(CMP).forEach(metric => {
		const { name } = metric;

		if (!namesSeen.has(name)) {
			if (namesSeen.size > 0) { lines.push(""); }
			let type = (name.endsWith("_total") ? "counter" : "gauge");
			lines.push(`# HELP ${name} ${metric.help || ""}`, `# TYPE ${name} ${type}`);
			namesSeen.add(name);
		}
		lines.push(`${fullMetricName(metric)} ${metric.value}`);
	});

	return lines.join("\n");
}

/*
export function parseLegacy(Data: number[]) {
	return {
		// tri faze v dome
		GridAVoltage: Data[0] / 10,
		GridBVoltage: Data[1] / 10,
		GridCVoltage: Data[2] / 10,
		GridACurrent: read16BitSigned(Data[3]) / 10,
		GridBCurrent: read16BitSigned(Data[4]) / 10,
		GridCCurrent: read16BitSigned(Data[5]) / 10,
		GridAPower: read16BitSigned(Data[6]),
		GridBPower: read16BitSigned(Data[7]),
		GridCPower: read16BitSigned(Data[8]),

		// vystup ze stridace do domu (nebo domu+ulice?): kdyz nabijime, tak strecha-baterie; kdyz vybijime, tak strecha+baterie
		inverter_out_power_watts: read16BitSigned(Data[9]),

		// co dodava strecha
		Vdc1: Data[10] / 10,
		Vdc2: Data[11] / 10,
		Idc1: Data[12] / 10,
		Idc2: Data[13] / 10,
		PowerDc1: Data[14],
		PowerDc2: Data[15],

		// frekvence ze site
		FreqacA: Data[16] / 100,
		FreqacB: Data[17] / 100,
		FreqacC: Data[18] / 100,

		RunMode: Data[19],

		// nezajimave, same nuly
		EPSAVoltage: Data[23] / 10,
		EPSBVoltage: Data[24] / 10,
		EPSCVoltage: Data[25] / 10,
		EPSACurrent: read16BitSigned(Data[26]) / 10,
		EPSBCurrent: read16BitSigned(Data[27]) / 10,
		EPSCCurrent: read16BitSigned(Data[28]) / 10,
		EPSAPower: read16BitSigned(Data[29]),
		EPSBPower: read16BitSigned(Data[30]),
		EPSCPower: read16BitSigned(Data[31]),


		// vstup z gridu, watty. minus=spotreba, plus=prebytek/pretok. feedin = grid export
		// v pythonu "grid power"
		grid_out_power_watts: read32BitSigned(Data[34], Data[35]),

		// spotreba domu, tj. elektrina ze stridace + ze site. soucet GridNPower, watt
		household_consumption_power_watts: read16BitSigned(Data[47]),

		radiator_temperature_celsius: read16BitSigned(Data[54]),

		// energie na vystupu ze stridace (mix strecha+baterie)
		inverter_out_energy_kwh_total: read32BitUnsigned(Data[68], Data[69]) / 10,
		inverter_out_energy_kwh_today: Data[70] / 10,

		// "pv energy total", kwhs; asi podobne yield_total?
		DcEnergy_Total: read32BitUnsigned(Data[80], Data[81]) / 10,

		// "total feed-in energy", kwh
		grid_out_energy_kwh_total: read32BitUnsigned(Data[86], Data[87]) / 100,
		grid_out_energy_kwh_today: read32BitUnsigned(Data[90], Data[91]) / 100,

		// importovano z gridu
		grid_in_energy_kwh_total: read32BitUnsigned(Data[88], Data[89]) / 100,
		grid_in_energy_kwh_today: read32BitUnsigned(Data[92], Data[93]) / 100,

		// procenta 0..100
		battery_capacity_percent: Data[103],

		BatteryVoltage1: read32BitUnsigned(Data[169], Data[170]) / 100,
		BatteryVoltage2: Data[39] / 100,
		BatteryCurrent2: read16BitSigned(Data[40]) / 100,
		battery_temperature_celsius: read16BitSigned(Data[105]),
		// baterie, watt (kladne = nabijime, zaporne = pouzivame)
		battery_power_watts: read16BitSigned(Data[41]),

		battery_discharge_energy_kwh_total: read32BitUnsigned(Data[74], Data[75]) / 10,
		battery_discharge_energy_kwh_today: Data[78] / 10,
		battery_charge_energy_kwh_total: read32BitUnsigned(Data[76], Data[77]) / 10,
		battery_charge_energy_kwh_today: Data[79] / 10,
	}
}
*/


/*

42	Battery Voltage div10? / nejake napeti div10
43	Battery Current div10?
44	Battery Power? s16
45	BMS Status?

?? total energy resets
?? exported power
?? eps frequency

?? total feedin resets
?? total consumption resets
?? total pv energy resets
?? eps total energy
?? eps total energy resets

?? pv energy today

?? battery charge resets
?? battery discharge resets

*/


