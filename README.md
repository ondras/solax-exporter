# Solax Exporter for Prometheus

Running:

```
deno run -A index.ts serve-prom
```

Configuration via env vars:

- `INVERTER_IP` address of the inverter
- `INVERTER_SERIAL` number used as an access key
- `PORT` to serve metrics at (default `9100`)
- `METRIC_PREFIX` used to prefix metric names (default `solax_`)

Debug:

```
deno run -A index.ts show-raw   # to test the inverter's API
deno run -A index.ts show-json  # to see the parsed values
```
