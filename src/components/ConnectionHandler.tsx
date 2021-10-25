import { View, Button } from "@nodegui/react-nodegui";
import React, { useState } from "react";
import StreamProvider from "./StreamProvider";

export type streamStateModel = "preStream" | "streamStarted"

const ControlsBtnStyle = `
	min-height: 2rem;
	padding: 8px;
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

const boxStyle = `
	padding: 8px 16px 16px 16px;
`
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
		<View	style={boxStyle}>
			<ControlsBtn
				onBtnClick={onBtnClick}
				text={streamState}
			/>
			<StreamProvider
				ipAddress={ipAddress}
				streamState={streamState}
			/>
		</View>
	)
}


export default ConnectionProvider
