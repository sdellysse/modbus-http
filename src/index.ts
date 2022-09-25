import Modbus from "modbus-serial";
import Mqtt from "async-mqtt";
import CRC32 from "crc-32";
import { log, queryModbus, runForever, uniqueStrings } from "./utils";

const servers = <const>[48, 49, 50, 51];
const homeAssistantConfigs = <const>{
  amperage: {
    device_class: "current",
    name: "Amperage",
    state_class: "measurement",
    unit_of_measurement: "A",
  },
  cycleNumber: {
    entity_category: "diagnostic",
    name: "Cycle Number",
    state_class: "measurement",
  },
  energy: {
    device_class: "battery",
    name: "Energy",
    state_class: "measurement",
    unit_of_measurement: "%",
  },
  energy_capacity: {
    device_class: "energy",
    name: "Energy Capacity",
    state_class: "measurement",
    unit_of_measurement: "Wh",
  },
  energy_remaining: {
    device_class: "energy",
    name: "Energy Remaining",
    state_class: "measurement",
    unit_of_measurement: "Wh",
  },
  power: {
    device_class: "power",
    name: "Power",
    state_class: "measurement",
    unit_of_measurement: "W",
  },
  time_to_empty: {
    device_class: "duration",
    name: "Time To Empty",
    unit_of_measurement: "h",
  },
  time_to_full: {
    device_class: "duration",
    name: "Time To Full",
    unit_of_measurement: "h",
  },
  voltage: {
    device_class: "voltage",
    name: "Voltage",
    state_class: "measurement",
    unit_of_measurement: "V",
  },
};

const queryServer = async (modbusConn: Modbus, server: number) => {
  log.info(`querying server ${server}`);

  return <const>{
    ...(await queryModbus(
      modbusConn,
      server,
      5000,
      5034,
      ({ numberAt }) =>
        <const>{
          cellVoltageCount: 1.0 * numberAt(5000, 1, "unsigned"),
          cell01Voltage: 0.1 * numberAt(5001, 1, "unsigned"),
          cell02Voltage: 0.1 * numberAt(5002, 1, "unsigned"),
          cell03Voltage: 0.1 * numberAt(5003, 1, "unsigned"),
          cell04Voltage: 0.1 * numberAt(5004, 1, "unsigned"),
          cell05Voltage: 0.1 * numberAt(5005, 1, "unsigned"),
          cell06Voltage: 0.1 * numberAt(5006, 1, "unsigned"),
          cell07Voltage: 0.1 * numberAt(5007, 1, "unsigned"),
          cell08Voltage: 0.1 * numberAt(5008, 1, "unsigned"),
          cell09Voltage: 0.1 * numberAt(5009, 1, "unsigned"),
          cell10Voltage: 0.1 * numberAt(5010, 1, "unsigned"),
          cell11Voltage: 0.1 * numberAt(5011, 1, "unsigned"),
          cell12Voltage: 0.1 * numberAt(5012, 1, "unsigned"),
          cell13Voltage: 0.1 * numberAt(5013, 1, "unsigned"),
          cell14Voltage: 0.1 * numberAt(5014, 1, "unsigned"),
          cell15Voltage: 0.1 * numberAt(5015, 1, "unsigned"),
          cell16Voltage: 0.1 * numberAt(5016, 1, "unsigned"),
          cellTempCount: 1.0 * numberAt(5017, 1, "unsigned"),
          cell01Temp: 0.1 * numberAt(5018, 1, "signed"),
          cell02Temp: 0.1 * numberAt(5019, 1, "signed"),
          cell03Temp: 0.1 * numberAt(5020, 1, "signed"),
          cell04Temp: 0.1 * numberAt(5021, 1, "signed"),
          cell05Temp: 0.1 * numberAt(5022, 1, "signed"),
          cell06Temp: 0.1 * numberAt(5023, 1, "signed"),
          cell07Temp: 0.1 * numberAt(5024, 1, "signed"),
          cell08Temp: 0.1 * numberAt(5025, 1, "signed"),
          cell09Temp: 0.1 * numberAt(5026, 1, "signed"),
          cell10Temp: 0.1 * numberAt(5027, 1, "signed"),
          cell11Temp: 0.1 * numberAt(5028, 1, "signed"),
          cell12Temp: 0.1 * numberAt(5029, 1, "signed"),
          cell13Temp: 0.1 * numberAt(5030, 1, "signed"),
          cell14Temp: 0.1 * numberAt(5031, 1, "signed"),
          cell15Temp: 0.1 * numberAt(5032, 1, "signed"),
          cell16Temp: 0.1 * numberAt(5033, 1, "signed"),
        }
    )),

    ...(await queryModbus(
      modbusConn,
      server,
      5035,
      5053,
      ({ numberAt }) =>
        <const>{
          bmsTemp: 0.1 * numberAt(5035, 1, "signed"),
          envTempCount: 1.0 * numberAt(5036, 1, "unsigned"),
          env01Temp: 0.1 * numberAt(5037, 1, "signed"),
          env02Temp: 0.1 * numberAt(5038, 1, "signed"),
          heaterTempCount: 1.0 * numberAt(5039, 1, "unsigned"),
          heater01Temp: 0.1 * numberAt(5040, 1, "signed"),
          heater02Temp: 0.1 * numberAt(5041, 1, "signed"),
          amperage: 0.01 * numberAt(5042, 1, "signed"),
          voltage: 0.1 * numberAt(5043, 1, "unsigned"),
          energyRemaining: 0.001 * numberAt(5044, 2, "unsigned"),
          energyCapacity: 0.001 * numberAt(5046, 2, "unsigned"),
          cycleNumber: 1.0 * numberAt(5048, 1, "signed"),
          chargeVoltageLimit: 0.1 * numberAt(5049, 1, "signed"),
          dischargeVoltageLimit: 0.1 * numberAt(5050, 1, "signed"),
          chargeCurrentLimit: 0.01 * numberAt(5051, 1, "signed"),
          dischargeCurrentLimit: 0.01 * numberAt(5052, 1, "signed"),
        }
    )),

    ...(await queryModbus(
      modbusConn,
      server,
      5100,
      5142,
      ({ asciiAt, numberAt }) =>
        <const>{
          alarminfoCellVoltage: numberAt(5100, 2, "unsigned"),
          alarminfoCellTemperature: numberAt(5102, 2, "unsigned"),
          alarminfoOther: numberAt(5104, 2, "unsigned"),
          status1: numberAt(5106, 1, "unsigned"),
          status2: numberAt(5107, 1, "unsigned"),
          status3: numberAt(5108, 1, "unsigned"),
          statusChargeDischarge: numberAt(5109, 1, "unsigned"),
          serial: asciiAt(5110, 8),
          manufacturerVersion: asciiAt(5118, 1),
          mainlineVersion: asciiAt(5119, 2),
          communicationProtocolVersion: asciiAt(5121, 1),
          model: asciiAt(5122, 8),
          softwareVersion: asciiAt(5130, 2),
          manufacturerName: asciiAt(5132, 10),
        }
    )),
  };
};
type ServerData = Awaited<ReturnType<typeof queryServer>>;

const moduleOf = (data: ServerData) => {
  return {
    ...data,
    energy: 100.0 * (data.energyRemaining / data.energyCapacity),
    power: data.amperage * data.voltage,
    timeToFull:
      data.amperage > 0
        ? (data.energyCapacity - data.energyRemaining) / data.amperage
        : 0,
    timeToEmpty:
      data.amperage < 0 ? Math.abs(data.energyRemaining / data.amperage) : 0,
  };
};
type Module = Awaited<ReturnType<typeof moduleOf>>;

const batteryOf = (modules: Array<Module>) => {
  let sums = {
    amperage: 0,
    cycleNumber: 0,
    energy: 0,
    energyCapacity: 0,
    energyRemaining: 0,
    manufacturerName: <Array<string>>[],
    model: <Array<string>>[],
    power: 0,
    serial: <Array<string>>[],
    timeToEmpty: 0,
    timeToFull: 0,
    voltage: 0,
  };
  for (const module of modules) {
    sums = {
      amperage: sums.amperage + module.amperage,
      cycleNumber: sums.cycleNumber + module.cycleNumber,
      energy: sums.energy + module.energy,
      energyCapacity: sums.energyCapacity + module.energyCapacity,
      energyRemaining: sums.energyRemaining + module.energyRemaining,
      manufacturerName: [...sums.manufacturerName, module.manufacturerName],
      model: [...sums.model, module.model],
      power: sums.power + module.power,
      serial: [...sums.serial, module.serial],
      timeToEmpty: sums.timeToEmpty + module.timeToEmpty,
      timeToFull: sums.timeToFull + module.timeToFull,
      voltage: sums.voltage + module.voltage,
    };
  }

  return <const>{
    battery: {
      ...sums,
      cycleNumber: sums.cycleNumber / modules.length,
      energy: sums.energy / modules.length,
      manufacturerName: uniqueStrings(sums.manufacturerName)
        .sort((l, r) => l.localeCompare(r))
        .join("."),
      model: uniqueStrings(sums.model)
        .sort((l, r) => l.localeCompare(r))
        .join("."),
      power: sums.power / modules.length,
      serial: Math.abs(
        CRC32.str(
          uniqueStrings(sums.serial)
            .sort((l, r) => l.localeCompare(r))
            .join(".")
        )
      ),
      timeToEmpty: sums.timeToEmpty / modules.length,
      timeToFull: sums.timeToFull / modules.length,
      voltage: sums.voltage / modules.length,
    },
    modules,
  };
};
type Battery = Awaited<ReturnType<typeof batteryOf>>;

const publishBatteryConfigs = async (
  mqttConn: Mqtt.AsyncMqttClient,
  battery: Battery
) => {
  for (const [property, props] of Object.entries(homeAssistantConfigs)) {
    const topic = `homeassistant/sensor/battery_${battery.battery.serial}_${property}/config`;
    const payload = JSON.stringify(
      {
        ...props,
        device: {
          identifiers: [battery.battery.serial],
          manufacturer: battery.battery.manufacturerName,
          model: battery.battery.model,
          name: `Battery ${battery.battery.serial}`,
        },
        name: `Battery ${battery.battery.serial} ${props.name}`,
        object_id: `battery_${battery.battery.serial}_${property}`,
        state_topic: `battery/battery/${battery.battery.serial}/${property}`,
        unique_id: `battery_${battery.battery.serial}_${property}`,
      },
      undefined,
      4
    );

    log.info(`publishing retained: ${topic}: '${payload}'`);
    await mqttConn.publish(topic, payload, { retain: true });
  }
};
const publishModuleConfigs = async (
  mqttConn: Mqtt.AsyncMqttClient,
  module: Module
) => {
  for (const [property, props] of Object.entries(homeAssistantConfigs)) {
    const topic = `homeassistant/sensor/batterymodule_${module.serial}_${property}/config`;
    const payload = JSON.stringify(
      {
        ...props,
        device: {
          identifiers: [module.serial],
          manufacturer: module.manufacturerName,
          model: module.model,
          name: `Battery Module ${module.serial}`,
        },
        name: `Battery Module ${module.serial} ${props.name}`,
        object_id: `batterymodule_${module.serial}_${property}`,
        state_topic: `battery/modules/${module.serial}/${property}`,
        unique_id: `batterymodule_${module.serial}_${property}`,
      },
      undefined,
      4
    );

    log.info(`publishing retained: ${topic}: ${payload}`);
    await mqttConn.publish(topic, payload, { retain: true });
  }
};

const publishBatteryStates = async (
  mqttConn: Mqtt.AsyncMqttClient,
  battery: Battery
) => {
  const dict = {
    amperage: battery.battery.amperage.toFixed(2),
    cycleNumber: battery.battery.cycleNumber.toFixed(2),
    energy: battery.battery.energy.toFixed(2),
    energy_capacity: (
      battery.battery.energyCapacity * battery.battery.voltage
    ).toFixed(3),
    energy_remaining: (
      battery.battery.energyRemaining * battery.battery.voltage
    ).toFixed(3),
    power: battery.battery.power.toFixed(2),
    time_to_empty:
      battery.battery.timeToEmpty !== 0
        ? battery.battery.timeToEmpty.toFixed(2)
        : "unavailable",
    time_to_full:
      battery.battery.timeToFull !== 0
        ? battery.battery.timeToFull.toFixed(2)
        : "unavailable",
    voltage: battery.battery.voltage.toFixed(1),
  };

  for (const [property, value] of Object.entries(dict)) {
    const topic = `battery/battery/${battery.battery.serial}/${property}`;
    const payload = `${value}`;

    log.info(`publishing: ${topic}: ${payload}`);
    await mqttConn.publish(topic, payload);
  }
};
const publishModuleStates = async (
  mqttConn: Mqtt.AsyncMqttClient,
  batteryModule: Module
) => {
  const dict = {
    amperage: batteryModule.amperage.toFixed(2),
    cycleNumber: batteryModule.cycleNumber,
    energy: batteryModule.energy.toFixed(2),
    energy_capacity: (
      batteryModule.energyCapacity * batteryModule.voltage
    ).toFixed(2),
    energy_remaining: (
      batteryModule.energyRemaining * batteryModule.voltage
    ).toFixed(2),
    power: batteryModule.power.toFixed(3),
    time_to_empty: batteryModule.timeToEmpty?.toFixed(2) ?? "unavailable",
    time_to_full: batteryModule.timeToFull?.toFixed(2) ?? "unavailable",
    voltage: batteryModule.voltage.toFixed(1),
  };

  for (const [property, value] of Object.entries(dict)) {
    const topic = `battery/modules/${batteryModule.serial}/${property}`;
    const payload = `${value}`;

    log.info(`publishing: ${topic}: ${payload}`);
    await mqttConn.publish(topic, payload);
  }
};

runForever({
  setup: async () => {
    log.info(`Connecting to MQTT`);
    const mqttConn = await Mqtt.connectAsync("tcp://debian.lan:1883");
    log.info(`Connected to MQTT`);

    log.info(`Connecting to MODBUS`);
    const modbusConn = new Modbus();
    await modbusConn.connectTCP("debian.lan", {
      port: 502,
    });
    log.info(`Connected to MODBUS`);

    let modules: Array<Module> = [];
    for (const server of servers) {
      log.info(`configuring HA for server ${server}`);

      const serverData = await queryServer(modbusConn, server);

      const module = moduleOf(serverData);
      await publishModuleConfigs(mqttConn, module);

      modules = [...modules, module];
    }

    const battery = batteryOf(modules);
    await publishBatteryConfigs(mqttConn, battery);

    return <const>{ modbusConn, mqttConn };
  },

  loop: async ({ modbusConn, mqttConn }) => {
    let modules: Array<Module> = [];
    for (const server of servers) {
      const serverData = await queryServer(modbusConn, server);
      const module = moduleOf(serverData);

      await publishModuleStates(mqttConn, module);
      modules = [...modules, module];
    }

    const battery = batteryOf(modules);
    await publishBatteryStates(mqttConn, battery);
  },

  teardown: async ({ modbusConn, mqttConn }) => {},
});