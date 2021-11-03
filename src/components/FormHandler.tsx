import { Text, Window, View, LineEdit, Button, PlainTextEdit } from "@nodegui/react-nodegui";
import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import useStream, {useConnection} from '../connect'

interface ConnectionComponent {
	setIpAddress: (s: string) => void
	establishConnection: () => void
	currentIpAddress: string | undefined
}


const ConnectionForm: React.FC<ConnectionComponent> = (
	{ setIpAddress, establishConnection, currentIpAddress }
) => {
	const [ isConnecting, setConnecting ] = useState<boolean>(false)
	const btnRef = useRef(null)
	const connectBtnHandler = {
		clicked: (e: any) => {
			setConnecting(v => !v)
			establishConnection()	
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
			<LineEdit 
				on={ipChangeHandler}
				enabled={!isConnecting}
				text={currentIpAddress}
			/>
			<Button 
				ref={btnRef}
				on={connectBtnHandler}
				id={"connectBtn"}
			>
				{isConnecting ? "Connecting" : "Connect"} 
			</Button>
		</View>
	)
}

interface PiInterface {
	streamState: streamStateModel
	ipAddress: string
}



const LogInterface: React.FC<{logs: string[], streamStart: () => () => void}> = ({logs, streamStart}) => {
	const [ newEntries, setNewEntries ] = useState<string[]>([])
	const [ showNewEntries, setShowNewEntries ] = useState<boolean>(true)
	const toggleNewEntries = () => {
		setShowNewEntries(v => !v)
		setNewEntries(logs)
	}
	useEffect(() => {
		if(showNewEntries) {
			setNewEntries([...logs])
		}
	}, [logs.length])
	useEffect(() => {
		const cleanup = streamStart()
		return () => cleanup()
	}, [])
	const hold = useCallback(() => {
		if(showNewEntries) {
			setShowNewEntries(false)
			setTimeout(() => setShowNewEntries(true), 4000)
		}
	}, [])
	return (
		<View style={"flex: 1; flex-direction: row"}>
			<View style={"flex: 3; padding-right: 4"}>
				<MemorizedLogArea 
					haltRefresh={hold}
					data={newEntries}
				/>
			</View>
			<View style={"flex: 1; padding-left: 4"}>
				<Text>Options:</Text>
				<Button
					on={{clicked: () => {
						toggleNewEntries()
					}}}
				>
					{showNewEntries ? "HoldRefreshes" : "ReasumeRefreshes"}
				</Button>
			</View>
		</View>
	)
}

const LogArea: React.FC<{data: string[], haltRefresh: () => void}> = ({data, haltRefresh}) => {
	return (
		<>
			<Text>stdout:</Text>
			<PlainTextEdit
				mouseTracking={true}
				readOnly={true}
				text={data.join("\n")}
				style={"min-height: 400"}
			/>
		</>
	)
}

const MemorizedLogArea = memo(LogArea)

const OptionsInterface = () => {
	return (
		<View>
			<LineEdit style={"min-height: 2rem"}/>
		</View>
	)
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


const PiInterfaceView: React.FC<PiInterface> = (
	{streamState, ipAddress}
) => {
	const [options, handleOptions] = useStateObjectHandler<OptionsModel>(defaults.options)
	const [deviceLog, startStream] = useStream(`root@${ipAddress}`, "python3 main.py")
	const isStreaming = streamState === "streamStarted"
	return (
		<View style={"flex: 1"}>
			{isStreaming ? 
				<LogInterface logs={deviceLog} streamStart={startStream} />
				:
				<OptionsInterface />
			}
		</View> 
	)
}
const ControlsBtnStyle = `
	min-height: 2rem;
	padding: 8px;
`

const PiInterfaceStyle = `
	padding: 8px 16px 16px 16px;
`

const logListStyle = `
	flex: 1;
	flex-direction: row;
`


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

type streamStateModel = "preStream" | "streamStarted"

const ConnectionProvider: React.FC<{
	ipAddress: string
}> = ({ipAddress}) => {
	const [streamState, setStreamState] = useState<streamStateModel>("preStream")
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
	const onBtnClick = getBtnHandler(streamState)
	return (
		<View	style={PiInterfaceStyle}>
			<ControlsBtn
				onBtnClick={onBtnClick}
				text={streamState}
			/>
			<PiInterfaceView
				ipAddress={ipAddress}
				streamState={streamState}
			/>
		</View>
	)
}

const LogAreaStyle = `
	
`

// connectionForm
// connectionAwaiting
// optionsHandler
// logHandler

type OptionsModel = {
	temperature?: number
}


const defaults = {
	remoteUser: "root",
	ipAddress: "192.168.1.21",
	connection: {isConnected: false, isStarted: false},
	options: {temperature: 50},
}
const WindowHandler: React.FC<{}> = ({}) => {
	const [targetIp, setTargetIp] = useState<string>(defaults.ipAddress)
	// replace PiInterface with integrated interface 
	const sshString = `${defaults.remoteUser}@${targetIp}`
	const [targetProbeResponse, reprobe] = useConnection(sshString)
	if(targetProbeResponse) {
		return(
			<Window
				size={{width: 600, height: 600}}
			>
				<ConnectionProvider 
					ipAddress={targetIp || defaults.ipAddress}
				/>
			</Window>
		)
	}
	return (
		<Window
			size={{width: 400, height: 200}}
			windowTitle="GOLF"
			styleSheet={containerStyle}
		>
			<ConnectionForm 
				establishConnection={
					() => reprobe()
				}
				setIpAddress={(ip: string) => setTargetIp(ip)}
				currentIpAddress={targetIp}
			/>
		</Window>
		)
}

const containerStyle = `
	#container {
		flex: 1;
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

const anyBtn = `
	margin-top: 4px;
	min-height: 2em;
`

export default WindowHandler
