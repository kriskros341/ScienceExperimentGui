import { Window, View, LineEdit, Button } from "@nodegui/react-nodegui";
import React, { useState, useRef } from "react";
import {useConnection} from '../connect'
import defaults from './defaults'
import ConnectionProvider from './ConnectionHandler'


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

type OptionsModel = {
	temperature?: number
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

export default WindowHandler
