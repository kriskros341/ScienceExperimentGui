import { View, Button, LineEdit, Text  } from "@nodegui/react-nodegui";
import useStream from '../connect'
import {useConnection} from '../connect'
import React, { useState, useEffect, useCallback } from "react";
import LogView from './LogView'
import OptionsView, {OptionsModel} from './OptionsView'

export type streamStateModel = "preStream" | "streamStarted"




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

interface ConnectionComponent {
	setConnData: (s: Partial<connModel>) => void
	establishConnection: () => void
	connData: connModel
	err: string | null
}

const ConnectionForm: React.FC<ConnectionComponent> = (
	{ connData, setConnData, establishConnection, err }
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
	const userChangeHandler = {
		textChanged: (user: string) => {
			setConnData({user: user})
		}
	}
	const ipChangeHandler = {
		textChanged: (ip: string) => {
			setConnData({ipAddress: ip})
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
					on={userChangeHandler}
					enabled={!isConnecting}
					text={connData.user}
				/>
				<Text>@</Text>
				<LineEdit
					style={'flex: 100%'}
					on={ipChangeHandler}
					enabled={!isConnecting}
					text={connData.ipAddress}
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

const Interface: React.FC<{
	targetIp: string,
	toggleWindowSize: () => () => void 
}> = ({targetIp, toggleWindowSize}) => {
	const [streamState, setStreamState] = useState<streamStateModel>("preStream")
	const [deviceLog, startStream] = useStream(`root@${targetIp}`, "python3 main.py")
	const [options, handleOptions] = useStateObjectHandler<OptionsModel>(defaults.options)
	
	useEffect(() => {
		const makeWindowSmallAgain = toggleWindowSize()
		return () => makeWindowSmallAgain()
	}, [])
	
	const mainBtnHandler = () => 
		isStreaming ? setStreamState("preStream") : setStreamState("streamStarted")
	const isStreaming = streamState === "streamStarted"
	const mainBtnText = isStreaming ? "end stream" : "start stream"

	return (
		<>
			<ControlsBtn
				onBtnClick={mainBtnHandler}
				text={mainBtnText}
			/>
			{(isStreaming ? (
				<LogView 
					logs={deviceLog} 
					streamStart={startStream} 
				/>
			) : (
				<OptionsView />
			)
			)}
		</>
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

type connModel = {
	user: string;
	ipAddress: string;
}

const connDefaults: connModel = {
	user: "root",
	ipAddress: "192.168.1.21",
}

const ConnectionProvider: React.FC<{
	toggleWindowSize: () => () => void
}> = ({toggleWindowSize}) => {
	const [connData, setConnData] = useState<connModel>(connDefaults)
	const sshString = `${connData.user}@${connData.ipAddress}`
	const [targetProbeResponse, reprobe, err] = useConnection(sshString)
	const establishConnection = () => {
		reprobe()
	}
	console.log(sshString)
	//CIEKAWE
	const handleConnDataChange = (val: Partial<connModel>) => {
		setConnData(v => ({...v, ...val}))
	}
	// can I abstract some connection logic away?
	// Change window size based on targetProbeResponse
	// Also refactor the living shit out of useStream because I'm a fucking monkey
	//
	// connection and stream are separate... is it wrong?
	return (
		<View	style={boxStyle}>
			{targetProbeResponse ? (
				<Interface
					toggleWindowSize={toggleWindowSize}
					targetIp={connData.ipAddress}	
				/>
			) : (
				<ConnectionForm 
					connData={connData}
					setConnData={(newData: Partial<connModel>) => handleConnDataChange(newData)}
					establishConnection={establishConnection}
					err={err.message}
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
