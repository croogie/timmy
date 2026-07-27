import * as Uebersicht from "uebersicht";
import * as Settings from "./lib/settings.js";
import * as Error from "./lib/components/error.jsx";
import * as Chart from "./lib/components/chart.jsx";

// Destructure React from Uebersicht in order to make eslint catch hook rules for example
const { React } = Uebersicht;

const { useCallback, useEffect, useRef, useState } = React;

const refreshFrequency = false;

function render({ output, error }) {
  if (error) {
    return <Error.Component error={error} />;
  }

  return <Chart.Component />;
}

export const className = Settings.className;
export { render, refreshFrequency };
