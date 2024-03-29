import { View, Button, LineEdit, Text  } from "@nodegui/react-nodegui";
import { useStream, useConnection } from '../connect'
import React, { useState, useEffect, useCallback } from "react";
import LogView from './LogView'
import OptionsView from './OptionsView'
import { windowSizeModel } from "./windowHandler";

export type streamStateModel = "preStream" | "streamStarted"

const ControlsBtn: React.FC<{text: string, onBtnClick: () => void}> = ({text, onBtnClick}) => {
	const ControlsBtnHandler = {
		clicked: () => onBtnClick()
	}
	return (
		<Button
			id={'mainBtnStyle'}
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
	setWindowSize: (s: windowSizeModel) => void
}

const ConnectionForm: React.FC<ConnectionComponent> = (
	{ setWindowSize, connData, setConnData, establishConnection, err }
) => {
	const [ isConnecting, setConnecting ] = useState<boolean>(false)
	useEffect(() => {
		if(typeof err == 'string' && isConnecting == true) {
			setConnecting(false)
		}
	}, [err])
	useEffect(() => {
		setWindowSize('small')
	}, [])
	const connectBtnHandler = {
		clicked: (e: any) => {
			setConnecting(v => !v)
			console.log(isConnecting)
			if(!isConnecting) {
				establishConnection()	
			}		
		},
	}
	useEffect(() => {
		
	}, [])
	const portChangeHandler = {
		textChanged: (port: string) => {
			setConnData({port: port})
		}
	}
	const ipChangeHandler = {
		textChanged: (ip: string) => {
			setConnData({ipAddress: ip})
		}
	}
	return (
		<View 
			style={containerBox}
		>
		<View 
			style={containerStyle}
		>
			<View style={
					`flex: 0; 
					 flex-direction: row;
						margin-bottom: 8px;
				`}>
				<Text>pi@</Text>
				<LineEdit
					style={'flex: 100%'}
					on={ipChangeHandler}
					enabled={!isConnecting}
					text={connData.ipAddress}
				/>
				<Text>:</Text>
				<LineEdit 
					style={'flex: 2rem; width: 86px;'}
					on={portChangeHandler}
					enabled={!isConnecting}
					text={connData.port}
				/>
			</View>
			<Button 
				on={connectBtnHandler}
				id={'connButtonStyle'}
			>
				{isConnecting ? "Connecting" : "Connect"} 
			</Button>
			{err && (
				<Text>{err}</Text>
			)}
		</View>
	</View>
	)
}

const containerBox = `
	flex: 1;
	height: '100%';
	flex-direction: 'row';
	justify-content: 'space-evenly';
	align-items: 'center';
`
const containerStyle = `
	width: '80%';
	min-width: 250px;
`


type measure = 'c' | 'h' | 'cv' | 't' | 'm'


export const Measures: measure[] = [
	'm',
	't',
	'cv',
	'h',
	'c',
]


export type OptionsModel = {
	temperature: number
	scriptname: string
	measurement: measure
}


export const defaults: OptionsModel = {
	scriptname: 'controls.py',
	temperature: 40,
	measurement: 'm'
}




const Interface: React.FC<{
	disconnect: () => void,
	connString: string,
	setWindowSize: (s: windowSizeModel) => void
}> = ({connString, setWindowSize, disconnect}) => {
	const [streamState, setStreamState] = useState<streamStateModel>("preStream")
	
	const [ options, setOptions ] = useState<OptionsModel>(defaults)
	const startString: string = 
		`start&${options.scriptname}&${options.measurement}&${options.temperature}`
	const [deviceLog, startStream] = useStream(`ws://${connString}`, startString)

	const setOptionsHandler = (val: Partial<OptionsModel>) => {
		setOptions((v: OptionsModel) => ({...v, ...val}))
	}
	const restart = () => {
		setStreamState("preStream");
		disconnect();
	}
	const mainBtnHandler = () => 
		isStreaming ? restart() : setStreamState("streamStarted")
	const isStreaming = streamState === "streamStarted"
	const mainBtnText = isStreaming ? "end stream" : "start stream"
	return (
		<View style={ContainerStyle}>
			<ControlsBtn
				onBtnClick={mainBtnHandler}
				text={mainBtnText}
			/>
			{(isStreaming ? (
				<LogView 
					setWindowSize={setWindowSize}
					logs={deviceLog} 
					streamStart={startStream} 
				/>
			) : (
				<OptionsView 
					setWindowSize={setWindowSize}
					options={options}
					setOptionsHandler={setOptionsHandler}
				/>
			)
			)}
		</View>
	)
}


const ContainerStyle = `
	margin: 16px;

`

type connModel = {
	port: string;
	ipAddress: string;
}

const connDefaults: connModel = {
	port: "8080",
	ipAddress: "192.168.100.200",
}

const ConnectionProvider: React.FC<{
	setWindowSize: (s: windowSizeModel) => void
}> = ({setWindowSize}) => {
	const [connData, setConnData] = useState<connModel>(connDefaults)
	const connString = `${connData.ipAddress}:${connData.port}`
	const [canConnect, dc, probe, err] = useConnection(connString)
	const establishConnection = () => {
		probe()
	}
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
		<View	id={'mainBox'}>
			{canConnect ? (
				<Interface
					setWindowSize={setWindowSize}
					connString={connString}
					disconnect={dc}
				/>
			) : (
				<ConnectionForm 
					connData={connData}
					setWindowSize={setWindowSize}
					setConnData={(newData: Partial<connModel>) => handleConnDataChange(newData)}
					establishConnection={establishConnection}
					err={err}
				/>
			)}
		</View>
	)
}


const boxStyle = `
	height: '100%';
`

export default ConnectionProvider
