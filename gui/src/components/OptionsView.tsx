
import { LineEdit, View, Text, useEventHandler, ScrollArea, ComboBox, CheckBox } from "@nodegui/react-nodegui";
import React, { useMemo, memo, useState, useCallback, useRef, useEffect } from "react";
import { QLineEdit, QLineEditSignals, QScrollAreaSignals, QWheelEvent, QComboBoxSignals, WidgetEventTypes } from '@nodegui/nodegui'



//c - chłodzenie; h - grzanie; cv - kalibracja; t - pomiar długości; m - pełna procedura
type measure = 'c' | 'h' | 'cv' | 't' | 'm'


const Measures: measure[] = [
	'm',
	't',
	'cv',
	'h',
	'c',
]
const Measuress = {
	0: 'pełna procedura',
	1: 'pomiar długości', 
	2: 'kalibracja', 
	3: 'grzanie', 
	4: 'chłodzenie', 
}

export type OptionsModel = {
	temperature: number
	scriptname: string
	measurement: measure
}

const defaults: OptionsModel = {
	scriptname: 'controls.py',
	temperature: 40,
	measurement: 'm'
}

const MIN = 30
const MAX = 100


const PleaseWork = memo( (HandleProcedure: any) => 


	<ComboBox
		on={HandleProcedure.HandleProcedure}
		style={`width: '99%'`}
		items={[
			{text: 'pełna procedura'},
			{text: 'pomiar długości'}, 
			{text: 'kalibracja'}, 
			{text: 'grzanie'}, 
			{text: 'chłodzenie'}, 
		]} />
)

const OptionsView = () => {
	const [ advanced, setAdvanced ] = useState<boolean>(false)
	const [ options, setOptions ] = useState<OptionsModel>(defaults)
	const HandleProcedure = useEventHandler<QComboBoxSignals>({
		currentIndexChanged: (e: number) => {
			if(e != -1) {
				setOptions(v => ({...v, measurement: Measures[e]}))
			}
		}
	}, [])

	const HandleScriptname = useEventHandler<QLineEditSignals>({
		textChanged: (text: string) => {
			setOptions(v => ({...v, scriptname: text}))
		},
		editingFinished: () => {
			if(options.scriptname == '') {
				setOptions(v => ({...v, scriptname: defaults.scriptname}))
			}
		},
	}, [options])
	const HandleTemperature = useEventHandler<QLineEditSignals>({
		textChanged: (text: string) => {
			const numericValue = parseInt(text)
			setOptions(v => ({...v, temperature: numericValue}))
		},
		editingFinished: () => {
			console.log(options.temperature)
			if(options.temperature < 30) {
				setOptions(v => ({...v, temperature: defaults.temperature}))
			}
			if(options.temperature > 100) {
				setOptions(v => ({...v, temperature: defaults.temperature}))
			}
		},
		[WidgetEventTypes.Wheel]: (e: any) => {
			const wheel = new QWheelEvent(e)
			const change = options.temperature + wheel.angleDelta().y / 120
			if(change < MIN || change > MAX) {
				return;
			}
			setOptions(v => ({...v, temperature: change}))
		} 
	}, [options])
	return (
		<>
			<View style={ViewStyle}>
				<Text style={`width: 164px;`}>
					python3 {options.scriptname} {options.measurement} {options.temperature}
				</Text>
			</View>
			<View style={InputStyle}>
				<View style={`
						flex: 3;
						height: '100%'; 
						justify-content: 'space-between';
						margin-left: 8px;
					`}>
					<Text>nazwa skryptu</Text>
					<LineEdit 
						on={HandleScriptname}
						text={options.scriptname}
					/>
				</View>
				<View style={`
						flex: 3;
						height: '100%'; 
						justify-content: 'space-between';
						margin-left: 16px;
					`}>
					<Text>Procedura</Text>
					<PleaseWork 
						HandleProcedure={HandleProcedure}
					/>
				</View>
				<View style={`
						flex: 3;
						height: '100%'; 
						justify-content: 'space-between';
						margin-left: 16px;
					`}>
					<Text>Temperatura docelowa</Text>
					<LineEdit 
						on={HandleTemperature} 
						text={
							isNaN(options.temperature) ? '' : options.temperature.toString()
						} 
					/>
				</View>
				{advanced ? <LineEdit style={"min-height: 2rem"}/> : <Text />}
			</View>
		</>
	)
}

const InputStyle = `
	flex-direction: 'row';
	align-items: 'center';
	justify-content: 'space-between';
`


const ViewStyle = `
	font-size: 32px;
	height: 40px;
	justify-content: 'center'; 
	align-items: 'center';
`


export default OptionsView
