import { Window, View, LineEdit, Button, ComboBox, Text } from "@nodegui/react-nodegui";
import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import defaults from './defaults'
import ConnectionProvider from './ConnectionHandler'


type OptionsModel = {
	temperature?: number
}

export type windowSizeModel = 'small' | 'large'

const windowSizes = {
	'large': {width: 600, height: 600},
	'small': {width: 360, height: 120}
}


const WindowHandler: React.FC<{}> = ({}) => {
	const [ windowSize, setWindowSizeState ] = useState<windowSizeModel>('small')
	const isWindowSmall = windowSize === 'small'
	const changeWindowSizeWithCallback = () => {
		setWindowSizeState(isWindowSmall ? 'large' : 'small')
		return () => setWindowSizeState(isWindowSmall ? 'small' : 'large')
	}
	return (
		<Window
			size={windowSizes[windowSize]}
			styleSheet={styleSheet}
		>
			<ConnectionProvider
				toggleWindowSize={changeWindowSizeWithCallback}
			/>
		</Window>
	)
}

const styleSheet = `
 #mainBox {
	padding: 8px 16px 16px 16px;
 }
 #connButtonStyle {
	min-width: 160px;
	height: 32px;
 }
 #connButtonStyle:hover {
	background-color: 'yellow';
 }
 #mainBtnStyle {
	min-width: 160px;
	height: 32px;
 }

 #mainBtnStyle:hover {
	background: 'green';
}

`

export default WindowHandler
