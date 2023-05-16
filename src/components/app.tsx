import React, { useState } from "react"
import { useEffect } from "react"
import { SensorSetup } from "./sensor-setup"
import { SensorView } from "./sensor-view"
import { SetDisplayName } from "./set-display-name"

type SensorValue = number

type State = {
  view: "set-display-name"|"sensor-view"
  displayName?: string
  sensorValue?: SensorValue
  history: Record<string,SensorValue[]>
  muteAudio: boolean
}

const initialState: State = {
  view: "set-display-name",
  history: {},
  muteAudio: false,
}

export type ComponentProps = {
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>
}

export const App = () => {
  const [state, setState] = useState<State>(initialState)
  const {view, displayName} = state

  if ((displayName === undefined) || (view === "set-display-name")) {
    return <SetDisplayName state={state} setState={setState}/>
  }

  return <SensorView state={state} setState={setState}/>
}
