module.exports = [
  {
    type: "heading",
    defaultValue: "Hush"
  },
  {
    type: "text",
    defaultValue: "Time first. Everything else only when it matters."
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Presets"
      },
      {
        type: "select",
        messageKey: "Preset",
        label: "One-tap setup",
        defaultValue: "custom",
        options: [
          { label: "Custom (use settings below)", value: "custom" },
          { label: "Commuter", value: "commuter" },
          { label: "Parent", value: "parent" },
          { label: "Deep Work", value: "deepwork" },
          { label: "Weekend", value: "weekend" }
        ]
      },
      {
        type: "text",
        defaultValue: "A preset applies theme and thresholds and ignores the manual signal fields below until you choose Custom. Time format, units, and ICS URL always apply."
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Look"
      },
      {
        type: "select",
        messageKey: "Theme",
        label: "Theme",
        defaultValue: "ink",
        options: [
          { label: "Ink", value: "ink" },
          { label: "Paper", value: "paper" },
          { label: "Night", value: "night" },
          { label: "Phosphor", value: "phosphor" },
          { label: "Coral", value: "coral" },
          { label: "Custom", value: "custom" }
        ]
      },
      {
        type: "color",
        messageKey: "CustomBg",
        defaultValue: "0x000000",
        label: "Custom background"
      },
      {
        type: "color",
        messageKey: "CustomFg",
        defaultValue: "0xFFFFFF",
        label: "Custom text"
      },
      {
        type: "color",
        messageKey: "CustomAccent",
        defaultValue: "0x55AAAA",
        label: "Custom accent"
      },
      {
        type: "select",
        messageKey: "FontScale",
        label: "Time style",
        defaultValue: "display",
        options: [
          { label: "Display (Roboto Bold 49)", value: "display" },
          { label: "Compact (Bitham Black 30)", value: "bold" },
          { label: "Classic (Bitham Bold 42)", value: "condensed" }
        ]
      },
      {
        type: "select",
        messageKey: "AlwaysOn",
        label: "Always-on detail",
        defaultValue: "date",
        options: [
          { label: "Off", value: "off" },
          { label: "Date", value: "date" },
          { label: "Weekday", value: "weekday" },
          { label: "Battery %", value: "battery" },
          { label: "Steps (dim)", value: "steps" }
        ]
      },
      {
        type: "toggle",
        messageKey: "Use24Hour",
        label: "24-hour time",
        defaultValue: true
      },
      {
        type: "toggle",
        messageKey: "LeadingZero",
        label: "Leading zero",
        defaultValue: true
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Behavior"
      },
      {
        type: "toggle",
        messageKey: "PeekMode",
        label: "Peek mode (show signals without thresholds)",
        defaultValue: false
      },
      {
        type: "toggle",
        messageKey: "SecondsOnFlick",
        label: "Show seconds for 8s after flick",
        defaultValue: false
      },
      {
        type: "toggle",
        messageKey: "HapticSignals",
        label: "Haptic when a new high-priority signal appears",
        defaultValue: true
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Calendar signal"
      },
      {
        type: "toggle",
        messageKey: "CalEnabled",
        label: "Enable calendar",
        defaultValue: true
      },
      {
        type: "slider",
        messageKey: "CalMinutes",
        label: "Warn minutes before event",
        defaultValue: 15,
        min: 5,
        max: 60,
        step: 5
      },
      {
        type: "input",
        messageKey: "IcsUrl",
        defaultValue: "",
        label: "Public ICS / iCal URL",
        attributes: {
          type: "url",
          placeholder: "https://…"
        }
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Weather signal"
      },
      {
        type: "toggle",
        messageKey: "WxEnabled",
        label: "Enable weather",
        defaultValue: true
      },
      {
        type: "toggle",
        messageKey: "UseFahrenheit",
        label: "Fahrenheit",
        defaultValue: false
      },
      {
        type: "slider",
        messageKey: "WxRainMin",
        label: "Rain within (minutes)",
        defaultValue: 30,
        min: 15,
        max: 120,
        step: 15
      },
      {
        type: "slider",
        messageKey: "WxUv",
        label: "UV index at or above",
        defaultValue: 6,
        min: 3,
        max: 11,
        step: 1
      },
      {
        type: "slider",
        messageKey: "WxTempLow",
        label: "Comfort low (°)",
        defaultValue: 5,
        min: -20,
        max: 30,
        step: 1
      },
      {
        type: "slider",
        messageKey: "WxTempHigh",
        label: "Comfort high (°)",
        defaultValue: 30,
        min: 15,
        max: 45,
        step: 1
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Health pace signal"
      },
      {
        type: "toggle",
        messageKey: "HealthEnabled",
        label: "Enable step-pace",
        defaultValue: true
      },
      {
        type: "slider",
        messageKey: "StepGoal",
        label: "Step goal",
        defaultValue: 8000,
        min: 2000,
        max: 20000,
        step: 500
      },
      {
        type: "slider",
        messageKey: "PaceBehindPct",
        label: "Behind expected pace by %",
        defaultValue: 20,
        min: 10,
        max: 50,
        step: 5
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "System signal"
      },
      {
        type: "toggle",
        messageKey: "SysEnabled",
        label: "Enable system (BT / Quiet Time / battery)",
        defaultValue: true
      },
      {
        type: "slider",
        messageKey: "BatThreshold",
        label: "Low battery at or below %",
        defaultValue: 20,
        min: 5,
        max: 40,
        step: 5
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "Sun signal"
      },
      {
        type: "toggle",
        messageKey: "SunEnabled",
        label: "Enable sunrise / sunset",
        defaultValue: false
      },
      {
        type: "slider",
        messageKey: "SunMinutes",
        label: "Minutes before sun event",
        defaultValue: 20,
        min: 5,
        max: 60,
        step: 5
      }
    ]
  },
  {
    type: "section",
    items: [
      {
        type: "heading",
        defaultValue: "World overlap signal"
      },
      {
        type: "toggle",
        messageKey: "WorldEnabled",
        label: "Enable evening overlap window",
        defaultValue: false
      },
      {
        type: "select",
        messageKey: "WorldOffset",
        label: "Other timezone UTC offset (hours)",
        defaultValue: "-5",
        options: [
          { label: "UTC−12", value: "-12" },
          { label: "UTC−11", value: "-11" },
          { label: "UTC−10", value: "-10" },
          { label: "UTC−9", value: "-9" },
          { label: "UTC−8", value: "-8" },
          { label: "UTC−7", value: "-7" },
          { label: "UTC−6", value: "-6" },
          { label: "UTC−5", value: "-5" },
          { label: "UTC−4", value: "-4" },
          { label: "UTC−3", value: "-3" },
          { label: "UTC±0", value: "0" },
          { label: "UTC+1", value: "1" },
          { label: "UTC+2", value: "2" },
          { label: "UTC+3", value: "3" },
          { label: "UTC+4", value: "4" },
          { label: "UTC+5", value: "5" },
          { label: "UTC+5:30 (use +5)", value: "5" },
          { label: "UTC+8", value: "8" },
          { label: "UTC+9", value: "9" },
          { label: "UTC+10", value: "10" },
          { label: "UTC+12", value: "12" }
        ]
      },
      {
        type: "slider",
        messageKey: "WorldStart",
        label: "Overlap start hour (their local)",
        defaultValue: 18,
        min: 0,
        max: 23,
        step: 1
      },
      {
        type: "slider",
        messageKey: "WorldEnd",
        label: "Overlap end hour (their local)",
        defaultValue: 22,
        min: 0,
        max: 23,
        step: 1
      }
    ]
  },
  {
    type: "submit",
    defaultValue: "Save"
  }
];
