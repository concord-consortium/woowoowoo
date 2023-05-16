import React, { useState } from "react"
import { SensorSetup } from "./sensor-setup"
import { SensorView } from "./sensor-view"
import { SetDisplayName } from "./set-display-name"

type SensorValue = number

type State = {
  view: "sensor-setup"|"set-display-name"|"sensor-view"
  displayName?: string
  sensorValue?: SensorValue
  history: Record<string,SensorValue[]>
  muteAudio: boolean
}

const initialState: State = {
  view:"sensor-setup",
  history: {},
  muteAudio: false,
}

export type ComponentProps = {
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>
}

export const App = () => {
  const [state, setState] = useState<State>(initialState)
  const {view} = state

  switch (view) {
    case "sensor-setup":
      return <SensorSetup state={state} setState={setState}/>

    case "set-display-name":
      return <SetDisplayName state={state} setState={setState}/>

    case "sensor-setup":
      return <SensorView state={state} setState={setState}/>
  }
}