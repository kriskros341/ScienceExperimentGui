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
	'small': {width: 300, height: 300}
}

const WindowHandler: React.FC<{}> = ({}) => {
	const [ windowSize, setWindowSizeState ] = useState<windowSizeModel>('small')
	const setWindowSize = (s?: windowSizeModel) => {
		if(s) {
			setWindowSizeState(s)
			return
		} 
		if(windowSize == 'small') {
			setWindowSizeState('large')
		} else {
			setWindowSizeState('small')
		}
	}
	return (
		<Window
			size={windowSizes[windowSize]}
		>
			<ConnectionProvider 
				setWindowSize={setWindowSize}
			/>
		</Window>
	)
}


export default WindowHandler
