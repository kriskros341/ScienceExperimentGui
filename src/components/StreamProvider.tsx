import defaults from './defaults'
import React, { useState, useCallback } from "react";
import {streamStateModel} from './ConnectionHandler'
import useStream from '../connect'
import LogView from './LogView'
import OptionsView, {OptionsModel} from './OptionsView'

interface PiInterface {
	streamState: streamStateModel
	ipAddress: string
}




const useStateObjectHandler = <T, >(initialState: T) => {
	const [ state, setState ] = useState<T>(initialState)
	const changeHandler = useCallback((newState: T) => {
		setState(
			(current: any) => ({...current, ...newState})
		)
	}, [])
	return [state, changeHandler] as [T, (newState: T) => void]
}

const StreamProvider: React.FC<PiInterface> = (
	{streamState, ipAddress}
) => {
	const [options, handleOptions] = useStateObjectHandler<OptionsModel>(defaults.options)
	const [deviceLog, startStream] = useStream(`root@${ipAddress}`, "python3 main.py")
	const isStreaming = streamState === "streamStarted"
	if(isStreaming) {
		return <LogView logs={deviceLog} streamStart={startStream} />
	}
	return <OptionsView />
}

const logListStyle = `
	flex: 1;
	flex-direction: row;
`

export default StreamProvider
