
import { LineEdit, View } from "@nodegui/react-nodegui";
import React, { useState, useCallback } from "react";

export type OptionsModel = {
	temperature?: number
}

const OptionsView = () => {
	return (
		<View>
			<LineEdit style={"min-height: 2rem"}/>
		</View>
	)
}

export default OptionsView
