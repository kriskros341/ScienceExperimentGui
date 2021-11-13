import { View, Button, LineEdit, Text  } from "@nodegui/react-nodegui";
import useStream from '../connect'
import {useConnection} from '../connect'
import React, { useState, useEffect, useCallback } from "react";
import LogView from './LogView'
import OptionsView, {OptionsModel} from './OptionsView'

export type streamStateModel = "preStream" | "streamStarted"



interface ConnectionComponent {
	setIpAddress: (s: string) => void
	establishConnection: () => void
	currentIpAddress: string | undefined
	err: string | null
}

const ControlsBtn: React.FC<{text: string, onBtnClick: () => void}> = ({text, onBtnClick}) => {
	const ControlsBtnHandler = {
		clicked: () => onBtnClick()
	}
	return (
		<Button
			style={ControlsBtnStyle}
			on={ControlsBtnHandler}
		>
			{text}
		</Button>
	)
}


const ConnectionForm: React.FC<ConnectionComponent> = (
	{ setIpAddress, establishConnection, currentIpAddress, err }
) => {
	const [ isConnecting, setConnecting ] = useState<boolean>(false)
	useEffect(() => {
		if(typeof err == 'string' && isConnecting == true) {
			setConnecting(false)
		}
	}, [err])
	const connectBtnHandler = {
		clicked: (e: any) => {
			if(!isConnecting) {
				setConnecting(v => !v)
				establishConnection()	
			}
		},
	}
	const ipChangeHandler = {
		textChanged: (e: any) => {
			setIpAddress(e)
		}
	}

	return (
		<View 
			style={containerStyle}
			id={"container"}
		>
			<View style={'flex: 0; flex-direction: row;'}>
				<LineEdit 
					style={'flex: 2rem; width: 128px;'}
					text={"root"}
				/>
				<Text>@</Text>
				<LineEdit
					style={'flex: 100%'}
					on={ipChangeHandler}
					enabled={!isConnecting}
					text={currentIpAddress}
				/>
				<Text>:</Text>
				<LineEdit
					style={'flex: 2rem; width: 64px;'}
					text={"22"}
				/>
			</View>
			<Button 
				on={connectBtnHandler}
				id={"connectBtn"}
			>
				{isConnecting ? "Connecting" : "Connect"} 
			</Button>
			{err && (
				<Text>{err}</Text>
			)}
		</View>
	)
}


const defaults = {
	ipAddress: "192.168.1.21",
	remoteUser: "root",
	options: {
		temperature: 40,
	}
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

const ConnectionProvider: React.FC<{
	setWindowSize: () => void
}> = () => {
	const [streamState, setStreamState] = useState<streamStateModel>("preStream")
	const [targetIp, setTargetIp] = useState<string>(defaults.ipAddress)
	const sshString = `${defaults.remoteUser}@${targetIp}`
	const [targetProbeResponse, reprobe, err] = useConnection(sshString)
	const establishConnection = () => {
		reprobe()
	}
	const getBtnHandler = (btnType: streamStateModel) => {
		const handlers = {
			"preStream": () => {
				setStreamState("streamStarted")
			},
			"streamStarted": () => {
				setStreamState("preStream")
			},
		}
		return handlers[btnType]
	}
	const mainBtnHandler = getBtnHandler(streamState)
	const isStreaming = streamState === "streamStarted"
	// can I abstract some connection logic away?
	const [deviceLog, startStream] = useStream(`root@${targetIp}`, "python3 main.py")
	const [options, handleOptions] = useStateObjectHandler<OptionsModel>(defaults.options)
	
	// Change window size based on targetProbeResponse
	// Also refactor the living shit out of useStream because I'm a fucking monkey

	return (
		<View	style={boxStyle}>
			{targetProbeResponse ? (
				<>
					<ControlsBtn
						onBtnClick={mainBtnHandler}
						text={streamState == "preStream" ? "start stream" : "end stream"}
					/>
					{(isStreaming ? (
						<LogView 
							logs={deviceLog} 
							streamStart={startStream} 
						/>
					) : (
						<OptionsView />
					))}
				</>
			) : (
				<ConnectionForm 
					currentIpAddress={targetIp}
					establishConnection={establishConnection}
					setIpAddress={(ip: string) => setTargetIp(ip)}
					err={err}
				/>
			)}
		</View>
	)
}

const containerStyle = `
	#container {
		padding: 16px;
	}
	#connectBtn {
		margin-top: 4px;
		min-height: 2em;
	}
	#connectBtn:hover {
		background-color: yellow;
	}
`;

const ControlsBtnStyle = `
	min-height: 2rem;
	padding: 8px;
`

const boxStyle = `
	padding: 8px 16px 16px 16px;
`

export default ConnectionProvider
